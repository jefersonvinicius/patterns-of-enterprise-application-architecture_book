import { AlbumMapper } from './album';

type MapperRegistryConfiguration = {
  album: AlbumMapper;
};

export class MapperRegistry {
  static album: AlbumMapper;

  static configure(configurations: MapperRegistryConfiguration) {
    this.album = configurations.album;
  }
}
