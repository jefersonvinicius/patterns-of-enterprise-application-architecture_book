import { before, describe, it } from 'node:test';
import { Artist, ArtistMapper } from './artists';
import { startDb } from './db';
import { Track, TrackMapper } from './tracks';
import assert from 'assert';
import exp from 'constants';

describe('ArtistMapper', async () => {
  let sut: ArtistMapper;

  before(async () => {
    await startDb().catch(console.error);
    sut = new ArtistMapper();
  });

  it('should insert artist', async () => {
    const artist = new Artist(Artist.NO_ID, 'Jeferson');
    const inserted = await sut.insert(artist);
    assert.deepStrictEqual(inserted, new Artist(2, 'Jeferson'));
  });
});

describe('TrackMapper', async () => {
  let sut: TrackMapper;

  before(async () => {
    await startDb().catch(console.error);
    sut = new TrackMapper();
  });

  it('should find track', async () => {
    const found = await sut.find(1);
    const expected = new Track(1, 'Once', 'http://url-to-song/fake.mp3', 1);
    assert.deepStrictEqual(found, expected);
  });

  it('should find tracks for album', async () => {
    const tracks = await sut.findForAlbum(1);
    const expected = [
      new Track(1, 'Once', 'http://url-to-song/fake.mp3', 1),
      new Track(2, 'Even Flow', 'http://url-to-song/fake.mp3', 1),
      new Track(3, 'Alive', 'http://url-to-song/fake.mp3', 1),
      new Track(4, 'Why Go', 'http://url-to-song/fake.mp3', 1),
      new Track(5, 'Black', 'http://url-to-song/fake.mp3', 1),
      new Track(6, 'Jeremy', 'http://url-to-song/fake.mp3', 1),
      new Track(7, 'Oceans', 'http://url-to-song/fake.mp3', 1),
      new Track(8, 'Porch', 'http://url-to-song/fake.mp3', 1),
      new Track(9, 'Garden', 'http://url-to-song/fake.mp3', 1),
      new Track(10, 'Deep', 'http://url-to-song/fake.mp3', 1),
      new Track(11, 'Release', 'http://url-to-song/fake.mp3', 1),
    ];
    assert.deepStrictEqual(tracks, expected);
  });
});

// async function main() {
//   await startDb();
//   const artistMapper = new ArtistMapper();
//   const tracksMapper = new TrackMapper();
//   console.log('----- artists insertion');

//   console.log('---- artist find');
//   console.log({ found: await artistMapper.find(inserted.id) });

//   console.log('---- track find');
//   console.log({ found: await tracksMapper.find(1) });

//   console.log('---- find album tracks');
//   console.log({ album: await tracksMapper.findForAlbum(1) });
// }

// main();
