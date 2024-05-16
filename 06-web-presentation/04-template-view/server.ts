import http from 'http';
import handlerbars from 'handlebars';
import fs from 'fs/promises';

const httpServer = http.createServer(async (request, response) => {
  const data = {
    match: {
      teamA: { name: 'Cruzeiro', score: 2 },
      teamB: { name: 'Atlético', score: 1 },
    },
    playersA: [
      { name: 'Fábio', shirtNumber: 1 },
      { name: 'Dedé', shirtNumber: 26 },
      { name: 'Manoel', shirtNumber: 27 },
      { name: 'Egídio', shirtNumber: 6 },
      { name: 'Henrique', shirtNumber: 8 },
      { name: 'Lucas Silva', shirtNumber: 16 },
      { name: 'Robinho', shirtNumber: 19 },
      { name: 'Thiago Neves', shirtNumber: 10 },
      { name: 'Rafinha', shirtNumber: 18 },
      { name: 'Fred', shirtNumber: 9 },
      { name: 'David', shirtNumber: 11 },
    ],
    playersB: [
      { name: 'Victor', shirtNumber: 1 },
      { name: 'Réver', shirtNumber: 4 },
      { name: 'Leonardo Silva', shirtNumber: 3 },
      { name: 'Fábio Santos', shirtNumber: 6 },
      { name: 'Adilson', shirtNumber: 21 },
      { name: 'Elias', shirtNumber: 7 },
      { name: 'Luan', shirtNumber: 27 },
      { name: 'Cazares', shirtNumber: 10 },
      { name: 'Chará', shirtNumber: 8 },
      { name: 'Ricardo Oliveira', shirtNumber: 9 },
      { name: 'Hulk', shirtNumber: 7 },
    ],
  };
  const content = await fs.readFile('./template-view.hbs');
  const template = handlerbars.compile(content.toString());
  const html = template(data);
  return response.end(html);
});

httpServer.listen(3333, () => {
  console.log('Serving at http://localhost:3333');
});
