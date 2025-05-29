import {
  MultisendTaskItemStatus,
  MultisendTaskStatus,
  SigningMode,
  TransactionStatus,
  multisendTaskDb as db,
} from '@/db/databases';
import type { Hex, IMultisendTask, IMultisendTaskItem } from '@/db/databases';
import { getErrorMessage } from '@/libs/common';
import { Subject, firstValueFrom, map, race, take, timer } from 'rxjs';
import { keccak256 } from 'viem';

// mock
const mockTaskId: Hex = `0x${'a'.repeat(64)}`;
const mockLeaf: Hex = `0x${'b'.repeat(64)}`;
const merkle_root: Hex = `0x${'e'.repeat(64)}`;
const mockProof: Hex[] = [`0x${'c'.repeat(64)}`, `0x${'d'.repeat(64)}`];

const mockTask: IMultisendTask = {
  id: mockTaskId,
  merkle_root: merkle_root,
  chain_id: 1,
  contract_to: '0x1111111111111111111111111111111111111111',
  contract_method: 'distributeTokens(bytes32,bytes32[],uint256[])',
  token_address: '0x2222222222222222222222222222222222222222',
  token_decimal: 18,
  token_symbol: 'USDC',
  referrer_address: '0x3333333333333333333333333333333333333333',
  referrer_eligible: true,
  tool_fee: '5000000000000000', // 0.005 ETH
  gas_limit: '21000',
  gas_price: '1000000000', // 1 gwei
  pricing_currency: 'USD',
  rate: '1500000000000000000', // 1.5 USD/Token
  total_recipients: 2,
  total_transactions: 2,
  total_pricing_amount: '3000000000000000000',
  total_token_amount: '2000000',
  signing_mode: SigningMode.Wallet,
  session_key: null,
  signer_address: '0x4444444444444444444444444444444444444444',
  funding_wallet_address: '0x5555555555555555555555555555555555555555',
  connected_wallet_address: '0x6666666666666666666666666666666666666666',
  status: MultisendTaskStatus.PENDING,
  created_at: Date.now(),
};

const mockTaskItem1: IMultisendTaskItem = {
  batch_id: mockTaskId,
  position: 0,
  recipients: ['0x7777777777777777777777777777777777777777'],
  amounts: ['1000000'], // 1 token
  proof: mockProof,
  leaf: mockLeaf,
  value: '25000000000000000', // 0.025 ETH
  total_recipients: 1,
  total_pricing_amount: '1500000000000000000', // $1.5
  total_token_amount: '1000000',
  tx_gas_limit: null,
  tx_gas_price: null,
  tx_hash: null,
  tx_gas_used: null,
  tx_gas_fee_cost: null,
  tx_status: null,
  tx_confirmed_at: null,
  tx_sent_at: null,
  status: MultisendTaskItemStatus.PENDING,
  created_at: Date.now(),

  updated_at: Date.now(),
  tx_error_reason: null,
  tx_nonce: null,
};

const mockTaskItem2: IMultisendTaskItem = {
  batch_id: mockTaskId,
  position: 1,
  recipients: ['0x9999999999999999999999999999999999999999'],
  amounts: ['1000000'],
  proof: mockProof,
  leaf: `0x${'f'.repeat(64)}`,
  value: '25000000000000000',
  total_recipients: 1,
  total_pricing_amount: '1500000000000000000',
  total_token_amount: '1000000',
  tx_gas_limit: null,
  tx_gas_price: null,
  tx_hash: null,
  tx_gas_used: null,
  tx_gas_fee_cost: null,
  tx_status: null,
  tx_confirmed_at: null,
  tx_sent_at: null,
  status: MultisendTaskItemStatus.PENDING,
  created_at: Date.now(),
  updated_at: Date.now(),
  tx_error_reason: null,
  tx_nonce: null,
};

export const mockData = {
  task: mockTask,
  taskItems: [mockTaskItem1, mockTaskItem2],
};

