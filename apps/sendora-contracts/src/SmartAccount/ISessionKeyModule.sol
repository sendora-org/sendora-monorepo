// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISessionKeyModule {
    //  Parameter condition enum
    enum ParamCondition {
        EQUAL, //   Equal
        GREATER_THAN, //   Greater than
        LESS_THAN, //  Less than
        NOT_EQUAL, //  Not equal
        GREATER_THAN_OR_EQUAL, //   Greater than or equal
        LESS_THAN_OR_EQUAL //  Less than or equal
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

    //   Session structure
    struct Session {
        address sessionKey; //  Session key address
        CallPolicy[] policies; //   Array of call policies
        uint256 validUntil; //  Validity deadline
        bool active; //  Is active
    }
}
