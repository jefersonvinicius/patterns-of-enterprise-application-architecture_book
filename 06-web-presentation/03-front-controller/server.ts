import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import handlebars from 'handlebars';
import { Artist } from './models';
import regexparam from 'regexparam';

type Context<I = any> = {
  input: I;
};

interface Command<I = undefined, O = void> {
  execute(context: Context<I>): Promise<O>;

  get view(): string;
}

class Route {
  private regexParam = regexparam.parse(this.url);

  constructor(readonly method: string, readonly url: string, readonly commandClass: new () => Command) {}

  match(url?: string) {
    if (!url) return false;
    return this.regexParam.pattern.test(url);
  }

  getUrlParams(url: string) {
    const params = this.regexParam.pattern.exec(url);
    const result = this.regexParam.keys.reduce((accumulator, current, index) => {
      accumulator[current] = params?.[++index] || null;
      return accumulator;
    }, {} as Record<string, string | null>);
    return result;
  }
}

class ViewArtistsCommand implements Command<undefined, { artists: Artist[] }> {
  async execute(_: Context<undefined>): Promise<{ artists: Artist[] }> {
    const artists = Artist.list();
    return { artists };
  }

  get view(): string {
    return 'artists';
  }
}

class ViewArtistDetailsCommand implements Command<{ id: string }, { artist: Artist | undefined }> {
  private artist?: Artist;

  async execute(context: Context<{ id: string }>): Promise<{ artist: Artist | undefined }> {
    this.artist = Artist.findById(Number(context.input.id));
    return { artist: this.artist };
  }

  get view(): string {
    return this.artist ? 'artist' : 'artist-notfound';
  }
}

class FrontController {
  private routes: Route[] = [];

  get(url: string, command: new () => Command<any, any>) {
    return this.routes.push(new Route('GET', url, command));
  }

  handle = async (request: http.IncomingMessage, response: http.ServerResponse) => {
    const route = this.routes.find((r) => r.method === request.method && r.match(request.url));
    if (!route) return response.end(await this.renderView('notfound'));
    const context: Context = { input: { ...request.headers, ...route.getUrlParams(request.url!) } };
    const command = new route.commandClass();
    const output = await command.execute(context);
    return response.end(await this.renderView(command.view, output));
  };

  private async renderView(view: string, data?: any) {
    const content = await fs.readFile(path.resolve(__dirname, 'views', view + '.hbs'));
    const template = handlebars.compile(content.toString());
    return template(data);
  }
}

const frontController = new FrontController();
frontController.get('/artists', ViewArtistsCommand);
frontController.get('/artists/:id', ViewArtistDetailsCommand);

const server = http.createServer(frontController.handle);

server.listen(3333, () => {
  console.log('Serving at http://localhost:3333');
});
