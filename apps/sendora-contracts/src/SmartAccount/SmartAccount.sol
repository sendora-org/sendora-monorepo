// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import {ECDSA} from "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./ISmartAccount.sol";
import "../interfaces/IERC1271.sol";
import {Receiver} from "solady/accounts/Receiver.sol";

contract SmartAccount is Receiver, ISmartAccount, IERC1271 {
    address private _owner;
    /// @notice ERC-1271 interface constants
    bytes4 internal constant _ERC1271_MAGIC_VALUE = 0x1626ba7e;
    bytes4 internal constant _ERC1271_FAIL_VALUE = 0xffffffff;

    string public constant DESCRIPTION =
        "Sign only on sendora.org.\nReject if shown anywhere else.";

    // signature usage
    mapping(bytes signature => uint256 count) public useSignatureCounts;

    function useSignature(
        bytes calldata signature
    ) internal returns (uint256 count) {
        count = useSignatureCounts[signature]++;
    }

    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) public view returns (bytes4 magicValue) {
        address signer = owner();

        (bool success, bytes memory result) = signer.staticcall(
            abi.encodeWithSelector(
                IERC1271.isValidSignature.selector,
                hash,
                signature
            )
        );

        if (
            success &&
            result.length == 32 &&
            bytes4(result) == _ERC1271_MAGIC_VALUE
        ) {
            return _ERC1271_MAGIC_VALUE;
        }

        // Validate signature against EOA as fallback
        (address recovered, ECDSA.RecoverError error, ) = ECDSA.tryRecover(
            hash,
            signature
        );
        if (error == ECDSA.RecoverError.NoError && recovered == signer) {
            return _ERC1271_MAGIC_VALUE;
        }

        // Default return failure value
        return _ERC1271_FAIL_VALUE;
    }

    function execute(
        Call[] calldata calls,
        bytes calldata signature,
        uint256 usageLimit,
        uint256 validUntil,
        CallPolicy[] calldata policies
    ) public payable {
        uint256 gas0 = gasleft();
        bool authrorized = false;

        // if (_getOwner() == msg.sender) {
        //     authrorized = true;
        // }

        // if (
        //     _isSessionValid(msg.sender) && _checkSessionkey(msg.sender, calls)
        // ) {
        //     authrorized = true;
        // }

        require(authrorized, "Not authorized");
        _multicall(_encodeCalls(calls));
        uint256 gas1 = gasleft();
        uint256 gasFee = (((gas0 - gas1) * 125) / 100) * tx.gasprice;
        _sendEther(payable(tx.origin), gasFee);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function init(address newOwner, Call[] calldata calls) public payable {
        require(owner() == address(0), "Already initialized");

        uint256 gas0 = gasleft();
        if (calls.length > 0) {
            _multicall(_encodeCalls(calls));
        }
        _owner = (newOwner);
        uint256 gas1 = gasleft();
        uint256 gasFee = (((gas0 - gas1) * 125) / 100) * tx.gasprice;
        _sendEther(payable(tx.origin), gasFee);
    }

    /**
     * @dev VENDORED FROM https://github.com/safe-global/safe-smart-account/blob/v1.4.1/contracts/libraries/MultiSend.sol
     * @dev Sends multiple transactions and reverts all if one fails.
     * @param transactions Encoded transactions. Each transaction is encoded as a packed bytes of
     *                     operation as a uint8 with 0 for a call or 1 for a delegatecall (=> 1 byte),
     *                     to as a address (=> 20 bytes),
     *                     value as a uint256 (=> 32 bytes),
     *                     data length as a uint256 (=> 32 bytes),
     *                     data as bytes.
     *                     see abi.encodePacked for more information on packed encoding
     */
    function _multicall(bytes memory transactions) internal {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let length := mload(transactions)
            let i := 0x20
            for {
                // Pre block is not used in "while mode"
            } lt(i, length) {
                // Post block is not used in "while mode"
            } {
                // First byte of the data is the operation.
                // We shift by 248 bits (256 - 8 [operation byte]) it right since mload will always load 32 bytes (a word).
                // This will also zero out unused data.
                let operation := shr(0xf8, mload(add(transactions, i)))
                // We offset the load address by 1 byte (operation byte)
                // We shift it right by 96 bits (256 - 160 [20 address bytes]) to right-align the data and zero out unused data.
                let to := shr(0x60, mload(add(transactions, add(i, 0x01))))
                // We offset the load address by 21 byte (operation byte + 20 address bytes)
                let value := mload(add(transactions, add(i, 0x15)))
                // We offset the load address by 53 byte (operation byte + 20 address bytes + 32 value bytes)
                let dataLength := mload(add(transactions, add(i, 0x35)))
                // We offset the load address by 85 byte (operation byte + 20 address bytes + 32 value bytes + 32 data length bytes)
                let data := add(transactions, add(i, 0x55))
                let success := 0
                switch operation
                case 0 {
                    success := call(gas(), to, value, data, dataLength, 0, 0)
                }
                case 1 {
                    success := delegatecall(gas(), to, data, dataLength, 0, 0)
                }
                if eq(success, 0) {
                    revert(0, 0)
                }
                // Next entry starts at 85 byte + data length
                i := add(i, add(0x55, dataLength))
            }
        }
    }

    // Send Ether
    function _sendEther(address payable to, uint256 amount) internal {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function _encodeCalls(
        Call[] memory calls
    ) internal view returns (bytes memory transactions) {
        bytes memory txs;

        for (uint i = 0; i < calls.length; i++) {
            Call memory c = calls[i];
            uint8 operation = address(this) == c.to ? c.operation : 0;
            bytes memory encoded = abi.encodePacked(
                operation, // 1 byte
                c.to, // 20 bytes
                c.value, // 32 bytes
                uint256(c.data.length), // 32 bytes
                c.data // N bytes
            );

            txs = bytes.concat(txs, encoded);
        }

        return txs;
    }
}
