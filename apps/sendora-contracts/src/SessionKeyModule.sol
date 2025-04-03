// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@safe-global/safe-contracts/contracts/common/Enum.sol";
import "@safe-global/safe-contracts/contracts/Safe.sol";

contract SessionKeyModule {
    //   Session type hash for EIP-712 signature
    bytes32 public immutable SESSION_TYPEHASH =
        keccak256(
            "SessionKey(address sessionKey,CallPolicy[] policies,uint256 validUntil,uint256 nonce)"
        );

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
        uint256 offset; // Parameter offset (bytes)
        ParamCondition condition; // Parameter condition
        bytes32 value; // Expected value
    }

    //  Call policy structure
    struct CallPolicy {
        address target; //  Target contract address
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

    //  Safe contract address
    address public immutable safeAddress;
    //   Nonce mapping for replay protection
    mapping(address => uint256) public nonces;
    //  Session mapping
    mapping(address => Session) public sessions;

    //  Event: Session created
    event SessionCreated(address indexed sessionKey, uint256 validUntil);
    //   Event: Session revoked
    event SessionRevoked(address indexed sessionKey);

    //   Constructor
    constructor(address _safeAddress) {
        safeAddress = _safeAddress;
    }

    //   Get EIP-712 domain separator
    function getDomainSeparator() private view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    keccak256(
                        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                    ),
                    keccak256(bytes("ZeroDevSessionKeyModule")),
                    keccak256(bytes("1")),
                    block.chainid,
                    address(this)
                )
            );
    }

    /**
     * @dev  Create a session key
     * @param _sessionKey  Session key address
     * @param _policies   Array of call policies
     * @param _validUntil  Validity deadline
     * @param _signatures  Safe owner signatures
     */
    function createSession(
        address _sessionKey,
        CallPolicy[] memory _policies,
        uint256 _validUntil,
        bytes memory _signatures
    ) external {
        require(_validUntil > block.timestamp, "Invalid validity period");
        require(_sessionKey != address(0), "Invalid session key");
        require(!sessions[_sessionKey].active, "Session already exists");
        require(_policies.length > 0, "Must specify at least one policy");

        //  Check if offsets in paramRules are unique
        for (uint256 i = 0; i < _policies.length; i++) {
            mapping(uint256 => bool) memory offsetUsed;
            for (uint256 j = 0; j < _policies[i].paramRules.length; j++) {
                uint256 offset = _policies[i].paramRules[j].offset;
                require(!offsetUsed[offset], "Duplicate offset in param rules");
                offsetUsed[offset] = true;
                require(offset % 32 == 0, "Offset must be multiple of 32");
            }
        }

        bytes32 policiesHash = keccak256(abi.encode(_policies));
        bytes32 sessionData = keccak256(
            abi.encode(
                SESSION_TYPEHASH,
                _sessionKey,
                policiesHash,
                _validUntil,
                nonces[msg.sender]++
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", getDomainSeparator(), sessionData)
        );

        Safe(payable(safeAddress)).checkSignatures(
            hash,
            abi.encodePacked(sessionData),
            _signatures
        );

        Session storage session = sessions[_sessionKey];
        session.sessionKey = _sessionKey;
        session.validUntil = _validUntil;
        session.active = true;
        for (uint256 i = 0; i < _policies.length; i++) {
            session.policies.push(_policies[i]);
        }

        emit SessionCreated(_sessionKey, _validUntil);
    }

    /**
     * @dev  Execute transaction
     * @param _to  Target address
     * @param _value  ETH value
     * @param _data  Transaction data
     * @param _operation  Operation type
     */
    function executeTransaction(
        address _to,
        uint256 _value,
        bytes memory _data,
        Enum.Operation _operation
    ) external {
        Session storage session = sessions[msg.sender];
        require(session.active, "Session not active");
        require(block.timestamp <= session.validUntil, "Session expired");
        require(msg.sender == session.sessionKey, "Invalid session key");
        require(
            _operation == Enum.Operation.Call,
            "Only Call operation allowed"
        );

        //   Pre-check data length
        require(_data.length >= 4, "Invalid call data length");

        bytes4 functionSelector = bytes4(_data);
        bool policyMatched = false;

        for (uint256 i = 0; i < session.policies.length; i++) {
            CallPolicy memory policy = session.policies[i];
            if (
                policy.target == _to &&
                policy.functionSelector == functionSelector
            ) {
                policyMatched = true;
                require(_value <= policy.valueLimit, "Value exceeds limit");

                if (policy.paramRules.length > 0) {
                    bytes memory argsData = slice(_data, 4, _data.length - 4);
                    for (uint256 j = 0; j < policy.paramRules.length; j++) {
                        ParamRule memory rule = policy.paramRules[j];
                        require(
                            rule.offset + 32 <= argsData.length,
                            "Offset out of bounds"
                        );
                        bytes32 paramValue = extractParam(_data, rule.offset);

                        if (rule.condition == ParamCondition.EQUAL) {
                            require(
                                paramValue == rule.value,
                                "Param must equal value"
                            );
                        } else if (rule.condition == ParamCondition.NOT_EQUAL) {
                            require(
                                paramValue != rule.value,
                                "Param must not equal value"
                            );
                        } else if (
                            rule.condition == ParamCondition.GREATER_THAN
                        ) {
                            require(
                                uint256(paramValue) > uint256(rule.value),
                                "Param too small"
                            );
                        } else if (rule.condition == ParamCondition.LESS_THAN) {
                            require(
                                uint256(paramValue) < uint256(rule.value),
                                "Param too large"
                            );
                        } else if (
                            rule.condition ==
                            ParamCondition.GREATER_THAN_OR_EQUAL
                        ) {
                            require(
                                uint256(paramValue) >= uint256(rule.value),
                                "Param must be >= value"
                            );
                        } else if (
                            rule.condition == ParamCondition.LESS_THAN_OR_EQUAL
                        ) {
                            require(
                                uint256(paramValue) <= uint256(rule.value),
                                "Param must be <= value"
                            );
                        }
                    }
                }
                break;
            }
        }
        require(policyMatched, "No matching policy");

        require(
            Safe(payable(safeAddress)).execTransactionFromModule(
                _to,
                _value,
                _data,
                _operation
            ),
            "Transaction execution failed"
        );
    }

    /**
     * @dev  Revoke session
     * @param _sessionKey  Session key address
     * @param _signatures  Safe owner signatures
     */
    function revokeSession(
        address _sessionKey,
        bytes memory _signatures
    ) external {
        require(sessions[_sessionKey].active, "Session not active");

        bytes32 revokeData = keccak256(
            abi.encode(
                SESSION_TYPEHASH,
                _sessionKey,
                keccak256(abi.encode(new CallPolicy[](0))),
                0,
                nonces[msg.sender]++
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", getDomainSeparator(), revokeData)
        );

        Safe(payable(safeAddress)).checkSignatures(
            hash,
            abi.encodePacked(revokeData),
            _signatures
        );

        delete sessions[_sessionKey];
        emit SessionRevoked(_sessionKey);
    }

    /**
     * @dev  Check if session is valid
     * @param _sessionKey   Session key address
     * @return   Is valid
     */
    function isSessionValid(address _sessionKey) external view returns (bool) {
        Session memory session = sessions[_sessionKey];
        return session.active && block.timestamp <= session.validUntil;
    }

    /**
     * @dev   Extract parameter value
     * @param _data  Transaction data
     * @param _offset   Parameter offset
     * @return   Parameter value
     */
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

    /**
     * @dev   Slice byte array
     * @param _data   Data
     * @param _start Start position
     * @param _length Length
     * @return  Sliced result
     */
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
}
