// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
struct MessageType {
    string description;
    uint256 signatureUseLimit;
    uint256 signatureExpiry;
    CallPolicy[] policies;
    string tips;
}
struct Call {
    address to; // Replaced with `address(this)` if `address(0)`.
    uint256 value; // Amount of native currency (i.e. Ether) to send.
    bytes data; // Calldata to send with the call.
}

//  Parameter rule structure
struct ParamRule {
    string paramName;
    string condition; //EQUAL GREATER_THAN LESS_THAN NOT_EQUAL GREATER_THAN_OR_EQUAL LESS_THAN_OR_EQUAL ANY
    bytes32 paramValue;
    uint256 offset;
}
//  Call policy structure
struct CallPolicy {
    address to; //  Target contract address
    uint256 valueLimit; //   Max value per transaction
    string functionSelector; //   Function selector
    ParamRule[] paramRules; //   Array of parameter rules
}

interface ISmartAccount {
    function execute(
        bytes calldata signature,
        Call[] calldata calls,
        MessageType memory message
    ) external payable;

    function owner() external view returns (address);

    function init(
        address newOwner,
        address relayer,
        uint256 initGasFee
    ) external payable;

    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) external returns (bytes4 magicValue);
}
