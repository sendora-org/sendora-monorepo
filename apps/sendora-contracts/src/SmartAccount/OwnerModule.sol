// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OwnerModule {
    address private owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (msg.sender != owner || owner == address(0)) {
            revert OwnableUnauthorizedAccount(msg.sender);
        }
    }

    function _setOwner(address newOwner) internal {
        owner = newOwner;
    }

    function _getOwner() internal view returns (address) {
        return owner;
    }
}