export const createMultisendTask = async (
  task: IMultisendTask,
  taskItems: IMultisendTaskItem[],
): Promise<Hex | null> => {
  let taskId: Hex | null = null;
  try {
    await db.transaction(
      'rw',
      db.multisendTasks,
      db.multisendTaskItems,
      async () => {
        // Insert task
        taskId = await db.multisendTasks.add(task);

        // Insert taskItems
        await db.multisendTaskItems.bulkAdd(taskItems);

        console.log(
          'Task and task items inserted successfully in one transaction.',
        );
      },
    );
  } catch (err) {
    console.error('createMultisendTask Transaction failed', err);
  }

  return taskId;
};

export const cancelMultisendTask = async (taskId: Hex): Promise<boolean> => {
  try {
    await db.transaction(
      'rw',
      db.multisendTasks,
      db.multisendTaskItems,
      async () => {
        // Cancel task
        const task = await db.multisendTasks.get(taskId); // Get the task by its ID
        if (task) {
          task.status = MultisendTaskStatus.CANCELED;
          await db.multisendTasks.put(task); // Update the task status in the database
        }
      },
    );
  } catch (err) {
    console.error('cancelMultisendTask Transaction failed', err);
    return false;
  }

  return true;
};

export const deleteMultisendTask = async (taskId: Hex): Promise<boolean> => {
  try {
    await db.transaction(
      'rw',
      db.multisendTasks,
      db.multisendTaskItems,
      async () => {
        // Delete task and its associated items
        const task = await db.multisendTasks.get(taskId); // Get the task by its ID
        if (task) {
          await db.multisendTasks.delete(task.id);
          await db.multisendTaskItems
            .where('batch_id')
            .equals(task.id)
            .delete();
        }
      },
    );
  } catch (err) {
    console.error('deleteMultisendTask Transaction failed', err);

    return false;
  }

  return true;
};

export async function dequeueTaskItem(
  taskId: Hex,
  status: MultisendTaskItemStatus,
  nextStatus: MultisendTaskItemStatus,
  timeThreshold = 0,
  tx_gas_limit?: string,
  tx_gas_price?: string,
  tx_nonce?: number,
): Promise<IMultisendTaskItem | null> {
  let selectedItem: IMultisendTaskItem | null = null;

  try {
    await db.transaction('rw', db.multisendTaskItems, async () => {
      const pendingItem = await db.multisendTaskItems
        .where('[batch_id+status+updated_at]')
        .between(
          [taskId, status, timeThreshold],
          [taskId, status, Number.POSITIVE_INFINITY],
          true,
          true,
        )
        .first();

      if (!pendingItem) return;

      await db.multisendTaskItems.update(
        [pendingItem.batch_id, pendingItem.position],
        {
          status: nextStatus,
          tx_nonce: tx_nonce ?? pendingItem.tx_nonce ?? null,
          tx_gas_price: tx_gas_price ?? pendingItem.tx_gas_price ?? null,
          tx_gas_limit: tx_gas_limit ?? pendingItem.tx_gas_limit ?? null,
        },
      );

      selectedItem = {
        ...pendingItem,
        tx_nonce: tx_nonce ?? pendingItem.tx_nonce ?? null,
        tx_gas_price: tx_gas_price ?? pendingItem.tx_gas_price ?? null,
        tx_gas_limit: tx_gas_limit ?? pendingItem.tx_gas_limit ?? null,
        status: nextStatus,
      };
    });
  } catch (err) {
    console.error('dequeueTaskItem Transaction failed', err);
  }
  return selectedItem;
}

/**
 *
 * Process tasks with status PENDING
 *
 * Pick a task → Mark as PROCESSING (transaction security)
 * Execute business logic
 * Success: Change status to COMMITTED.
 * Failure: Change status to FAILED.
 * Exception: The status stays at PROCESSING
 *
 *
 * Task Status Flowchart
 *
 * PENDING ➠ PROCESSING ➠ COMMITTED ➠ PROCESSING ➠ COMPLETED
 *
 * @param taskId
 * @param tx_gas_limit
 * @param tx_gas_price
 *
 */
