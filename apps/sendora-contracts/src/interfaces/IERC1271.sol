// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IERC1271 {
    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) public view returns (bytes4 magicValue);
}
