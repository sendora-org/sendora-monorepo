// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./types.sol";
import "./ISessionKeyModule.sol";

contract SessionKeyModule is ISessionKeyModule {
    //  Session mapping
    mapping(address => Session) private sessions;
    //  Event: Session created
    event SessionCreated(address indexed sessionKey, uint256 validUntil);
    //   Event: Session revoked
    event SessionRevoked(address indexed sessionKey);

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkSessionkey(
        address sessionKey,
        Call[] memory calls
    ) internal view returns (bool) {
        Session storage session = sessions[sessionKey];

        if (!session.active) {
            return false;
        }
        if (block.timestamp > session.validUntil) {
            return false;
        }

        for (uint256 i = 0; i < session.policies.length; i++) {
            CallPolicy memory policy = session.policies[i];

            bytes4 functionSelector = bytes4(calls[i].data);

            if (
                policy.target == calls[i].to &&
                policy.functionSelector == functionSelector &&
                policy.operation == calls[i].operation 
            ) {
                require(
                    calls[i].value <= policy.valueLimit,
                    "Value exceeds limit"
                );

                if (policy.paramRules.length > 0) {
                    bytes memory _data = calls[i].data;
                    for (uint256 j = 0; j < policy.paramRules.length; j++) {
                        ParamRule memory rule = policy.paramRules[j];

                        bytes32 param = extractParam(_data, 4 + rule.offset);

                        if (
                            rule.condition == ParamCondition.EQUAL &&
                            param != rule.value
                        ) {
                            return false;
                        } else if (
                            rule.condition == ParamCondition.GREATER_THAN &&
                            param <= rule.value
                        ) {
                            return false;
                        } else if (
                            rule.condition == ParamCondition.LESS_THAN &&
                            param >= rule.value
                        ) {
                            return false;
                        } else if (
                            rule.condition ==
                            ParamCondition.GREATER_THAN_OR_EQUAL &&
                            param < rule.value
                        ) {
                            return false;
                        } else if (
                            rule.condition ==
                            ParamCondition.LESS_THAN_OR_EQUAL &&
                            param > rule.value
                        ) {
                            return false;
                        } else if (
                            rule.condition == ParamCondition.NOT_EQUAL &&
                            param == rule.value
                        ) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    /**
     * @dev  Create a session key
     * @param _sessionKey  Session key address
     * @param _policies   Array of call policies
     * @param _validUntil  Validity deadline
     */
    function _createSession(
        address _sessionKey,
        CallPolicy[] memory _policies,
        uint256 _validUntil
    ) internal {
        require(_validUntil > block.timestamp, "Invalid validity period");
        require(_sessionKey != address(0), "Invalid session key");
        require(!sessions[_sessionKey].active, "Session already exists");
        require(_policies.length > 0, "Must specify at least one policy");

        Session storage session = sessions[_sessionKey];
        session.sessionKey = _sessionKey;
        session.validUntil = _validUntil;
        session.active = true;

        for (uint256 i = 0; i < _policies.length; i++) {
            CallPolicy memory policyMemory = _policies[i];
            session.policies.push();
            CallPolicy storage policyStorage = session.policies[i];
            policyStorage.target = policyMemory.target;
            policyStorage.operation = policyMemory.operation;
            policyStorage.functionSelector = policyMemory.functionSelector;
            policyStorage.valueLimit = policyMemory.valueLimit;

            for (uint256 j = 0; j < policyMemory.paramRules.length; j++) {
                policyStorage.paramRules.push(policyMemory.paramRules[j]);
            }
        }

        emit SessionCreated(_sessionKey, _validUntil);
    }

    /**
     * @dev  Revoke session
     * @param _sessionKey  Session key address
     */
    function _revokeSession(address _sessionKey) internal {
        require(sessions[_sessionKey].active, "Session not active");
        delete sessions[_sessionKey];
        emit SessionRevoked(_sessionKey);
    }

    /**
     * @dev  Check if session is valid
     * @param _sessionKey   Session key address
     * @return   Is valid
     */
    function _isSessionValid(address _sessionKey) internal view returns (bool) {
        Session memory session = sessions[_sessionKey];
        return session.active && block.timestamp <= session.validUntil;
    }

    function _getSession(
        address _sessionKey
    ) internal view returns (Session memory session) {
        return sessions[_sessionKey];
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
