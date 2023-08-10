import { Entity } from './orders';

export interface UniOfWork {
  registerNew(entity: Entity): void;
  registerRemoved(entity: Entity): void;
  registerDirty(entity: Entity): void;
  commit(): Promise<void>;
}
