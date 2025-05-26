// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface INFT {
    function balanceOf(address account) external view returns (uint256);
}

contract Subscription {
    struct Subscriber {
        uint256 expiry; // Subscription expiry timestamp
        uint256 createdAt; // Subscription creation timestamp
        uint256 renewals; // Number of renewals
    }
    struct Plan {
        uint256 price;
        string name;
        uint256 duration;
        uint256 count; // Number of purchases
    }

    address public constant SENDORA_NFT =
        0x442F2FF8e3a8bCb983fe47efd5AF9993A71594da;

    // Contract state variables
    address public constant feeCollector =
        0x0c73894c8dBc2F48EFd57E340934D6A2c172fC81;

    mapping(address => Subscriber) public subscribers; // Mapping of subscriber details

    mapping(string => Plan) public plans;

    event SubscriptionPurchased(
        address indexed subscriber,
        address referrer,
        string plan,
        uint256 price,
        uint256 commission,
        uint256 timestamp,
        string purchaseType
    );

    constructor() {
        plans["monthly"] = Plan(0.1 ether, "monthly", 30 days, 0);
        plans["yearly"] = Plan(0.4 ether, "yearly", 365 days, 0);
    }

    function purchaseSubscription(
        string memory plan,
        address recipient,
        address referrer
    ) public payable {
        require(
            plans[plan].duration >= 30 days,
            "Plan duration must be at least 30 days"
        );

        uint256 totalETH = plans[plan].price;

        require(msg.value >= totalETH, "Insufficient ETH");

        uint256 commission = _allocateToolFee(recipient, referrer);
        bool result = addOrRenewSubscription(recipient, plans[plan]);

        plans[plan].count = plans[plan].count + 1;
        emit SubscriptionPurchased(
            recipient,
            referrer,
            plan,
            plans[plan].price,
            commission,
            block.timestamp,
            result ? "Created" : "Renewed"
        );
    }

    function addOrRenewSubscription(
        address user,
        Plan memory plan
    ) private returns (bool) {
        uint256 newExpiry = block.timestamp + plan.duration;

        if (subscribers[user].createdAt != 0) {
            newExpiry = subscribers[user].expiry + plan.duration;
            if (subscribers[user].expiry < block.timestamp) {
                newExpiry = block.timestamp + plan.duration;
            }

            subscribers[user].expiry = newExpiry;
            subscribers[user].renewals = subscribers[user].renewals + 1;
            return true;
        } else {
            subscribers[user] = Subscriber({
                expiry: newExpiry,
                createdAt: block.timestamp,
                renewals: 1
            });
        }
        return false;
    }

    function _allocateToolFee(
        address recipient,
        address referrer
    ) internal returns (uint256) {
        uint256 referralRewardETH = 0;
        (bool isValid, uint256 rate) = isValidReferrer(referrer);

        if (isValid && recipient != referrer) {
            referralRewardETH = (msg.value * rate) / 100;
            (bool success, ) = payable(referrer).call{value: referralRewardETH}(
                ""
            );
            require(success, "Referral reward transfer failed");
        }

        (bool feeSuccess, ) = payable(feeCollector).call{
            value: address(this).balance
        }("");

        require(feeSuccess, "ToolFee transfer failed");

        return referralRewardETH;
    }

    function isValidReferrer(
        address referrer
    ) public view returns (bool, uint256) {
        if (INFT(SENDORA_NFT).balanceOf(referrer) >= 1) return (true, 25); // sendoragenesisnft holder
        if (subscribers[referrer].expiry >= block.timestamp) return (true, 5);
        return (false, 0);
    }

    function getSubscription(
        address user
    ) external view returns (bool isValid, uint256 expiry, uint256 createdAt) {
        Subscriber memory subscriber = subscribers[user];
        return (
            subscriber.expiry >= block.timestamp,
            subscriber.expiry,
            subscriber.createdAt
        );
    }
}
