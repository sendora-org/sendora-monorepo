// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import {Receiver} from "solady/accounts/Receiver.sol";

// Every year (365 days), withdraw the ETH from the contract to the fixed address feeCollector.
contract AnnualTimelock is Receiver {
    address public owner;
    uint256 public lastWithdrawal = 1759309200; // 2025-10-1 17:00:00 UTC+8
    uint256 public constant interval = 365 days;

    address public constant feeCollector =
        0x0c73894c8dBc2F48EFd57E340934D6A2c172fC81;

    event Withdrawal(address indexed to, uint256 amount, uint256 timestamp);

    function withdraw() public {
        require(
            block.timestamp >= lastWithdrawal + interval,
            "Withdrawal too early. Only once per year."
        );

        uint256 amount = address(this).balance;
        _sendEther(payable(feeCollector), amount);

        lastWithdrawal = block.timestamp;
        emit Withdrawal(owner, amount, block.timestamp);
    }

    // Send Ether
    function _sendEther(address payable to, uint256 amount) internal {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
