// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct Call {
    address to; // Replaced with `address(this)` if `address(0)`.
    uint256 value; // Amount of native currency (i.e. Ether) to send.
    bytes data; // Calldata to send with the call.
    uint8 operation; // Delegatecall(1) or Call(0).
}
