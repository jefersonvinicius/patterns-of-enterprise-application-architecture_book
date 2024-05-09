import http from 'node:http';

interface DomainCommand<I = undefined, O = void> {
  run(input: I): Promise<O>;
  newInstance(): DomainCommand<I, O>;
}

class Response {
  constructor(readonly command: DomainCommand, readonly view: string) {}

  getDomainCommand() {
    return this.command.newInstance();
  }

  getViewUrl() {
    return this.view;
  }
}

interface ApplicationController {
  getDomainCommand<I, O>(command: string, input: I): DomainCommand<I, O>;
  getView(): string;
}

enum AssetStatus {
  OnLease = 'ON_LEASE',
  IN_INVENTORY = 'IN_INVENTORY',
}

class Asset {
  static assets: Asset[] = [];

  constructor(readonly id: number, readonly status: AssetStatus) {}

  static find(id: number) {
    return this.assets.find((asset) => asset.id === id);
  }
}

class AssetApplicationController implements ApplicationController {
  getDomainCommand<I, O>(command: string, input: I): DomainCommand<I, O> {
    const response = this.getResponse(command, this.getAssetStatus(input));
  }

  getView(): string {
    throw new Error('Method not implemented.');
  }

  private getAssetStatus(input: Record<string, any>): AssetStatus {
    const id = input.assetID;
    if (!id) throw new Error('assetID not provided');
    const asset = Asset.find(id);
    if (!asset) throw new Error(`Asset ${id} not found`);
    return asset.status;
  }

  private map = new Map<string, Map<AssetStatus, any>>();
  private getResponse(command: string, state: AssetStatus) {
    return this.getResponseMap(command)?.get(state);
  }

  private getResponseMap(key: string) {
    return this.map.get(key);
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

    const body = await this.parseJSONBodyOf(request);
    const domainCommand = appController.getDomainCommand(command, body);
    if (!domainCommand) {
      response.writeHead(404);
      response.end(`Command not found`);
      return;
    }

    domainCommand.run(body);
    console.log({ domainCommand });

    response.end('Oi');
  }

  getApplicationController(request: http.IncomingMessage) {
    this._url = new URL(request.url!, `http://${request.headers.host}`);

    if (this.url.pathname.startsWith('/assets')) return new AssetApplicationController();

    return null;
  }

  private parseJSONBodyOf(request: http.IncomingMessage) {
    return new Promise((resolve, reject) => {
      const data: any[] = [];
      request.on('data', (chunk) => data.push(chunk));
      request.on('end', () => resolve(JSON.parse(data.join(''))));
      request.on('error', reject);
    });
  }
}

process.on('uncaughtException', (error, origin) => {});
process.on('unhandledRejection', (error, origin) => {});

const frontController = new FrontController();
const httpServer = http.createServer(frontController.serve.bind(frontController));

httpServer.listen(3333, () => {
  console.log('Serving at port 3333...');
});
