import { multisendTaskDb as db, SigningMode, MultisendTaskStatus, TransactionStatus, MultisendTaskItemStatus } from "@/db/databases"
import type { IMultisendTask, IMultisendTaskItem, Hex } from "@/db/databases"
import { keccak256 } from 'viem'

// mock
const mockTaskId: Hex = `0x${'a'.repeat(64)}`
const mockLeaf: Hex = `0x${'b'.repeat(64)}`
const merkle_root: Hex = `0x${'e'.repeat(64)}`
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
    created_at: Date.now()
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
    created_at: Date.now()
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
    created_at: Date.now()
};

export const mockData = {
    task: mockTask,
    taskItems: [mockTaskItem1, mockTaskItem2]
};


export const createMultisendTask = async (task: IMultisendTask, taskItems: IMultisendTaskItem[]): Promise<Hex | null> => {
    let taskId: Hex | null = null
    try {
        await db.transaction('rw', db.multisendTasks, db.multisendTaskItems, async () => {
            // Insert task
            taskId = await db.multisendTasks.add(task);

            // Insert taskItems
            await db.multisendTaskItems.bulkAdd(taskItems);

            console.log('Task and task items inserted successfully in one transaction.');
        });
    } catch (err) {
        console.error('createMultisendTask Transaction failed', err);
    }

    return taskId
}

export const cancelMultisendTask = async (taskId: Hex): Promise<boolean> => {
    try {
        await db.transaction('rw', db.multisendTasks, db.multisendTaskItems, async () => {
            // Cancel task
            let task = await db.multisendTasks.get(taskId); // Get the task by its ID
            if (task) {
                task.status = MultisendTaskStatus.CANCELED;
                await db.multisendTasks.put(task); // Update the task status in the database
            }
        });
    } catch (err) {
        console.error('cancelMultisendTask Transaction failed', err);
        return false
    }

    return true
}

export const deleteMultisendTask = async (taskId: Hex): Promise<boolean> => {
    try {
        await db.transaction('rw', db.multisendTasks, db.multisendTaskItems, async () => {
            // Delete task and its associated items
            let task = await db.multisendTasks.get(taskId); // Get the task by its ID
            if (task) {
                await db.multisendTasks.delete(task.id);
                await db.multisendTaskItems
                    .where('batch_id')
                    .equals(task.id)
                    .delete();
            }
        });

    } catch (err) {
        console.error('deleteMultisendTask Transaction failed', err)

        return false
    }

    return true

}


export async function dequeueTaskItem(taskId: Hex, status: MultisendTaskItemStatus, nextStatus: MultisendTaskItemStatus): Promise<IMultisendTaskItem | null> {
    let selectedItem: IMultisendTaskItem | null = null;

    try {
        await db.transaction('rw', db.multisendTaskItems, async () => {
            const pendingItem = await db.multisendTaskItems
                .where('[batch_id+status]')
                .equals([taskId, status])
                .first();

            if (!pendingItem) return;

            await db.multisendTaskItems.update(
                [pendingItem.batch_id, pendingItem.position],
                {
                    status: nextStatus
                }
            );


            selectedItem = {
                ...pendingItem,
                status: nextStatus

            };
        });
    } catch (err) {
        console.error('dequeueTaskItem Transaction failed', err)

    }
    return selectedItem;
}


