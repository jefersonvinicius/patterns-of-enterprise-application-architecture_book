import { Album } from './src/domain/Album';
import { Artist } from './src/domain/Artist';
import { Track } from './src/domain/Track';

const nothingButThieves = new Artist('Nothing But Thieves');

const tracks = [
  new Track('Welcome to the DCC', [nothingButThieves]),
  new Track('Overcome', [nothingButThieves]),
  new Track('Tomorrow Is Closed', [nothingButThieves]),
  new Track('Keeping You Around', [nothingButThieves]),
  new Track('City Haunts', [nothingButThieves]),
  new Track('Do You Love Me Yet?', [nothingButThieves]),
  new Track('Members Only', [nothingButThieves]),
  new Track('Green Eyes :: Siena', [nothingButThieves]),
  new Track('Foreign Language', [nothingButThieves]),
  new Track('Talking to Myself', [nothingButThieves]),
  new Track('Pop the Balloon', [nothingButThieves]),
];

const deadClubCity = new Album('Dead Club City', tracks, nothingButThieves);

class AlbumDTO {
  title?: string;
  artist?: string;
  tracks?: TrackDTO[];
}

class TrackDTO {
  title?: string;
  performers?: string[];
}

class AlbumAssembler {
  writeDTO(album: Album) {
    const result = new AlbumDTO();
    result.title = album.title;
    result.artist = album.artist.name;
    this.writeTracks(result, album);
    return result;
  }

  private writeTracks(result: AlbumDTO, album: Album) {
    const trackDTOs: TrackDTO[] = [];
    for (const track of tracks) {
      const dto = new TrackDTO();
      dto.title = track.title;
      this.writePerformers(dto, track);
      trackDTOs.push(dto);
    }
    result.tracks = trackDTOs;
  }

  private writePerformers(result: TrackDTO, track: Track) {
    const performers: string[] = [];
    for (const artist of track.artists) {
      performers.push(artist.name);
    }
    result.performers = performers;
  }
}

const albumAssembler = new AlbumAssembler();

console.log(deadClubCity);
console.log(albumAssembler.writeDTO(deadClubCity));
console.log(JSON.stringify(albumAssembler.writeDTO(deadClubCity), null, 4));
