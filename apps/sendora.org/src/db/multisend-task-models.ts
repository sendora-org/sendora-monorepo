export enum MultisendTaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum MultisendTaskItemStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMMITTED = 'committed',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export enum TransactionStatus {
  SUCCESS = 'success',
  REVERTED = 'reverted',
}

/**
 * SigningMode defines how a message or transaction is signed.
 */
export enum SigningMode {
  /**
   * Typically does not require user interaction.
   */
  Auto = 'auto',

  /**
   * Signature was produced via an externally controlled wallet.
   */

  Manual = 'manual',
}

export type Hex = `0x${string}`;

// The update occurs only for the status field
export interface IMultisendTask {
  id: Hex; // PK - uuid - batch id
  merkle_root: Hex;
  chain_id: number;
  contract_to: Hex; // MerkleMultiSend contract address
  contract_method: string; // MerkleMultiSend contract method  ( human readable abi )

  token_address: Hex;
  token_decimal: number;
  token_symbol: string;

  referrer_address: Hex;
  referrer_eligible: boolean;

  tool_fee: string; // The amount of Ethereum priced in wei.

  gas_limit: string;
  gas_price: string;

  pricing_currency: string;

  // This is the exchange rate scaled by 1e18.
  // For example, a real rate of 1.5 would be stored as '1500000000000000000'.
  rate: string;

  total_recipients: number;
  total_transactions: number;

  // Total amount in pricing currency (e.g. USD, EUR), expressed as a stringified integer.
  // This value is scaled by 1e18 for precision.
  total_pricing_amount: string;

  // Total amount in token units (e.g. ETH, DAI), expressed as a stringified integer.
  // Represents the amounts of tokens to be sent, specified in the smallest unit of the token.
  total_token_amount: string;

  signature_strategy: SigningMode;
  signer_address: Hex;
  funding_wallet_address: Hex;
  connected_wallet_address: Hex;

  status: MultisendTaskStatus; // task status： pending|processing|canceled|completed
  created_at: number;
}

// Only fields starting with tx_ and status will be updated.
export interface IMultisendTaskItem {
  batch_id: Hex;
  position: number;

  recipients: Hex[];
  amounts: string[]; // Represents the amounts of tokens to be sent, specified in the smallest unit of the token.
  proof: Hex[];
  leaf: Hex;

  value: string; // The amount of Ethereum priced in wei.

  total_recipients: number;

  // Total amount in pricing currency (e.g. USD, EUR), expressed as a stringified integer.
  // This value is scaled by 1e18 for precision.
  total_pricing_amount: string;

  // Total amount in token units (e.g. ETH, DAI), expressed as a stringified integer.
  // Represents the amounts of tokens to be sent, specified in the smallest unit of the token.
  total_token_amount: string;

  tx_nonce: number | null;
  tx_gas_limit: string | null;
  tx_gas_price: string | null;
  tx_hash: Hex | null;
  tx_gas_used: string | null;
  tx_gas_fee_cost: string | null;
  tx_status: TransactionStatus | null;
  tx_confirmed_at: number | null;
  tx_sent_at: number | null;
  tx_error_reason: string | null;

  status: MultisendTaskItemStatus; // task item status： pending|processing|committed|failed|completed
  created_at: number;
  updated_at: number;
}
