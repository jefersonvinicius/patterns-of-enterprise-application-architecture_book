import express from 'express';
import fs from 'fs';
import Handlebars from 'handlebars';
import { Controller } from './src/controller';

const app = express();

app.engine('hbs', function (path, options, callback) {
  fs.readFile(path, (err, data) => {
    if (err) return callback(err);
    const template = data.toString();
    const render = Handlebars.compile(template);
    return callback(null, render(options));
  });
});
app.set('views', './src');
app.set('view engine', 'hbs');

app.get('/students/:id', Controller.handle);

app.listen(3000, () => {
  console.log('Serving...');
});
