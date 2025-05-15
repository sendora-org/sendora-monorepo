// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

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

    // commission
    uint256 public commission_amount;
    uint256 public commission_tx;
    uint256 public commission_referrer;

    mapping(address => uint256) public referrerMap;

    event SubscriptionPurchased(
        address indexed subscriber,
        address referrer,
        string plan,
        uint256 price
    );
    event SubscriptionRenewed(
        address indexed subscriber,
        string plan,
        uint256 price,
        uint256 newExpiry
    );
    event SubscriptionCreated(
        address indexed subscriber,
        string plan,
        uint256 price,
        uint256 expiry
    );

    constructor() {
        plans["monthly"] = Plan(0.1 ether, "monthly", 30 days, 0);
        plans["yearly"] = Plan(0.2 ether, "yearly", 365 days, 0);
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

        _allocateToolFee(recipient, referrer);
        addOrRenewSubscription(recipient, plans[plan]);

        plans[plan].count = plans[plan].count + 1;
        emit SubscriptionPurchased(
            recipient,
            referrer,
            plan,
            plans[plan].price
        );
    }

    function addOrRenewSubscription(address user, Plan memory plan) private {
        uint256 newExpiry = block.timestamp + plan.duration;

        if (subscribers[user].createdAt != 0) {
            newExpiry = subscribers[user].expiry + plan.duration;
            if (subscribers[user].expiry < block.timestamp) {
                newExpiry = block.timestamp + plan.duration;
            }

            subscribers[user].expiry = newExpiry;
            subscribers[user].renewals = subscribers[user].renewals + 1;
            emit SubscriptionRenewed(user, plan.name, plan.price, newExpiry);
        } else {
            subscribers[user] = Subscriber({
                expiry: newExpiry,
                createdAt: block.timestamp,
                renewals: 1
            });
            emit SubscriptionCreated(user, plan.name, plan.price, newExpiry);
        }
    }

    function _allocateToolFee(address recipient, address referrer) internal {
        (bool isValid, uint256 rate) = isValidReferrer(referrer);

        if (isValid && recipient != referrer) {
            uint256 referralRewardETH = (msg.value * rate) / 100;

            commission_amount = commission_amount + referralRewardETH;

            if (referrerMap[referrer] == 0) {
                commission_referrer = commission_referrer + 1;
            }

            referrerMap[referrer] = referrerMap[referrer] + referralRewardETH;
            commission_tx = commission_tx + 1;

            (bool success, ) = payable(referrer).call{value: referralRewardETH}(
                ""
            );
            require(success, "Referral reward transfer failed");
        }

        (bool feeSuccess, ) = payable(feeCollector).call{
            value: address(this).balance
        }("");

        require(feeSuccess, "ToolFee transfer failed");
    }

    function isValidReferrer(
        address referrer
    ) public view returns (bool, uint256) {
        if (INFT(SENDORA_NFT).balanceOf(referrer) >= 1) return (true, 50); // sendoragenesisnft holder
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
