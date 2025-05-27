// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import {Clones} from "openzeppelin-contracts/contracts/proxy/Clones.sol";
import "./ISmartAccount.sol";

contract SmartAccountFactory {
    event CloneDeployed(address clone);

    function createClone(
        address implementation,
        Call[] calldata calls
    ) external payable returns (address clone) {
        clone = Clones.cloneDeterministic(
            implementation,
            keccak256(abi.encodePacked(msg.sender))
        );

        if (calls.length > 0) {
            ISmartAccount(clone).init{value: msg.value}(msg.sender, calls);
        } else {
            ISmartAccount(clone).init{value: msg.value}(msg.sender);
        }

        emit CloneDeployed(clone);
    }
}
