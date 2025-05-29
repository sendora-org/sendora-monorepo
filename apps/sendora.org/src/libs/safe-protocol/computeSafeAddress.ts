import {
  bytesToHex,
  concat,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  fromHex,
  getContractAddress,
  isHex,
  keccak256,
  parseAbiParameters,
  toBytes,
} from 'viem';
import { parseAbi } from 'viem';
import { Version1_4_1_L2 } from './config';

export const PREDETERMINED_SALT_NONCE =
  '0xb1073742015cbcf5a3a4d9d1ae33ecf619439710b89475f92e2abd2117e90f90';
export const saltNonce = PREDETERMINED_SALT_NONCE;
export const SafeProxyFactory = '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67';
export const safeContract = '0x41675C099F32341bf84BFc5382aF534df5C7461a';
export const bytecode =
  '0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806101c46022913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060ab806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea264697066735822122003d1488ee65e08fa41e58e888a9865554c535f2c77126a82cb4c0f917f31441364736f6c63430007060033496e76616c69642073696e676c65746f6e20616464726573732070726f7669646564';
export const addModulesLibAddress =
  '0x8EcD4ec46D4D2a6B64fE960B3D64e8B94B2234eb';
export const safe4337ModuleAddress =
  '0xa581c4A4DB7175302464fF3C06380BC3270b4037';
export const multiSendContract = '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526';

export type Hex = `0x${string}`;

export enum OperationType {
  Call = 0,
  DelegateCall = 1,
}

export interface MetaTransactionData {
  to: Hex;
  value: string;
  data: string;
  operation?: OperationType;
}

export function asHex(hex?: string): Hex {
  return isHex(hex) ? (hex as Hex) : (`0x${hex}` as Hex);
}

function encodeParameters(types: string, values: any[]): string {
  return encodeAbiParameters(parseAbiParameters(types), values);
}

function computeSalt(initializer: Hex, saltNonce: Hex): Hex {
  const initializerHash = keccak256(asHex(initializer));
  const encodedNonce = asHex(encodeParameters('uint256', [saltNonce]));
  return keccak256(concat([initializerHash, encodedNonce]));
}

/**
 * Safe Initializer
 */
export function computeInitializer(
  EOASignerAddress: Hex[],
  safeConfig: any,
): Hex {
  const ABI = [
    'function enableModules(address[])',
    'function multiSend(bytes memory transactions) public payable',
    'function setup(address[] calldata _owners,uint256 _threshold,address to,bytes calldata data,address fallbackHandler,address paymentToken,uint256 payment,address paymentReceiver)',
  ];

  return encodeFunctionData({
    abi: parseAbi(ABI),
    functionName: 'setup',
    args: [
      EOASignerAddress, // owners
      safeConfig.safeAccountConfig.threshold, // threshold
      safeConfig.safeAccountConfig.to,
      safeConfig.safeAccountConfig.data,
      safeConfig.safeAccountConfig.fallbackHandler,
      '0x0000000000000000000000000000000000000000',
      0n,
      safeConfig.safeAccountConfig.paymentReceiver,
    ],
  }) as Hex;
}

export function computeSafeAddress(
  safeProxyFactory: Hex,
  safeContract: Hex,
  initializer: Hex,
  bytecode: Hex,
): Hex {
  const salt = computeSalt(initializer, '0x00');
  const input = encodeParameters('address', [safeContract]);
  const initCode = concat([bytecode, asHex(input)]);

  return getContractAddress({
    bytecode: initCode,
    from: safeProxyFactory,
    opcode: 'CREATE2',
    salt: salt,
  });
}

function encodeMetaTransaction(tx: MetaTransactionData): string {
  const data = toBytes(tx.data);
  const encoded = encodePacked(
    ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
    [
      tx.operation ?? OperationType.Call,
      tx.to,
      BigInt(tx.value),
      BigInt(data.length),
      bytesToHex(data),
    ],
  );
  return encoded.slice(2);
}

export const getSafeAddress = (EOASignerAddress: Hex[], safeConfig: any) => {
  const initializer = computeInitializer(EOASignerAddress, safeConfig);
  return computeSafeAddress(
    safeConfig.factoryAddress,
    safeConfig.masterCopy,
    initializer,
    safeConfig.masterCopyBytecode,
  );
};
