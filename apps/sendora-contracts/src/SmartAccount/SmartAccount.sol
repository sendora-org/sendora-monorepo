// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import {Receiver} from "solady/accounts/Receiver.sol";
import {EIP712} from "openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";

import "./ISmartAccount.sol";

contract SmartAccount is EIP712, Receiver, ISmartAccount {
    address private _owner;
    /// @notice ERC-1271 interface constants
    bytes4 internal constant _ERC1271_MAGIC_VALUE = 0x1626ba7e;
    bytes4 internal constant _ERC1271_FAIL_VALUE = 0xffffffff;

    string private constant SIGNING_DOMAIN = "sendora.org";
    string private constant SIGNATURE_VERSION = "1";

    string public constant DESCRIPTION =
        "Sign only on sendora.org. Reject if shown anywhere else.";
    string public constant TIPS =
        "Review signatureUseLimit, signatureExpiry & policies before signing. See docs.sendora.org";

    bytes32 public constant MESSAGE_TYPE_TYPEHASH =
        keccak256(
            "MessageType(string description,uint256 signatureUseLimit,uint256 signatureExpiry,CallPolicy[] policies,string tips)CallPolicy(address to,string functionSelector,string operation,uint256 valueLimit,ParamRule[] paramRules)ParamRule(string paramName,string condition,bytes32 paramValue,uint256 offset)"
        );
    bytes32 public constant CALL_POLICY_TYPEHASH =
        keccak256(
            "CallPolicy(address to,string functionSelector,string operation,uint256 valueLimit,ParamRule[] paramRules)ParamRule(string paramName,string condition,bytes32 paramValue,uint256 offset)"
        );
    bytes32 public constant Param_RULE_TYPEHASH =
        keccak256(
            "ParamRule(string paramName,string condition,bytes32 paramValue,uint256 offset)"
        );

    bytes32 public constant EQUAL_HASH = keccak256(bytes("EQUAL"));
    bytes32 public constant GREATER_THAN_HASH =
        keccak256(bytes("GREATER_THAN"));
    bytes32 public constant LESS_THAN_HASH = keccak256(bytes("LESS_THAN"));
    bytes32 public constant GREATER_THAN_OR_EQUAL_HASH =
        keccak256(bytes("GREATER_THAN_OR_EQUAL"));
    bytes32 public constant LESS_THAN_OR_EQUAL_HASH =
        keccak256(bytes("LESS_THAN_OR_EQUAL"));
    bytes32 public constant NOT_EQUAL_HASH = keccak256(bytes("NOT_EQUAL"));
    bytes32 public constant ANY_HASH = keccak256(bytes("ANY"));

    event Initialized(
        address indexed sender,
        address indexed newOwner,
        address thisAddr
    );

    // signature usage
    mapping(bytes signature => uint256 count) public useSignatureCounts;

    constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

    function owner() public view returns (address) {
        return _owner;
    }

    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) public view returns (bytes4 magicValue) {
        address signer = owner();

        (bool success, bytes memory result) = signer.staticcall(
            abi.encodeWithSelector(
                ISmartAccount.isValidSignature.selector,
                hash,
                signature
            )
        );

        if (
            success &&
            result.length == 32 &&
            bytes4(result) == _ERC1271_MAGIC_VALUE
        ) {
            return _ERC1271_MAGIC_VALUE;
        }

        // Validate signature against EOA as fallback
        (address recovered, ECDSA.RecoverError error, ) = ECDSA.tryRecover(
            hash,
            signature
        );
        if (error == ECDSA.RecoverError.NoError && recovered == signer) {
            return _ERC1271_MAGIC_VALUE;
        }

        // Default return failure value
        return _ERC1271_FAIL_VALUE;
    }

    function hashTypedData(
        MessageType memory message
    ) public view returns (bytes32) {
        return _hashTypedDataV4(hashMessage(message));
    }

    function verify(
        MessageType memory message,
        bytes calldata signature
    ) public view returns (bool) {
        bytes32 digest = hashTypedData(message);

        return
            bytes4(isValidSignature(digest, signature)) == _ERC1271_MAGIC_VALUE;
    }

    function init(address newOwner) public payable {
        require(owner() == address(0), "Already initialized");

        _owner = newOwner;

        emit Initialized(msg.sender, newOwner, address(this));
    }

    function init(address newOwner, Call[] calldata calls) public payable {
        require(owner() == address(0), "Already initialized");

        if (calls.length > 0) {
            _multicall(_encodeCalls(calls));
        }
        _owner = newOwner;

        emit Initialized(msg.sender, newOwner, address(this));
    }

    function execute(
        bytes calldata signature,
        Call[] calldata calls,
        MessageType memory message
    ) public payable {
        // uint256 gas0 = gasleft();

        require(
            useSignatureCounts[signature] < message.signatureUseLimit,
            "Signature limit exceeded"
        );
        require(message.signatureExpiry > block.timestamp, "Signature expired");

        require(checkPolicies(calls, message.policies), "Invalid policies");

        message.description = DESCRIPTION;
        message.tips = TIPS;
        require(verify(message, signature), "Not authorized");
        useSignature(signature);

        _multicall(_encodeCalls(calls));
        // uint256 gas1 = gasleft();
        // uint256 gasFee = (((gas0 - gas1) * 125) / 100) * tx.gasprice;
        // _sendEther(payable(tx.origin), gasFee);
    }

    function useSignature(
        bytes calldata signature
    ) internal returns (uint256 count) {
        count = useSignatureCounts[signature]++;
    }

    /**
     * @dev VENDORED FROM https://github.com/safe-global/safe-smart-account/blob/v1.4.1/contracts/libraries/MultiSend.sol
     * @dev Sends multiple transactions and reverts all if one fails.
     * @param transactions Encoded transactions. Each transaction is encoded as a packed bytes of
     *                     operation as a uint8 with 0 for a call or 1 for a delegatecall (=> 1 byte),
     *                     to as a address (=> 20 bytes),
     *                     value as a uint256 (=> 32 bytes),
     *                     data length as a uint256 (=> 32 bytes),
     *                     data as bytes.
     *                     see abi.encodePacked for more information on packed encoding
     */
    function _multicall(bytes memory transactions) internal {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let length := mload(transactions)
            let i := 0x20
            for {
                // Pre block is not used in "while mode"
            } lt(i, length) {
                // Post block is not used in "while mode"
            } {
                // First byte of the data is the operation.
                // We shift by 248 bits (256 - 8 [operation byte]) it right since mload will always load 32 bytes (a word).
                // This will also zero out unused data.
                let operation := shr(0xf8, mload(add(transactions, i)))
                // We offset the load address by 1 byte (operation byte)
                // We shift it right by 96 bits (256 - 160 [20 address bytes]) to right-align the data and zero out unused data.
                let to := shr(0x60, mload(add(transactions, add(i, 0x01))))
                // We offset the load address by 21 byte (operation byte + 20 address bytes)
                let value := mload(add(transactions, add(i, 0x15)))
                // We offset the load address by 53 byte (operation byte + 20 address bytes + 32 value bytes)
                let dataLength := mload(add(transactions, add(i, 0x35)))
                // We offset the load address by 85 byte (operation byte + 20 address bytes + 32 value bytes + 32 data length bytes)
                let data := add(transactions, add(i, 0x55))
                let success := 0
                switch operation
                case 0 {
                    success := call(gas(), to, value, data, dataLength, 0, 0)
                }
                case 1 {
                    success := delegatecall(gas(), to, data, dataLength, 0, 0)
                }
                if eq(success, 0) {
                    revert(0, 0)
                }
                // Next entry starts at 85 byte + data length
                i := add(i, add(0x55, dataLength))
            }
        }
    }

    // Send Ether
    function _sendEther(address payable to, uint256 amount) internal {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function _encodeCalls(
        Call[] memory calls
    ) internal view returns (bytes memory transactions) {
        bytes memory txs;

        for (uint i = 0; i < calls.length; i++) {
            Call memory c = calls[i];
            uint8 operation = address(this) == c.to ? 1 : 0;
            bytes memory encoded = abi.encodePacked(
                operation, // 1 byte
                c.to, // 20 bytes
                c.value, // 32 bytes
                uint256(c.data.length), // 32 bytes
                c.data // N bytes
            );

            txs = bytes.concat(txs, encoded);
        }

        return txs;
    }

    function extractParam(
        bytes memory _data,
        uint256 _offset
    ) private pure returns (bytes32) {
        bytes memory argsData = _data.length > 4
            ? slice(_data, 4, _data.length - 4)
            : new bytes(0);
        require(_offset + 32 <= argsData.length, "Offset exceeds data length");
        bytes32 value;
        assembly {
            value := mload(add(add(argsData, 32), _offset))
        }
        return value;
    }

    function slice(
        bytes memory _data,
        uint256 _start,
        uint256 _length
    ) private pure returns (bytes memory) {
        bytes memory result = new bytes(_length);
        for (uint256 i = 0; i < _length; i++) {
            result[i] = _data[_start + i];
        }
        return result;
    }

    function hashParamRue(ParamRule memory rule) public pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    Param_RULE_TYPEHASH,
                    keccak256(bytes(rule.paramName)),
                    keccak256(bytes(rule.condition)),
                    rule.paramValue,
                    rule.offset
                )
            );
    }

    function hashCallPolicy(
        CallPolicy memory policy
    ) public pure returns (bytes32) {
        bytes32[] memory paramRulesHashes = new bytes32[](
            policy.paramRules.length
        );
        for (uint i = 0; i < policy.paramRules.length; i++) {
            paramRulesHashes[i] = hashParamRue(policy.paramRules[i]);
        }

        bytes32 paramRulesHash = keccak256(abi.encodePacked(paramRulesHashes));
        return
            keccak256(
                abi.encode(
                    CALL_POLICY_TYPEHASH,
                    policy.to,
                    keccak256(bytes(policy.functionSelector)),
                    keccak256(bytes(policy.operation)),
                    policy.valueLimit,
                    paramRulesHash
                )
            );
    }

    function hashMessage(
        MessageType memory message
    ) public pure returns (bytes32) {
        bytes32[] memory policyHashes = new bytes32[](message.policies.length);
        for (uint i = 0; i < message.policies.length; i++) {
            policyHashes[i] = hashCallPolicy(message.policies[i]);
        }

        bytes32 policiesHash = keccak256(abi.encodePacked(policyHashes));
        return
            keccak256(
                abi.encode(
                    MESSAGE_TYPE_TYPEHASH,
                    keccak256(bytes(message.description)),
                    message.signatureUseLimit,
                    message.signatureExpiry,
                    policiesHash,
                    keccak256(bytes(message.tips))
                )
            );
    }

    function checkPolicies(
        Call[] calldata calls,
        CallPolicy[] memory policies
    ) public pure returns (bool) {
        for (uint256 i = 0; i < policies.length; i++) {
            CallPolicy memory policy = policies[i];
            // bytes4 functionSelector = bytes4(calls[i].data);

            if (calls[i].value > policy.valueLimit) {
                return false;
            }
            if (policy.to != calls[i].to) {
                return false;
            }

            if (
                keccak256(bytes(policy.operation)) !=
                keccak256(bytes(calls[i].operation))
            ) {
                return false;
            }

            bytes4 functionSelector = 0x00000000;
            bytes4 functionSelectorP = 0x00000000;

            if (calls[i].data.length >= 4) {
                functionSelector = bytes4(calls[i].data);
                functionSelectorP = bytes4(
                    keccak256(bytes(policy.functionSelector))
                );
            }

            if (functionSelector == 0x00000000) {
                continue;
            }

            if (functionSelector != functionSelectorP) {
                return false;
            }

            if (policy.paramRules.length == 0) {
                continue;
            }

            bytes memory _data = calls[i].data;
            for (uint256 j = 0; j < policy.paramRules.length; j++) {
                ParamRule memory rule = policy.paramRules[j];
                bytes32 param = extractParam(_data, 4 + rule.offset);
                bytes32 CONDITION_HASH = keccak256(bytes(rule.condition));

                if (CONDITION_HASH == ANY_HASH) {
                    continue;
                }

                if (CONDITION_HASH == EQUAL_HASH && param != rule.paramValue) {
                    return false;
                } else if (
                    CONDITION_HASH == GREATER_THAN_HASH &&
                    param <= rule.paramValue
                ) {
                    return false;
                } else if (
                    CONDITION_HASH == LESS_THAN_HASH && param >= rule.paramValue
                ) {
                    return false;
                } else if (
                    CONDITION_HASH == GREATER_THAN_OR_EQUAL_HASH &&
                    param < rule.paramValue
                ) {
                    return false;
                } else if (
                    CONDITION_HASH == LESS_THAN_OR_EQUAL_HASH &&
                    param > rule.paramValue
                ) {
                    return false;
                } else if (
                    CONDITION_HASH == NOT_EQUAL_HASH && param == rule.paramValue
                ) {
                    return false;
                }
            }
        }

        return true;
    }
}
