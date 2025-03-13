// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract FeeCollector {
    address public feeRecipient;
    mapping(address => uint256) public lastWithdrawalTime;
    uint256 public constant WITHDRAWAL_INTERVAL = 30 days;

    event Withdrawal(uint256 amount, address indexed token);

    modifier onlyOwner() {
        require(
            msg.sender == feeRecipient,
            "Only owner can perform this action"
        );
        _;
    }

    constructor(address _feeRecipient) payable {
        _updateFeeRecipient(_feeRecipient);
    }

    function updateFeeRecipient(address _feeRecipient) public onlyOwner {
        _updateFeeRecipient(_feeRecipient);
    }

    function _updateFeeRecipient(address _feeRecipient) private {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    function withdrawETH() public {
        require(
            block.timestamp >=
                lastWithdrawalTime[address(0)] + WITHDRAWAL_INTERVAL,
            "Withdrawal locked"
        );
        require(address(this).balance > 0, "No ETH to withdraw");

        lastWithdrawalTime[address(0)] = block.timestamp;
        uint256 balance = address(this).balance;
        (bool success, ) = payable(feeRecipient).call{value: balance}("");
        require(success, "ETH Transfer failed");
        emit Withdrawal(balance, address(0));
    }

    function withdrawERC20(address _token) public {
        require(_token != address(0), "Invalid token address");
        require(
            block.timestamp >= lastWithdrawalTime[_token] + WITHDRAWAL_INTERVAL,
            "Withdrawal locked"
        );

        IERC20 token = IERC20(_token);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No token balance to withdraw");

        lastWithdrawalTime[_token] = block.timestamp;

        safeTransfer(address(token), feeRecipient, balance);
        emit Withdrawal(balance, _token);
    }

    function safeTransfer(
        address _token,
        address _to,
        uint256 _amount
    ) internal {
        (bool success, bytes memory data) = _token.call(
            abi.encodeWithSignature("transfer(address,uint256)", _to, _amount)
        );

        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "Transfer failed"
        );
    }

    receive() external payable {}
}
