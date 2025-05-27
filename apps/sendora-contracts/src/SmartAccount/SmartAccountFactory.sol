// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import {Clones} from "openzeppelin-contracts/contracts/proxy/Clones.sol";
import "./ISmartAccount.sol";

contract SmartAccountFactory {
    event CloneDeployed(address clone);

    function createClone(
        address implementation,
        address relayer,
        uint256 initGasFee
    ) external payable returns (address clone) {
        clone = Clones.cloneDeterministic(
            implementation,
            keccak256(abi.encodePacked(msg.sender))
        );
        ISmartAccount(clone).init{value: msg.value}(
            msg.sender,
            relayer,
            initGasFee
        );

        emit CloneDeployed(clone);
    }
}