export async function processPendingTaskItems(
  taskId: Hex,
  tx_gas_limit: string,
  tx_gas_price: string,
  tx_nonce: number,
  callback?: () => boolean,
) {
  let taskItem: IMultisendTaskItem | null;

  while (
    (callback?.() ?? true) &&
    (taskItem = await dequeueTaskItem(
      taskId,
      MultisendTaskItemStatus.PENDING,
      MultisendTaskItemStatus.PROCESSING,
      0,
      tx_gas_limit,
      tx_gas_price,
      tx_nonce,
    ))
  ) {
    console.log('📦 Processing item:', taskItem.batch_id, taskItem.position);

    try {
      // 👇 sendTransaction

      /***
       *
       * 1. Simulated tx
       * 2. Signing tx
       * 3. Submit tx
       */
      // await sendTransaction(taskItem);

      const updatedAt = Date.now();
      await db.multisendTaskItems.update(
        [taskItem.batch_id, taskItem.position],
        {
          tx_hash: '0x',
          status: MultisendTaskItemStatus.COMMITTED,
          tx_sent_at: updatedAt,
          updated_at: updatedAt,
        },
      );
    } catch (err) {
      console.error('❌ error => ', err);
      try {
        // ✅ Even in the face of failure, it should be documented as a failure status.
        await db.multisendTaskItems.update(
          [taskItem.batch_id, taskItem.position],
          {
            tx_error_reason: getErrorMessage(err),
            status: MultisendTaskItemStatus.FAILED,
          },
        );
      } catch (saveErr) {
        console.error('❗Status update failed (data may be stuck):', saveErr);
      }
    }
  }

  console.log('✅ processPendingTaskItems finished');
}

/**
 *
 * Process tasks with status COMMITTED
 *
 * Pick a task → Mark as PROCESSING (transaction security)
 * Execute business logic
 * Success: Change status to COMPLETED.
 * Failure scenario 1: Stuck on the chain → Rollback to COMMITTED.
 * Failure scenario 2: Transaction cannot be found → Rollback to PENDING.
 * Failure scenario 3: Others  →  Change status to FAILED.
 * Exception: The status stays at PROCESSING
 *
 * @param taskId
 *
 */
export async function processCommittedTaskItems(
  taskId: Hex,
  callback?: () => boolean,
) {
  let taskItem: IMultisendTaskItem | null;

  while (
    (callback?.() ?? true) &&
    (taskItem = await dequeueTaskItem(
      taskId,
      MultisendTaskItemStatus.COMMITTED,
      MultisendTaskItemStatus.PROCESSING,
    ))
  ) {
    console.log('📦 Processing item:', taskItem.batch_id, taskItem.position);

    try {
      // 👇 sendTransaction

      /***
       *
       * 1. Check if the transaction is in the RPC memory pool. viem client.getTransaction
       * The return of undefined from getTransaction simply indicates that "the RPC node currently connected cannot find the transaction.
       *
       * 2. Check if the transaction has been confirmed.  viem client.getTransactionReceipt
       */
      // await sendTransaction(taskItem);

      const updatedAt = Date.now();

      // Failure scenario 1: Stuck on the chain → Rollback to COMMITTED.
      await db.multisendTaskItems.update(
        [taskItem.batch_id, taskItem.position],
        {
          status: MultisendTaskItemStatus.COMMITTED,
          updated_at: updatedAt,
        },
      );

      // Failure scenario 2: Transaction cannot be found → Rollback to PENDING.
      await db.multisendTaskItems.update(
        [taskItem.batch_id, taskItem.position],
        {
          status: MultisendTaskItemStatus.PENDING,
          updated_at: updatedAt,
        },
      );

      // Success
      await db.multisendTaskItems.update(
        [taskItem.batch_id, taskItem.position],
        {
          status: MultisendTaskItemStatus.COMPLETED,
          tx_gas_used: '0',
          tx_gas_fee_cost: '0',
          tx_confirmed_at: updatedAt,
          updated_at: updatedAt,
        },
      );
    } catch (err) {
      console.error('❌ error => ', err);

      try {
        // ✅ Even in the face of failure, it should be documented as a failure status.
        await db.multisendTaskItems.update(
          [taskItem.batch_id, taskItem.position],
          {
            status: MultisendTaskItemStatus.FAILED,
          },
        );
      } catch (saveErr) {
        console.error('❗Status update failed (data may be stuck):', saveErr);
      }
    }
  }

  console.log('✅ processCommittedTaskItems finished.');
}

/**
 *
 * Process tasks with status PROCESSING & updated_at < now - 10 seconds
 *
 * Pick a task → Mark as PROCESSING (transaction security)
 * Execute business logic
 * Success: Change status to FAILED.
 * Exception: The status stays at PROCESSING
 *
 * @param taskId
 *
 */
