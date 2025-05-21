// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import "@openzeppelin/contracts/interfaces/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./ISessionKeyModule.sol";
import "./types.sol";

interface ISmartAccount is ISessionKeyModule, IERC721Receiver, IERC1155Receiver {
    function revokeSession(address _sessionKey) external;

    function createSession(
        address _sessionKey,
        CallPolicy[] memory _policies,
        uint256 _validUntil
    ) external;

    function isSessionValid(address _sessionKey) external view returns (bool);

    function getSession(
        address _sessionKey
    ) external view returns (Session memory session);

    function execute(Call[] calldata calls) external payable;

    function owner() external view returns (address);

    function init(address owner, Call[] calldata calls) external payable;
}
