export enum MultisendTaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum MultisendTaskItemStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  FAILED = 'failed',
  SUCCEEDED = 'succeeded',
}

export enum TransactionStatus {
  SUCCESS = "success",
  REVERTED = "reverted",
}

/**
 * SigningMode defines how a message or transaction is signed.
 */
export enum SigningMode {
  /**
   * Signature was produced automatically via a session key (delegated signer).
   * Typically does not require user interaction.
   */
  SessionKey = 'session_key',

  /**
   * Signature was produced via an externally controlled wallet.
   * This could be a true EOA (externally owned account), or a smart contract
   * wallet (e.g., Safe, Biconomy, Argent) that uses EIP-1271 or Account Abstraction.
   */
  Wallet = 'wallet'
}

type Hex = `0x${string}`

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
  // This value is also scaled by 1e18 for precision.
  total_token_amount: string;

  signing_mode: SigningMode;
  session_key: Hex;
  signer_address: Hex;
  funding_wallet_address: Hex;
  connected_wallet_address: Hex;

  status: MultisendTaskStatus; // task status： pending|processing|canceled|completed
  created_at: number;
  updated_at: number;
}

// Only fields starting with tx_ and status will be updated.
export interface IMultisendTaskItem {
  batch_id: Hex;
  position: number;

  recipients: Hex[];
  amounts: string[];
  proof: Hex[];
  leaf: Hex;

  value: string;

  gas_limit: string;
  gas_price: string;

  total_recipients: number;

  // Total amount in pricing currency (e.g. USD, EUR), expressed as a stringified integer.
  // This value is scaled by 1e18 for precision.
  total_pricing_amount: string;

  // Total amount in token units (e.g. ETH, DAI), expressed as a stringified integer.
  // This value is also scaled by 1e18 for precision.
  total_token_amount: string;

  tx_hash: Hex | null;
  tx_gas_used: string | null;
  tx_gas_fee_cost: string | null;
  tx_status: TransactionStatus | null;
  tx_confirmed_at: number | null;
  tx_sent_at: number | null;

  status: MultisendTaskItemStatus; // task item status： pending|processing|failed|succeeded
  created_at: number;
  updated_at: number;

}