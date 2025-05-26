// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

struct Call {
    address to; // Replaced with `address(this)` if `address(0)`.
    uint256 value; // Amount of native currency (i.e. Ether) to send.
    bytes data; // Calldata to send with the call.
    uint8 operation; // Delegatecall(1) or Call(0).
}
//  Parameter condition enum
enum ParamCondition {
    EQUAL, //   Equal
    GREATER_THAN, //   Greater than
    LESS_THAN, //  Less than
    NOT_EQUAL, //  Not equal
    GREATER_THAN_OR_EQUAL, //   Greater than or equal
    LESS_THAN_OR_EQUAL, //  Less than or equal
    ANY // Any value (no condition)
}

//  Parameter rule structure
struct ParamRule {
    uint256 offset;
    ParamCondition condition; // Parameter condition
    bytes32 value; // Expected value
}
//  Call policy structure
struct CallPolicy {
    address target; //  Target contract address
    uint8 operation; // Delegatecall(1) or Call(0).
    bytes4 functionSelector; //   Function selector
    uint256 valueLimit; //   Max value per transaction
    ParamRule[] paramRules; //   Array of parameter rules
}

interface ISmartAccount {
    function execute(
        Call[] calldata calls,
        bytes calldata signature,
        uint256 maxUsage,
        uint256 validUntil,
        CallPolicy[] calldata policies
    ) external payable;

    function owner() external view returns (address);

    function init(address owner, Call[] calldata calls) external payable;
}
