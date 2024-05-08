import express, { Request, Response } from 'express';

interface DomainCommand<I = undefined, O = void> {
  run(input: I): Promise<O>;
}

class ControllerResponse {
  constructor(readonly command: DomainCommand, readonly view: string) {}

  getDomainCommand() {
    return this.command;
  }

  getViewUrl() {
    return this.view;
  }
}

interface ApplicationController {
  getDomainCommand<I, O>(): DomainCommand<I, O>;
  getView(): string;
}

class AssetApplicationController implements ApplicationController {
  getDomainCommand<I, O>(): DomainCommand<I, O> {
    throw new Error('Method not implemented.');
  }
  getView(): string {
    throw new Error('Method not implemented.');
  }
}

class FrontController {
  serve(request: Request, response: Response) {}
}

const frontController = new FrontController();

const app = express();
app.get('/assets/:assetId', frontController.serve);
