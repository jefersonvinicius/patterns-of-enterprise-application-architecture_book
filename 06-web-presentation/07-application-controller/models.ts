export enum AssetStatus {
  OnLease = 'ON_LEASE',
  InInventory = 'IN_INVENTORY',
}

export class Asset {
  static assets: Asset[] = [
    new Asset(1, 'Asset 1', AssetStatus.InInventory),
    new Asset(2, 'Asset 2', AssetStatus.OnLease),
  ];

  constructor(readonly id: number, readonly name: string, public status: AssetStatus) {}

  static find(id: number) {
    return this.assets.find((asset) => asset.id === Number(id));
  }

  save() {
    Asset.assets = Asset.assets.map((asset) => {
      if (asset.id === this.id) return this;
      return asset;
    });
  }
}
