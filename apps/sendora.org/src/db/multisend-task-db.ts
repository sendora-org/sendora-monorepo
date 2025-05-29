import Dexie, { type Table } from 'dexie';
import type {
  Hex,
  IMultisendTask,
  IMultisendTaskItem,
} from './multisend-task-models';

export class MultisendTaskDB extends Dexie {
  multisendTasks!: Table<IMultisendTask, Hex>;
  multisendTaskItems!: Table<IMultisendTaskItem, [string, number]>;

  constructor() {
    super('multisend-task-db');

    // pk & indexes
    this.version(1).stores({
      multisendTasks:
        'id,chain_id,token_address,signing_mode,connected_wallet_address,status,created_at',
      multisendTaskItems:
        '[batch_id+position],[batch_id+status],[batch_id+status+updated_at],batch_id,position,tx_status,tx_confirmed_at,tx_sent_at,status,created_at,updated_at',
    });
  }
}

export const multisendTaskDb = new MultisendTaskDB();
