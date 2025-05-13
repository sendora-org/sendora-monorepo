// schema_version
export const initSQL = `
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS schema_version (
  id INTEGER PRIMARY KEY ,
  version INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS batch_tasks (
  id INTEGER PRIMARY KEY ,
  batch_id TEXT NOT NULL UNIQUE,
  chain_id INTEGER NOT NULL,
  merkle_root TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_decimal INTEGER NOT NULL,
  token_symbol TEXT NOT NULL,
  referrer_address TEXT NOT NULL,
  referrer_eligible BOOLEAN NOT NULL,
  pricing_currency TEXT NOT NULL,
  rate TEXT NOT NULL,
  gas_limit TEXT NOT NULL,
  gas_price TEXT NOT NULL,
  tool_fee TEXT NOT NULL,
  signing_mode TEXT NOT NULL,
  session_key TEXT NOT NULL,
  signer_address TEXT NOT NULL,
  funding_wallet_type TEXT NOT NULL,
  funding_wallet_address TEXT NOT NULL,
  connected_wallet_type TEXT NOT NULL,
  connected_wallet_address TEXT NOT NULL,
  status TEXT NOT NULL,
  "to" TEXT NOT NULL,
  contract_method TEXT NOT NULL,
  total_recipients INTEGER NOT NULL,
  total_transactions INTEGER NOT NULL,
  total_pricing_amount TEXT NOT NULL,
  total_token_amount TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 

CREATE TABLE IF NOT EXISTS batch_task_details (
  id INTEGER PRIMARY KEY,
  batch_id TEXT NOT NULL,
  "index" INTEGER NOT NULL,
  recipients TEXT NOT NULL,
  amounts TEXT NOT NULL,
  merkle_proofs TEXT NOT NULL,
  leaf TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at TIMESTAMP ,
  confirmed_at TIMESTAMP ,
  tx_status TEXT  ,            -- success , reverted
  tx_hash TEXT ,
  gas_limit TEXT NOT NULL,
  gas_price TEXT NOT NULL,
  tool_fee_cost  TEXT NOT NULL,
  gas_cost TEXT ,
  gas_fee_cost TEXT,
  nonce INTEGER,
  total_recipients INTEGER NOT NULL,
  total_pricing_amount TEXT NOT NULL,
  total_token_amount TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE(batch_id, "index")
);

COMMIT;
`;

const migrations = [];

function upgradeSchema() {}
