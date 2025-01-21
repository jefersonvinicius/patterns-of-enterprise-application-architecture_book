import { randomUUID } from 'node:crypto';
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

// Dummy class to emulate app Session
export class AppSession {
  readonly id = randomUUID();
}

export class AppSessionManager {
  private static _identityMap: IdentityMap | null;
  static get identityMap() {
    if (!this._identityMap) {
      this._identityMap = new IdentityMap();
    }
    return this._identityMap;
  }

  private static _session: AppSession | null = null;

  static get session() {
    if (!this._session) {
      this._session = new AppSession();
    }
    return this._session;
  }
}
