import { Artist, ArtistMapper } from './artist';
import { startDb } from './db';

async function main() {
  await startDb();
  console.log('----- insertion');
  const artistMapper = new ArtistMapper();
  const artist = new Artist(Artist.NO_ID, 'Jeferson');
  const inserted = await artistMapper.insert(artist);
  console.log({ inserted });

  console.log('---- find');
  console.log({ found: await artistMapper.find(inserted.id) });
}

main();
