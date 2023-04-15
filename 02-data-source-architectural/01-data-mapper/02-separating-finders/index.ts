import { Artist, ArtistMapper } from './artists';
import { startDb } from './db';
import { TrackMapper } from './tracks';

async function main() {
  await startDb();
  const artistMapper = new ArtistMapper();
  const tracksMapper = new TrackMapper();
  console.log('----- artists insertion');
  const artist = new Artist(Artist.NO_ID, 'Jeferson');
  const inserted = await artistMapper.insert(artist);
  console.log({ inserted });

  console.log('---- artist find');
  console.log({ found: await artistMapper.find(inserted.id) });

  console.log('---- track find');
  console.log({ found: await tracksMapper.find(1) });

  console.log('---- find album tracks');
  console.log({ album: await tracksMapper.findForAlbum(1) });
}

main();
