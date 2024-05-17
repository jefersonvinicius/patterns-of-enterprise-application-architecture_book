import express, { Request, Response } from 'express';
import handlebars from 'handlebars';
import fs from 'node:fs';
import { Artist } from './models';

class ArtistsPageController {
  doGet(request: Request, response: Response) {
    const artists = Artist.list();
    return response.render('artists', { artists });
  }
}

class ArtistDetailsPageController {
  doGet(request: Request, response: Response) {
    const artist = Artist.findById(Number(request.params.id));
    if (!artist) return response.render('artist-notfound');
    return response.render('artist', { artist });
  }
}

const artistsController = new ArtistsPageController();
const artistDetailsController = new ArtistDetailsPageController();

const app = express();
app.engine('hbs', function (path, options, callback) {
  fs.readFile(path, (err, data) => {
    if (err) return callback(err);
    const template = data.toString();
    const render = handlebars.compile(template);
    return callback(null, render(options));
  });
});
app.set('views', './views');
app.set('view engine', 'hbs');
app.get('/artists', artistsController.doGet);
app.get('/artists/:id', artistDetailsController.doGet);

app.listen(3333, () => {
  console.log('Serving at http://localhost:3333');
});
