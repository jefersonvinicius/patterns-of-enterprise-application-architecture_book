import invariant from 'tiny-invariant';
import { Asset, AssetStatus } from './models';

export interface DomainCommand<I = undefined, O = void> {
  run(input: I): Promise<O>;
  newInstance(): DomainCommand<I, O>;
}

export class GatherReturnDetailsCommand implements DomainCommand<{ assetID: string }, { asset: Asset }> {
  async run(input: { assetID: string }): Promise<{ asset: Asset }> {
    const asset = Asset.find(Number(input.assetID));
    invariant(asset, `Asset ${input.assetID} not found`);
    asset.status = AssetStatus.InInventory;
    asset.save();
    return { asset };
  }

  newInstance(): DomainCommand<{ assetID: string }, { asset: Asset }> {
    return new GatherReturnDetailsCommand();
  }
}

export class NullAssetCommand implements DomainCommand {
  async run(input: undefined): Promise<void> {}

  newInstance(): DomainCommand<undefined, void> {
    return new NullAssetCommand();
  }
}

export class InventoryDamageCommand implements DomainCommand<{ assetID: string }, { asset: Asset }> {
  async run(input: { assetID: string }): Promise<{ asset: Asset }> {
    const asset = Asset.find(Number(input.assetID));
    invariant(asset, `Asset ${input.assetID} not found`);
    return { asset };
  }

  newInstance(): DomainCommand<{ assetID: string }, { asset: Asset }> {
    return new InventoryDamageCommand();
  }
}

export class LeaseDamageCommand implements DomainCommand<{ assetID: string }, { asset: Asset }> {
  async run(input: { assetID: string }): Promise<{ asset: Asset }> {
    const asset = Asset.find(Number(input.assetID));
    invariant(asset, `Asset ${input.assetID} not found`);
    return { asset };
  }

  newInstance(): DomainCommand<{ assetID: string }, { asset: Asset }> {
    return new LeaseDamageCommand();
  }
}
