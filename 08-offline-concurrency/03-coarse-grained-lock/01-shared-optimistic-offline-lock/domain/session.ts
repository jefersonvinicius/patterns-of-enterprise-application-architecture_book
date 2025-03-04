import { Version } from './version';

class IdentityMap {
  private versions = new Map<number, Version>();
  getVersion(id: number) {
    return this.versions.get(id) ?? null;
  }

  putVersion(version: Version) {
    return this.versions.set(version.id, version);
  }

  hasVersion(id: number) {
    return this.versions.has(id);
  }

  // Testing purposes
  clear() {
    this.versions.clear();
  }
}

export class AppSessionManager {
  private static _identityMap: IdentityMap | null;
  static get identityMap() {
    if (!this._identityMap) {
      this._identityMap = new IdentityMap();
    }
    return this._identityMap;
  }
}
