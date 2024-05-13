import http from 'node:http';
import path from 'node:path';
import invariant from 'tiny-invariant';
import handlebars from 'handlebars';
import fs from 'node:fs/promises';

interface DomainCommand<I = undefined, O = void> {
  run(input: I): Promise<O>;
  newInstance(): DomainCommand<I, O>;
}

class GatherReturnDetailsCommand implements DomainCommand {
  async run(input: undefined): Promise<void> {}

  newInstance(): DomainCommand<undefined, void> {
    return new GatherReturnDetailsCommand();
  }
}

class NullAssetCommand implements DomainCommand {
  async run(input: undefined): Promise<void> {}

  newInstance(): DomainCommand<undefined, void> {
    return new GatherReturnDetailsCommand();
  }
}

class InventoryDamageCommand implements DomainCommand {
  async run(input: undefined): Promise<void> {}

  newInstance(): DomainCommand<undefined, void> {
    return new GatherReturnDetailsCommand();
  }
}

class LeaseDamageCommand implements DomainCommand {
  async run(input: undefined): Promise<void> {}

  newInstance(): DomainCommand<undefined, void> {
    return new GatherReturnDetailsCommand();
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

enum AssetStatus {
  OnLease = 'ON_LEASE',
  InInventory = 'IN_INVENTORY',
}

class Asset {
  static assets: Asset[] = [
    new Asset(1, 'Asset 1', AssetStatus.InInventory),
    new Asset(2, 'Asset 2', AssetStatus.OnLease),
  ];

  constructor(readonly id: number, readonly name: string, readonly status: AssetStatus) {}

  static find(id: number) {
    return this.assets.find((asset) => asset.id === Number(id));
  }
}

class AssetApplicationController implements ApplicationController {
  getDomainCommand<I extends Record<string, any>, O>(command: string, input: I): DomainCommand<I, O> {
    console.log(Array.from(this.events.entries()));
    const response = this.getResponse(command, this.getAssetStatus(input));
    invariant(response, 'Response to get domain command not found');
    return response.getDomainCommand() as DomainCommand<I, O>;
  }

  getView<I>(command: string, input: I): string {
    const response = this.getResponse(command, this.getAssetStatus(input));
    invariant(response, 'Response to get view not found');
    return response.view;
  }

  addResponse(command: string, state: AssetStatus, domainCommand: DomainCommand, view: string) {
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
    appController.addResponse('damage', AssetStatus.OnLease, new InventoryDamageCommand(), 'inventoryDamage');
    appController.addResponse('damage', AssetStatus.InInventory, new LeaseDamageCommand(), 'leaseDamage');
  }

  private getAssetStatus(input: Record<string, any>): AssetStatus {
    const id = input.assetID;
    if (!id) throw new Error('assetID not provided');
    const asset = Asset.find(id);
    if (!asset) throw new Error(`Asset ${id} not found`);
    return asset.status;
  }

  private events = new Map<string, Response<any, any>>();
  private getResponse(command: string, state: AssetStatus) {
    console.log({ command, state });
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
    console.log({ command });
    if (!command) {
      response.writeHead(404);
      response.end(`Command ${command} not provided`);
      return;
    }

    const input = Object.fromEntries(this.url.searchParams.entries());
    console.log({ body: input });
    const domainCommand = appController.getDomainCommand(command, input);
    console.log({ domainCommand });
    if (!domainCommand) {
      response.writeHead(404);
      response.end(`Command not found`);
      return;
    }

    domainCommand.run(input);

    const view = appController.getView(command, input);
    const fullpath = path.resolve(__dirname, 'views', view + '.hbs');
    const template = await fs.readFile(fullpath);
    const render = handlebars.compile(template.toString());
    const html = render({});
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
  console.log('Serving at port 3333...');
});
