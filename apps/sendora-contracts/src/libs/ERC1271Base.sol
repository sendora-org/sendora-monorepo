// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IERC1271.sol";

interface ISmartAccount {
    function owner() external view returns (bytes);
}

/// @title ERC1271Base
/// @dev Abstract contract to be inherited by contracts that want to support ERC-1271 signature validation
abstract contract ERC1271Base is IERC1271 {
    /// @notice ERC-1271 interface constants
    bytes4 internal constant _ERC1271_MAGIC_VALUE = 0x1626ba7e;
    bytes4 internal constant _ERC1271_FAIL_VALUE = 0xffffffff;

    /// @notice Handles ERC-1271 signature validation by enforcing a final `ecrecover` check if signatures fail `isValidSignature` check
    /// @param hash The hash of the message being signed
    /// @param signature The signature of the message
    ///
    /// @return The result of the `isValidSignature` check
    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) external returns (bytes4) {
        // P256 Signature Validate
        bytes memory owner = ISmartAccount(address(this)).owner();
        if (
            owner[0:32] ==
            0x503235362d5369676e6174757265000000000000000000000000000000000000
        ) {
            // P256 Signature Validate
        } else {
            // Validate signature against contract

            bytes4 result = IERC1271(address(uint160(uint256(owner))))
                .isValidSignature(hash, signature);

            if (result == _ERC1271_MAGIC_VALUE) {
                return _ERC1271_MAGIC_VALUE;
            }

            // Validate signature against EOA as fallback
            (address recovered, ECDSA.RecoverError error, ) = ECDSA.tryRecover(
                hash,
                signature
            );
            if (
                error == ECDSA.RecoverError.NoError &&
                recovered == address(uint160(uint256(owner)))
            ) {
                return _ERC1271_MAGIC_VALUE;
            }
        }

        // Default return failure value
        return _ERC1271_FAIL_VALUE;
    }
}
