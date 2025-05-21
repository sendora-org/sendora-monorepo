// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleMultiSend2 {
    address public constant feeCollector =
        0x0c73894c8dBc2F48EFd57E340934D6A2c172fC81;

    struct Referrer {
        address referrer;
        bool isEligibleForCommission;
    }

    struct Token {
        address tokenAddress;
        uint256 decimals;
        string symbol;
    }

    mapping(bytes32 => bool) public executed;

    event Executed(
        address indexed referrer,
        address indexed from,
        bytes32 indexed executeID,
        address tokenAddress,
        uint256 decimals,
        string symbol,
        uint256 amount,
        uint256 toolFee,
        uint256 timestamp
    );

    function execute(
        bytes32 merkleRoot,
        bytes32[] calldata proof,
        bytes32 batchID,
        Token calldata token,
        Referrer calldata referrer,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable {
        // validate
        _validate(
            merkleRoot,
            proof,
            batchID,
            token,
            referrer,
            recipients,
            amounts
        );

        uint256 totalAmount = 0;
        uint256 toolFee = msg.value;

        // send
        if (token.tokenAddress == address(0)) {
            toolFee = msg.value - totalAmount;
            totalAmount = _sendETH(token, recipients, amounts);
        } else {
            totalAmount = _sendERC20(token, recipients, amounts);
        }

        // allocate fee
        _allocateToolFee(referrer, toolFee);

        bytes32 executeID = keccak256(abi.encode(batchID, merkleRoot, proof));
        emit Executed(
            referrer.referrer,
            msg.sender,
            executeID,
            token.tokenAddress,
            token.decimals,
            token.symbol,
            totalAmount,
            toolFee,
            block.timestamp
        );
    }

    function _sendETH(
        Token calldata token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal returns (uint256) {
        require(
            token.tokenAddress == address(0),
            "Invalid token, only ETH can be sent"
        );
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "ETH transfer failed");
            totalAmount += amounts[i];
        }
        return totalAmount;
    }

    function _sendERC20(
        Token calldata token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal returns (uint256) {
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            _safeTransfer(token.tokenAddress, recipients[i], amounts[i]);
            totalAmount += amounts[i];
        }
        return totalAmount;
    }

    function _validate(
        bytes32 merkleRoot,
        bytes32[] calldata proof,
        bytes32 batchID,
        Token calldata token,
        Referrer calldata referrer,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) internal {
        bytes32 executeID = keccak256(abi.encode(batchID, merkleRoot, proof));
        require(!executed[executeID], "Operation already executed");
        require(recipients.length == amounts.length, "Input length  mismatch");
        bytes32 leaf = keccak256(
            abi.encode(batchID, token, referrer, recipients, amounts)
        );

        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Invalid Merkle proof"
        );

        executed[executeID] = true;
    }

    function _safeTransfer(
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

    function _allocateToolFee(
        Referrer calldata referrer,
        uint256 toolFee
    ) internal {
        uint256 referralRewardETH = toolFee / 2;
        if (
            referrer.referrer != address(0) && referrer.isEligibleForCommission
        ) {
            (bool success, ) = payable(referrer.referrer).call{
                value: referralRewardETH
            }("");
            require(success, "Referral reward transfer failed");
        }

        (bool feeSuccess, ) = payable(feeCollector).call{
            value: address(this).balance
        }("");

        require(feeSuccess, "ToolFee transfer failed");
    }
}
