import http from 'node:http';
import path from 'node:path';
import invariant from 'tiny-invariant';
import handlebars from 'handlebars';
import fs from 'node:fs/promises';
import {
  DomainCommand,
  GatherReturnDetailsCommand,
  InventoryDamageCommand,
  LeaseDamageCommand,
  NullAssetCommand,
} from './commands';
import { Asset, AssetStatus } from './models';

class AppError extends Error {
  public metadata?: { statusCode: number };

  withMetadata(metadata: { statusCode: number }) {
    this.metadata = metadata;
    return this;
  }
}

class Response<I, O> {
  constructor(readonly command: DomainCommand<I, O>, readonly view: string) {}

  getDomainCommand() {
    return this.command.newInstance();
  }

  getViewUrl() {
    return this.view;
  }
}

interface ApplicationController {
  getDomainCommand<I extends Record<string, any>, O>(command: string, input: I): DomainCommand<I, O>;
  getView<I extends Record<string, any>>(command: string, input: I): string;
}

class AssetApplicationController implements ApplicationController {
  getDomainCommand<I extends Record<string, any>, O>(command: string, input: I): DomainCommand<I, O> {
    const response = this.getResponse(command, this.getAssetStatus(input));
    invariant(response, 'Response to get domain command not found');
    return response.getDomainCommand() as DomainCommand<I, O>;
  }

  getView<I extends Record<string, any>>(command: string, input: I): string {
    const response = this.getResponse(command, this.getAssetStatus(input));
    invariant(response, 'Response to get view not found');
    return response.view;
  }

  addResponse<I, O>(command: string, state: AssetStatus, domainCommand: DomainCommand<I, O>, view: string) {
    const eventKey = `${command}-${state}`;
    const response = new Response(domainCommand, view);
    if (!this.events.has(eventKey)) {
      this.events.set(eventKey, response);
    }
  }

  private static instance: AssetApplicationController | null;

  static getDefault() {
    if (!this.instance) this.instance = new AssetApplicationController();
    return this.instance;
  }

  static loadApplicationController() {
    const appController = AssetApplicationController.getDefault();
    appController.addResponse('return', AssetStatus.OnLease, new GatherReturnDetailsCommand(), 'return');
    appController.addResponse('return', AssetStatus.InInventory, new NullAssetCommand(), 'illegalAction');
    appController.addResponse('damage', AssetStatus.InInventory, new InventoryDamageCommand(), 'inventoryDamage');
    appController.addResponse('damage', AssetStatus.OnLease, new LeaseDamageCommand(), 'leaseDamage');
  }

  private getAssetStatus(input: Record<string, any>): AssetStatus {
    const id = input.assetID;
    if (!id) throw new AppError('assetID not provided').withMetadata({ statusCode: 400 });
    const asset = Asset.find(id);
    if (!asset) throw new AppError(`Asset ${id} not found`).withMetadata({ statusCode: 404 });
    return asset.status;
  }

  private events = new Map<string, Response<any, any>>();
  private getResponse(command: string, state: AssetStatus) {
    return this.events.get(`${command}-${state}`);
  }
}

class FrontController {
  private _url: URL | null = null;

  private get url() {
    if (!this._url) throw new Error('url not initialized');
    return this._url;
  }

  async serve(request: http.IncomingMessage, response: http.ServerResponse) {
    const appController = this.getApplicationController(request);
    if (!appController) {
      response.writeHead(404);
      response.end(`Not found controller for ${this.url.pathname}`);
      return;
    }

    const command = this.url.searchParams.get('command');
    if (!command) {
      response.writeHead(404);
      response.end(`Command ${command} not provided`);
      return;
    }

    const input = Object.fromEntries(this.url.searchParams.entries());
    const domainCommand = appController.getDomainCommand(command, input);
    if (!domainCommand) {
      response.writeHead(404);
      response.end(`Command not found`);
      return;
    }

    const view = appController.getView(command, input);
    const ouput = await domainCommand.run(input);

    const fullpath = path.resolve(__dirname, 'views', view + '.hbs');
    const template = await fs.readFile(fullpath);
    const render = handlebars.compile(template.toString());
    const html = render(ouput);
    response.end(html);
  }

  getApplicationController(request: http.IncomingMessage) {
    this._url = new URL(request.url!, `http://${request.headers.host}`);
    if (this.url.pathname.startsWith('/assets')) return AssetApplicationController.getDefault();
    return null;
  }
}

AssetApplicationController.loadApplicationController();
const frontController = new FrontController();
const httpServer = http.createServer(async (request, response) => {
  try {
    return await frontController.serve(request, response);
  } catch (error: any) {
    console.error(error);
    response.writeHead(500);
    return response.end(error?.message || 'Unknown Error');
  }
});

httpServer.listen(3333, () => {
  console.log('Serving at port 3333');
});
