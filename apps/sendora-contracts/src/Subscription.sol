// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./ETHPriceFinder.sol";

interface INFT {
    function balanceOf(address account) external view returns (uint256);
}

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract Subscription is ETHPriceFinder {
    // Struct to store subscriber details
    struct Subscriber {
        uint256 expiry; // Subscription expiry timestamp
        address referrer; // Address of the referrer
        uint256 createdAt; // Subscription creation timestamp
    }

    struct Lock {
        uint256 unlockTime;
        bool isLocked;
    }

    // Constants for pricing (in USD, scaled to 10^8 for precision)
    uint256 public constant DEFAULT_SUBSCRIPTION_PRICE = 6; // 600 USD, temporarily 6 for testing
    uint256 public constant REFERRAL_REWARD = 2; // 200 USD, temporarily 2 for testing

    // Token and contract addresses
    address public constant SENDORA_NFT =
        0x442F2FF8e3a8bCb983fe47efd5AF9993A71594da;
    address public constant SNDRA = 0xb7e943C2582f76Ef220d081468CeC97ccdaDc3Ee;
    uint256 public constant LOCK_AMOUNT = 1_000_000 * 10 ** 18;
    // Contract state variables
    address public feeCollector; // Address to collect subscription fees
    mapping(address => Subscriber) public subscribers; // Mapping of subscriber details
    uint256 public subscriberCount; // Total number of subscribers
    mapping(address => bool) public isKOL; // Mapping to track Key Opinion Leaders (KOLs)

    mapping(address => Lock) public locks;

    // Events for tracking subscription actions
    event SubscriptionPurchased(address indexed recipient, address referrer);
    event SubscriptionRenewed(address indexed subscriber, uint256 newExpiry);
    event SubscriptionCreated(address indexed subscriber, uint256 expiry);
    event KOLRegistered(address indexed subscriber);

    event Locked(address indexed user, uint256 amount, uint256 unlockTime);

    event Unlocked(address indexed user, uint256 amount);

    // Modifier to restrict access to owner-only functions
    modifier onlyOwner() {
        require(
            msg.sender == feeCollector,
            "Only owner can perform this action"
        );
        _;
    }

    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
    }

    /**
     * @notice Adds a Key Opinion Leader (KOL) to the list of approved referrers
     * @dev This function can only be called by the contract owner, as enforced by the `onlyOwner` modifier.
     *      The `onlyOwner` modifier is specifically used here to restrict access to this sensitive operation.
     * @param kolAddress The address to be registered as a KOL
     */
    function registerKOL(address kolAddress) external onlyOwner {
        isKOL[kolAddress] = true;

        emit KOLRegistered(kolAddress);
    }

    /**
     * @notice Purchases a subscription for a recipient with an optional referrer
     * @param recipient The address to receive the subscription
     * @param referrer The address of the referrer (if any)
     */
    function purchaseSubscription(
        address recipient,
        address referrer
    ) public payable {
        (, uint256 totalETH) = calculateSubscriptionPrice();
        require(msg.value >= totalETH, "Insufficient ETH sent");

        require(
            recipient != referrer,
            "The recipient and the referrer cannot be the same."
        );
        // Determine valid referrer and calculate reward
        address validReferrer = getValidReferrer(recipient, referrer);
        uint256 referralRewardETH = 0;
        uint256 ethPrice = getETHPrice();
        if (validReferrer != address(0)) {
            referralRewardETH = ((REFERRAL_REWARD * 10 ** 8 * 10 ** 18) /
                ethPrice);
        }

        // Send referral reward if applicable
        if (validReferrer != address(0)) {
            (bool success, ) = payable(validReferrer).call{
                value: referralRewardETH
            }("");
            require(success, "Referral reward transfer failed");
        }

        // Transfer remaining ETH to fee collector
        (bool feeSuccess, ) = payable(feeCollector).call{
            value: address(this).balance
        }("");
        require(feeSuccess, "Fee transfer failed");

        addOrRenewSubscription(recipient, validReferrer);
        emit SubscriptionPurchased(recipient, validReferrer);
    }

    /**
     * @notice Calculates the subscription price in USD and ETH
     * @return totalUSD Price in USD (scaled by 10^8)
     * @return totalETH Price in ETH (scaled by 10^18)
     */
    function calculateSubscriptionPrice()
        public
        view
        returns (uint256 totalUSD, uint256 totalETH)
    {
        uint256 priceUSD = DEFAULT_SUBSCRIPTION_PRICE * 10 ** 8;
        uint256 ethPrice = getETHPrice();
        require(ethPrice > 0, "ETH price cannot be zero");

        totalUSD = priceUSD;
        totalETH = ((totalUSD * 10 ** 18) / ethPrice);
    }

    /**
     * @notice Determines a valid referrer for a subscription
     * @param recipient Subscriber address
     * @param referrer Proposed referrer address
     * @return Address of the valid referrer or zero address if none
     */
    function getValidReferrer(
        address recipient,
        address referrer
    ) public view returns (address) {
        if (subscribers[recipient].createdAt != 0)
            return subscribers[recipient].referrer; // Existing referrer
        if (INFT(SENDORA_NFT).balanceOf(referrer) >= 1) return referrer; // NFT holder
        if (isKOL[referrer]) return referrer; // Registered KOL
        if (subscribers[referrer].createdAt != 0) return referrer; // New referrer with subscription
        return address(0);
    }

    /**
     * @notice Adds or renews a subscription for a user
     * @param user Address of the subscriber
     * @param referrer Address of the referrer
     */
    function addOrRenewSubscription(address user, address referrer) private {
        uint256 newExpiry = block.timestamp + 365 days;

        if (subscribers[user].createdAt != 0) {
            newExpiry = subscribers[user].expiry + 365 days;
            if (subscribers[user].expiry < block.timestamp) {
                newExpiry = block.timestamp + 365 days;
            }

            subscribers[user].expiry = newExpiry;
            emit SubscriptionRenewed(user, newExpiry);
        } else {
            subscribers[user] = Subscriber({
                expiry: newExpiry,
                referrer: referrer,
                createdAt: block.timestamp
            });
            subscriberCount += 1;
            emit SubscriptionCreated(user, newExpiry);
        }
    }

    /**
     * @notice Retrieves subscription details for a user
     * @param user Address of the subscriber
     * @return isExpired Whether the subscription is expired
     * @return expiry Subscription expiry timestamp
     * @return referrer Referrer address
     * @return createdAt Subscription creation timestamp
     */
    function getSubscriptionDetails(
        address user
    )
        external
        view
        returns (
            bool isExpired,
            uint256 expiry,
            address referrer,
            uint256 createdAt
        )
    {
        Subscriber memory subscriber = subscribers[user];
        return (
            subscriber.expiry <= block.timestamp,
            subscriber.expiry,
            subscriber.referrer,
            subscriber.createdAt
        );
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

    /**
     * @dev Locks a fixed amount of tokens (LOCK_AMOUNT) for the caller for 1 year.
     *      The tokens are transferred from the caller to this contract.
     *      A subscription is added or renewed for the caller.
     */
    function lock() public {
        require(!locks[msg.sender].isLocked, "Already locked");
        uint256 unlockTime = block.timestamp + (1 * 365 days);
        safeTransfer(SNDRA, address(this), LOCK_AMOUNT);
        locks[msg.sender] = Lock({unlockTime: unlockTime, isLocked: true});
        addOrRenewSubscription(msg.sender, address(0));
        emit Locked(msg.sender, LOCK_AMOUNT, unlockTime);
    }

    /**
     * @dev Unlocks and transfers the locked tokens back to the caller.
     *      Can only be called after the unlock time has passed.
     */
    function unlock() public {
        Lock memory userLock = locks[msg.sender];
        require(userLock.isLocked, "No locked tokens found");
        require(
            block.timestamp >= userLock.unlockTime,
            "Tokens are still locked"
        );
        delete locks[msg.sender];

        require(
            IERC20(SNDRA).transfer(msg.sender, LOCK_AMOUNT),
            "Token transfer failed"
        );
        emit Unlocked(msg.sender, LOCK_AMOUNT);
    }
}
