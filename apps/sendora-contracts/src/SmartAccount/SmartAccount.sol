// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import "@openzeppelin/contracts/interfaces/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./OwnerModule.sol";
import "./SessionKeyModule.sol";
import "./types.sol";
import "./ISmartAccount.sol";

contract SmartAccount is OwnerModule, SessionKeyModule, ISmartAccount {
    // Receive Ether
    receive() external payable {}

    function revokeSession(address _sessionKey) public onlyOwner {
        _revokeSession(_sessionKey);
    }

    function createSession(
        address _sessionKey,
        CallPolicy[] memory _policies,
        uint256 _validUntil
    ) public onlyOwner {
        _createSession(_sessionKey, _policies, _validUntil);
    }

    function isSessionValid(address _sessionKey) public view returns (bool) {
        return _isSessionValid(_sessionKey);
    }

    function getSession(
        address _sessionKey
    ) public view returns (Session memory session) {
        return _getSession(_sessionKey);
    }

    function execute(Call[] calldata calls) public payable {
        uint256 gas0 = gasleft();
        bool authrorized = false;

        if (_getOwner() == msg.sender) {
            authrorized = true;
        }

        if (
            _isSessionValid(msg.sender) && _checkSessionkey(msg.sender, calls)
        ) {
            authrorized = true;
        }

        require(authrorized, "Not authorized");
        _multicall(_encodeCalls(calls));
        uint256 gas1 = gasleft();
        uint256 gasFee = (((gas0 - gas1) * 125) / 100) * tx.gasprice;
        _sendEther(payable(tx.origin), gasFee);
    }

    function getOwner() public view returns (address) {
        return _getOwner();
    }

    function init(address newOwner, Call[] calldata calls) public payable {
        require(_getOwner() == address(0), "Already initialized");

        uint256 gas0 = gasleft();
        if (calls.length > 0) {
            _multicall(_encodeCalls(calls));
        }
        _setOwner(newOwner);
        uint256 gas1 = gasleft();
        uint256 gasFee = (((gas0 - gas1) * 125) / 100) * tx.gasprice;
        _sendEther(payable(tx.origin), gasFee);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
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
