// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleMultiSend {
    mapping(bytes32 => bool) public executed;

    event MultisendERC20Executed(
        address indexed referrer,
        uint256 referralRewardETH,
        address tokenAddress,
        bytes32 taskId,
        bytes32 merkleRoot,
        uint256 totalRecipients
    );

    event MultisendETHExecuted(
        address indexed referrer,
        uint256 referralRewardETH,
        bytes32 taskId,
        bytes32 merkleRoot,
        uint256 totalRecipients
    );

    address public feeCollector;
    address public owner; // Contract owner address

    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
    }

    // Function to send ETH to multiple recipients using a Merkle proof for validation
    function multisendETH(
        bytes32 taskId,
        bytes32 merkleRoot,
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes32[] calldata proof,
        address referrer
    ) external payable {
        _validateMerkleOperation(
            taskId,
            merkleRoot,
            proof,
            recipients,
            amounts
        );

        uint256 totalAmount = 0;
        uint256 len = recipients.length;

        for (uint256 i = 0; i < len; i++) {
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "ETH transfer failed");
            totalAmount += amounts[i];
        }

        uint256 fee = msg.value - totalAmount;
        distributeFee(referrer, fee);

        emit MultisendETHExecuted(referrer, fee / 2, taskId, merkleRoot, len);
    }

    // Function to send ERC20 Token to multiple recipients using a Merkle proof for validation
    function multisendERC20(
        bytes32 taskId,
        bytes32 merkleRoot,
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes32[] calldata proof,
        address referrer,
        address tokenAddress
    ) external payable {
        _validateMerkleOperation(
            taskId,
            merkleRoot,
            proof,
            recipients,
            amounts
        );

        uint256 len = recipients.length;
        for (uint256 i = 0; i < len; i++) {
            safeTransfer(tokenAddress, recipients[i], amounts[i]);
        }

        uint256 fee = msg.value;
        distributeFee(referrer, fee);

        emit MultisendERC20Executed(
            referrer,
            fee / 2,
            tokenAddress,
            taskId,
            merkleRoot,
            len
        );
    }

    function distributeFee(address referrer, uint256 fee) internal {
        uint256 referralRewardETH = fee / 2;

        // Send referral reward if applicable
        if (referrer != address(0)) {
            (bool success, ) = payable(referrer).call{value: referralRewardETH}(
                ""
            );
            require(success, "Referral reward transfer failed");
        }

        // Transfer remaining ETH to fee collector
        (bool feeSuccess, ) = payable(feeCollector).call{
            value: address(this).balance
        }("");
        require(feeSuccess, "Fee transfer failed");
    }

    function computeOperationId(
        bytes32 taskId,
        bytes32 merkleRoot,
        bytes32[] calldata proof
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(taskId, merkleRoot, proof));
    }

    function safeTransfer(
        address _token,
        address _to,
        uint256 _amount
    ) internal {
        (bool success, bytes memory data) = _token.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                _to,
                _amount
            )
        );

        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "Transfer failed"
        );
    }

    function _validateMerkleOperation(
        bytes32 taskId,
        bytes32 merkleRoot,
        bytes32[] calldata proof,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal {
        bytes32 operationId = keccak256(abi.encode(taskId, merkleRoot, proof));
        require(!executed[operationId], "Operation already executed");

        uint256 len = recipients.length;
        require(len > 0, "No recipients");
        require(len == amounts.length, "Input length  mismatch");

        bytes32 leaf = keccak256(abi.encode(recipients, amounts));

        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid Merkle proof"
        );

        executed[operationId] = true;
    }
}
