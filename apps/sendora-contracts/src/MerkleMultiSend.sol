// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleMultiSend {
    mapping(bytes32 => bool) public executed;

    event MultisendERC20Executed(
        bytes32 indexed uuid,
        bytes32 indexed merkleRoot,
        address indexed referrer,
        uint256 totalRecipients,
        uint256 totalAmount
    );

    event MultisendETHExecuted(
        bytes32 indexed uuid,
        bytes32 indexed merkleRoot,
        address indexed referrer,
        uint256 totalRecipients,
        uint256 totalAmount
    );

    function multisendETH(
        bytes32 uuid,
        bytes32 merkleRoot,
        address[] calldata recipients,
        uint256[] calldata amounts,
        address referrer,
        bytes32[] calldata proof
    ) external {
        _validateMerkleOperation(uuid, merkleRoot, proof, recipients, amounts);

        uint256 totalAmount = 0;

        for (uint256 i = 0; i < len; i++) {
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "ETH transfer failed");
            totalAmount += amounts[i];
        }

        emit MultisendETHExecuted(uuid, referrer, len, totalAmount);
    }

    function multisendERC20(
        bytes32 uuid,
        bytes32 merkleRoot,
        address[] calldata recipients,
        uint256[] calldata amounts,
        address tokenAddress,
        address referrer,
        bytes32[] calldata proof
    ) external {
        _validateMerkleOperation(uuid, merkleRoot, proof, recipients, amounts);

        uint256 totalAmount = 0;

        IERC20 token = IERC20(tokenAddress);
        for (uint256 i = 0; i < len; i++) {
            require(
                token.transferFrom(msg.sender, recipients[i], amounts[i]),
                "ERC20 transfer failed"
            );
            totalAmount += amounts[i];
        }

        emit MultisendERC20Executed(uuid, referrer, len, totalAmount);
    }

    function computeOperationId(
        bytes32 uuid,
        bytes32 merkleRoot,
        bytes32[] calldata proof
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(uuid, merkleRoot, proof));
    }
}

function _validateMerkleOperation(
    bytes32 uuid,
    bytes32 merkleRoot,
    bytes32[] calldata proof,
    address[] calldata recipients,
    uint256[] calldata amounts
) internal {
    bytes32 operationId = keccak256(abi.encode(uuid, merkleRoot, proof));
    require(!executed[operationId], "Operation already executed");

    uint256 len = recipients.length;
    require(len > 0, "No recipients");
    require(len == amounts.length, "Input length mismatch");

    bytes32 leaf = keccak256(abi.encode(recipients, amounts));

    require(
        MerkleProof.verify(proof, merkleRoot, leaf),
        "Invalid Merkle proof"
    );

    executed[operationId] = true;
}
