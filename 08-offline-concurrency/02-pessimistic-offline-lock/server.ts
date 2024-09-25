import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { ExclusiveReadLockManager } from './locking';
import { CustomerMapper } from './domain/mappers';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';

import database from './infra/database';

class AppSession {
  constructor(readonly id: string, readonly user: string) {}
}

class LockRemover {
  constructor(request: Request, readonly ownerId: string) {
    request.on('end', () => {
      console.log('REQUEST END');
      // ExclusiveReadLockManager.getInstance().releaseAllLock(ownerId);
    });
  }
}

class AppSessionManager {
  private static appSessionManagers = new Map<string, AppSessionManager>();

  static getFor(request: Request) {
    let appSessionManager = this.appSessionManagers.get(request.sessionID);
    if (!appSessionManager) {
      appSessionManager = new AppSessionManager();
      this.appSessionManagers.set(request.sessionID, appSessionManager);
    }
    return appSessionManager;
  }

  private session: AppSession | null = null;

  setSession(session: AppSession) {
    this.session = session;
  }

  getSession() {
    return this.session;
  }
}

declare module 'express-session' {
  interface SessionData {
    username: string;
    appSession: AppSession;
    lockRemover: LockRemover;
  }
}

const SECRET = 'secred';

const app = express();
app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', engine({ defaultLayout: false }));
app.set('view engine', 'handlebars');
app.set('views', './views');

interface Command {
  init(request: Request, response: Response): Promise<void>;
  process(): Promise<void>;
}

abstract class BusinessTransactionCommand implements Command {
  protected request!: Request;
  protected response!: Response;
  protected appSessionManager!: AppSessionManager;

  constructor() {}

  async init(request: Request, response: Response): Promise<void> {
    this.request = request;
    this.response = response;
    this.appSessionManager = AppSessionManager.getFor(request);
  }

  protected async startNewBusinessTransaction() {
    const sessionID = this.request.sessionID;
    let appSession = this.request.session.appSession;
    if (appSession) {
      await ExclusiveReadLockManager.getInstance().releaseAllLock(appSession.user);
    }
    if (!this.request.session.username) throw new Error('User need to be authenticated to start transaction');
    appSession = new AppSession(sessionID, this.request.session.username);
    this.appSessionManager.setSession(appSession);
    this.request.session.appSession = appSession;
    this.request.session.lockRemover = new LockRemover(this.request, appSession.user);
  }

  protected async continueBusinessTransaction() {
    const appSession = this.request.session.appSession;
    if (!appSession) throw new Error('Not app session available to continue');
    this.appSessionManager.setSession(appSession);
  }

  async process(): Promise<void> {}
}

export class TransactionalCommand implements Command {
  constructor(readonly commandImpl: Command) {}

  async init(request: Request, response: Response): Promise<void> {
    await this.commandImpl.init(request, response);
  }

  async process(): Promise<void> {
    console.log('Start transaction');
    try {
      await this.commandImpl.process();
    } catch (error) {
      console.log('Rollback');
      throw error;
    }
  }
}

class Controller {
  private commands = new Map<string, new () => Command>();

  handle(commandName: string) {
    const CommandClass = this.commands.get(commandName);
    if (!CommandClass) throw new Error(`Command ${commandName} not found`);
    const command = new CommandClass();
    const transactionalCommand = new TransactionalCommand(command);
    return async (request: Request, response: Response) => {
      await transactionalCommand.init(request, response);
      await transactionalCommand.process();
    };
  }

  addCommand(commandName: string, CommandClass: new () => Command) {
    this.commands.set(commandName, CommandClass);
  }
}

const customerMapper = new CustomerMapper();

class EditCustomerCommand extends BusinessTransactionCommand {
  async process(): Promise<void> {
    await this.startNewBusinessTransaction();
    const { id } = this.request.params;
    try {
      await ExclusiveReadLockManager.getInstance().acquireLock(id, this.appSessionManager.getSession()?.user!);
    } catch (error) {
      console.log(error);
      return this.response.render('locked', { resource: 'customer', id });
    }
    const customer = await customerMapper.find(Number(id));
    if (!customer) {
      return this.response.render('404');
    }
    return this.response.render('edit', { customer });
  }
}

class SaveCustomerCommand extends BusinessTransactionCommand {
  async process(): Promise<void> {
    await this.startNewBusinessTransaction();
    const { id } = this.request.params;
    const { name } = this.request.body;
    await ExclusiveReadLockManager.getInstance().releaseLock(id, this.appSessionManager.getSession()?.user!);

    const customer = await customerMapper.find(Number(id));
    if (!customer) return this.response.render('404');

    customer.name = name;
    await customerMapper.update(customer);
    return this.response.redirect('/customer_saved');
  }
}

class ViewHomeCommand extends BusinessTransactionCommand {
  async process(): Promise<void> {
    await this.startNewBusinessTransaction();
    const customers = await customerMapper.list();
    return this.response.render('home', { username: this.request.session.username, customers });
  }
}

class ViewCustomerSavedCommand extends BusinessTransactionCommand {
  async process(): Promise<void> {
    await this.startNewBusinessTransaction();
    return this.response.render('customer-saved');
  }
}

function secureRoute(request: Request, response: Response, next: NextFunction) {
  if (!request.session.username) return response.redirect('/login');
  next();
}

function view(viewName: string) {
  return (_: Request, response: Response) => {
    return response.render(viewName);
  };
}

const controller = new Controller();
controller.addCommand('edit', EditCustomerCommand);
controller.addCommand('save', SaveCustomerCommand);
controller.addCommand('home', ViewHomeCommand);
controller.addCommand('customerSaved', ViewCustomerSavedCommand);

app.use((_, response, next) => {
  response.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
app.get('/edit/:id', secureRoute, controller.handle('edit'));
app.post('/edit/:id', secureRoute, controller.handle('save'));
app.get('/home', secureRoute, controller.handle('home'));
app.get('/customer_saved', secureRoute, controller.handle('customerSaved'));

app.post('/login', (request, response) => {
  request.session.username = request.body.username;
  return response.redirect('/home');
});
app.get('/login', view('login'));

async function bootstrap() {
  await database.start();
  app.listen(3333, () => {
    console.log('Server running http://localhost:3333');
  });
}

bootstrap();
