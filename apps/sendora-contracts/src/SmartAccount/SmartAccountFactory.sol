// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import "@openzeppelin/contracts/proxy/Clones.sol";
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
        ISmartAccount(clone).init{value: msg.value}(msg.sender, calls);
        emit CloneDeployed(clone);
    }
}
