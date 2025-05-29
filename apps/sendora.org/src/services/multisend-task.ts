import { MerkleMultiSendVars } from '@/constants/common';
import {
  MultisendTaskItemStatus,
  MultisendTaskStatus,
  SigningMode,
  TransactionStatus,
  multisendTaskDb as db,
} from '@/db/databases';
import type { Hex, IMultisendTask, IMultisendTaskItem } from '@/db/databases';
import { computeSmartAccount, getErrorMessage } from '@/libs/common';
// @ts-ignore
import chunk from 'lodash.chunk';
import { MerkleTree } from 'merkletreejs';
import { nanoid } from 'nanoid';
import { keccak256, stringToHex } from 'viem';
import { bytesToHex } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { ZERO_ADDRESS } from '@/constants/common';
import { encodeAbiParameters } from 'viem';

type Receipt = {
  address: Hex;
  addressType: string;
  name: string;
  amount: bigint; // tokenToBeSend
  amountRaw: bigint; // User input value scaled by 1e18.
  id: number;
};

export const generateMultisendTask = async (
  chainId: number,
  rate: bigint,
  enablePricingCurrency: boolean,
  currency: string,
  total_recipients: number,
  total_transactions: number,
  total_input_amount: bigint,
  total_token_amount: bigint,
  tool_fee: bigint,
  signatureStrategy: string,
  connected_wallet_address: Hex,
  receipts: Receipt[],
  tokenAddress: Hex,
  decimals: number,
  symbol: string,
  gas_limit: bigint,
  gas_price: bigint,
) => {
  const taskId = stringToHex(nanoid(), { size: 32 });

  const token = [tokenAddress, BigInt(decimals), symbol];
  let chunks = chunk(receipts, 100, false);

  chunks = chunks.map((chunk) => {
    return {
      taskId: taskId,
      token,
      recipients: chunk.map((item) => item.address),

      // 计算金额问题
      amounts: chunk.map((item) => item.amount),
      amountRaws: chunk.map((item) => item.amountRaw),
    };
  });
  const leafs = chunks.map((chunk) => {
    return keccak256(
      encodeAbiParameters(
        [
          {
            name: 'batchID',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'token',
            type: 'tuple',
            internalType: 'struct MerkleMultiSend.Token',
            components: [
              {
                name: 'tokenAddress',
                type: 'address',
                internalType: 'address',
              },
              {
                name: 'decimals',
                type: 'uint256',
                internalType: 'uint256',
              },
              {
                name: 'symbol',
                type: 'string',
                internalType: 'string',
              },
            ],
          },

          {
            name: 'recipients',
            type: 'address[]',
            internalType: 'address[]',
          },
          {
            name: 'amounts',
            type: 'uint256[]',
            internalType: 'uint256[]',
          },
        ],
        [chunk.taskId, chunk.token, chunk.recipients, chunk.amounts],
      ),
    );
  });

  const tree = new MerkleTree(leafs, keccak256, {
    sortLeaves: true,
    sortPairs: true,
  });

  const merkle_root = tree.getRoot().toString('hex') as Hex;

  const taskItems = chunks.map((chunk, index) => {
    const leaf = leafs[index];
    const proofBytes = tree.getProof(leaf);
    console.log(55555, chunk);
    return {
      batch_id: chunk.taskId,
      position: index,
      recipients: chunk.recipients,
      amounts: chunk.amounts,
      proof: proofBytes.map((item) => {
        return bytesToHex(item.data);
      }),
      leaf: leaf,
      total_recipients: chunk.recipients.length,

      // token == 0x0    value = total_token_amount + fee
      // token != 0x0    value = fee
      value:
        tokenAddress == ZERO_ADDRESS ? tool_fee + total_token_amount : tool_fee,
      total_input_amount: chunk.amountRaws.reduce(
        (sum: bigint, val: bigint) => sum + val,
        0n,
      ),
      total_token_amount: chunk.amounts.reduce(
        (sum: bigint, val: bigint) => sum + val,
        0n,
      ),

      status: MultisendTaskItemStatus.PENDING,
      created_at: Date.now(),
      updated_at: Date.now(),

      tx_gas_limit: null,
      tx_gas_price: null,
      tx_hash: null,
      tx_gas_used: null,
      tx_gas_fee_cost: null,
      tx_status: null,
      tx_confirmed_at: null,
      tx_sent_at: null,
      tx_error_reason: null,
      tx_nonce: null,
    };
  });

  const task: IMultisendTask = {
    id: taskId,
    merkle_root: merkle_root,
    chain_id: chainId,

    contract_to: MerkleMultiSendVars.contract_to,
    contract_method: MerkleMultiSendVars.contract_method,

    token_address: tokenAddress,
    token_decimal: decimals,
    token_symbol: symbol,

    total_recipients: total_recipients,
    total_transactions: total_transactions,

    tool_fee: tool_fee,
    total_input_amount: total_input_amount,
    total_token_amount: total_token_amount,
    pricing_currency: currency,
    rate: rate,
    enable_pricing_currency: enablePricingCurrency,

    gas_limit: gas_limit,
    gas_price: gas_price,
    signature_strategy: signatureStrategy,
    relayerKey: signatureStrategy === 'auto' ? generatePrivateKey() : '0x',
    funding_wallet_address:
      signatureStrategy === 'auto'
        ? computeSmartAccount(connected_wallet_address)
        : connected_wallet_address,
    connected_wallet_address: connected_wallet_address,
    status: MultisendTaskStatus.PENDING,
    created_at: Date.now(),
  };

  await createMultisendTask(task, taskItems);
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