export async function processProcessingTaskItems(
  taskId: Hex,
  callback?: () => boolean,
) {
  let taskItem: IMultisendTaskItem | null;

  const timeThreshold = Date.now() - 10 * 1000;

  while (
    (callback?.() ?? true) &&
    (taskItem = await dequeueTaskItem(
      taskId,
      MultisendTaskItemStatus.PROCESSING,
      MultisendTaskItemStatus.PROCESSING,
      timeThreshold,
    ))
  ) {
    console.log('📦 Processing item:', taskItem.batch_id, taskItem.position);

    try {
      const updatedAt = Date.now();
      await db.multisendTaskItems.update(
        [taskItem.batch_id, taskItem.position],
        {
          status: MultisendTaskItemStatus.FAILED,
          updated_at: updatedAt,
        },
      );
    } catch (err) {
      console.error('❌ error => ', err);

      try {
        // ✅ Even in the face of failure, it should be documented as a failure status.
        await db.multisendTaskItems.update(
          [taskItem.batch_id, taskItem.position],
          {
            status: MultisendTaskItemStatus.FAILED,
          },
        );
      } catch (saveErr) {
        console.error('❗Status update failed (data may be stuck):', saveErr);
      }
    }
  }

  console.log('✅ processFailedTaskItems finished');
}

/**
 *
 * Process tasks with status FAILED
 *
 * Pick a task → Mark as PROCESSING (transaction security)
 * Execute business logic
 * Scenario 1: Once entered the committed state.  → Rollback to COMMITTED.
 * Scenario 2: Never entered the committed state and failed to submit (no tx hash).  → Rollback to PENDING.
 * Scenario 3: Never entered the committed state and successfully submitted (with tx hash). → Rollback to COMMITTED.
 *
 * Failure: Change status to FAILED.
 * Exception: The status stays at PROCESSING
 *
 * @param taskId
 *
 */
export async function processFailedTaskItems(
  taskId: Hex,
  callback?: () => boolean,
) {
  let taskItem: IMultisendTaskItem | null;

  while (
    (callback?.() ?? true) &&
    (taskItem = await dequeueTaskItem(
      taskId,
      MultisendTaskItemStatus.FAILED,
      MultisendTaskItemStatus.PROCESSING,
    ))
  ) {
    console.log('📦 Processing item:', taskItem.batch_id, taskItem.position);

    try {
      // 👇 sendTransaction
      /***
       *
       * 1. Calculate transaction hash
       * 2. Check if the transaction is in the RPC memory pool.
       * 3. Check if the task item is executed.
       */
      // await sendTransaction(taskItem);

      const updatedAt = Date.now();

      // Scenario 1: Once entered the committed state.  → Rollback to COMMITTED.
      await db.multisendTaskItems.update(
        [taskItem.batch_id, taskItem.position],
        {
          tx_hash: '0x',
          status: MultisendTaskItemStatus.COMMITTED,
          tx_sent_at: updatedAt,
          updated_at: updatedAt,
        },
      );

      // Scenario 2: Never entered the committed state and failed to submit (no tx hash).  → Rollback to PENDING.
      await db.multisendTaskItems.update(
        [taskItem.batch_id, taskItem.position],
        {
          status: MultisendTaskItemStatus.PENDING,

          updated_at: updatedAt,
        },
      );

      // Scenario 3: Never entered the committed state and successfully submitted (with tx hash). → Rollback to COMMITTED.
      await db.multisendTaskItems.update(
        [taskItem.batch_id, taskItem.position],
        {
          tx_hash: '0x',
          status: MultisendTaskItemStatus.COMMITTED,
          tx_sent_at: updatedAt,
          updated_at: updatedAt,
        },
      );
    } catch (err) {
      console.error('❌ error => ', err);

      try {
        // ✅ Even in the face of failure, it should be documented as a failure status.
        await db.multisendTaskItems.update(
          [taskItem.batch_id, taskItem.position],
          {
            status: MultisendTaskItemStatus.FAILED,
          },
        );
      } catch (saveErr) {
        console.error('❗Status update failed (data may be stuck):', saveErr);
      }
    }
  }

  console.log('✅ processFailedTaskItems finished');
}
