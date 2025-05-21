// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./types.sol";

interface SmartAccount {
    function init(address owner, Call[] calldata calls) external payable;
}

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
        SmartAccount(clone).init{value: msg.value}(msg.sender, calls);
        emit CloneDeployed(clone);
    }
}
