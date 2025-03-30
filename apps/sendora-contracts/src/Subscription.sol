// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./ETHPriceFinder.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IWETH} from "./interfaces/IWETH.sol";

// ERC20 token interface for token transfers and balance checks
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

    function balanceOf(address account) external view returns (uint256);
}

// NFT interface for querying total supply, ownership, and balance
interface INFT {
    function totalSupply() external view returns (uint256);

    function ownerOf(uint256 id) external view returns (address);

    function balanceOf(address account) external view returns (uint256);
}

// NFT staking interface to retrieve random staker
interface INFTStaking {
    function getRandomStaker() external view returns (address);
}

contract Subscription is ETHPriceFinder {
    // Struct to store subscriber details
    struct Subscriber {
        uint256 expiry; // Subscription expiry timestamp
        address referrer; // Address of the referrer
        uint256 createdAt; // Subscription creation timestamp
    }

    // Constants for pricing (in USD, scaled to 10^8 for precision)
    uint256 public constant DEFAULT_SUBSCRIPTION_PRICE = 8; // 800 USD, temporarily 8 for testing
    uint256 public constant REFERRAL_REWARD = 2; // 200 USD, temporarily 2 for testing
    uint256 public constant AIRDROP_AMOUNT = 2; // 200 USD, temporarily 2 for testing

    // Token and contract addresses
    address public constant SNDRA_TOKEN =
        0xb7e943C2582f76Ef220d081468CeC97ccdaDc3Ee;
    address public constant WETH_TOKEN =
        0x4200000000000000000000000000000000000006;
    address public constant SWAP_ROUTER =
        0x2626664c2603336E57B271c5C0b26F421741e481;
    address public constant SENDORA_NFT =
        0x442F2FF8e3a8bCb983fe47efd5AF9993A71594da;
    address public constant NFT_STAKING =
        0x57038da0F566E9dD26A4702bac86a658359D2AE6;

    // Contract state variables
    address public feeCollector; // Address to collect subscription fees
    address public owner; // Contract owner address
    mapping(address => Subscriber) public subscribers; // Mapping of subscriber details
    uint256 public subscriberCount; // Total number of subscribers
    mapping(address => bool) public isKOL; // Mapping to track Key Opinion Leaders (KOLs)

    // Events for tracking subscription actions
    event SubscriptionPurchased(address indexed recipient, address referrer);
    event SubscriptionRenewed(address indexed subscriber, uint256 newExpiry);
    event SubscriptionCreated(
        address indexed subscriber,
        uint256 expiry,
        address referrer
    );

    // Modifier to restrict access to owner-only functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Constructor to initialize fee collector and owner addresses
    constructor(address _feeCollector, address _owner) payable {
        feeCollector = _feeCollector;
        owner = _owner;
    }

    /**
     * @notice Adds a Key Opinion Leader (KOL) to the list of approved referrers
     * @dev This function can only be called by the contract owner, as enforced by the `onlyOwner` modifier.
     *      The `onlyOwner` modifier is specifically used here to restrict access to this sensitive operation.
     * @param kolAddress The address to be registered as a KOL
     */
    function registerKOL(address kolAddress) external onlyOwner {
        isKOL[kolAddress] = true;
    }

    /**
     * @notice Purchases a subscription for a recipient with an optional referrer
     * @param recipient The address to receive the subscription
     * @param referrer The address of the referrer (if any)
     * @param amountOutMinimum Minimum amount of tokens expected from swap
     * @param sqrtPriceLimitX96 Price limit for the swap (Uniswap V3)
     */
    function purchaseSubscription(
        address recipient,
        address referrer,
        uint256 amountOutMinimum,
        uint160 sqrtPriceLimitX96
    ) public payable {
        (, uint256 totalETH) = calculateSubscriptionPrice();
        require(msg.value >= totalETH, "Insufficient ETH sent");
        addOrRenewSubscription(recipient, referrer);

        // Determine valid referrer and calculate reward
        address validReferrer = getValidReferrer(recipient, referrer);
        uint256 referralRewardETH = 0;
        uint256 ethPrice = getETHPrice();
        if (validReferrer != address(0)) {
            referralRewardETH =
                ((REFERRAL_REWARD * 10 ** 8) / ethPrice) *
                10 ** 18;
        }

        // Calculate airdrop amount in ETH and perform swap to SNDRA
        uint256 airdropETH = ((AIRDROP_AMOUNT * 2 * 10 ** 8) / ethPrice) *
            10 ** 18;
        IWETH(WETH_TOKEN).deposit{value: airdropETH}();
        IWETH(WETH_TOKEN).approve(SWAP_ROUTER, airdropETH);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH_TOKEN,
                tokenOut: SNDRA_TOKEN,
                fee: 1000, // Uniswap pool fee (0.1%)
                recipient: address(this),
                amountIn: airdropETH,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: sqrtPriceLimitX96
            });

        // Execute swap from WETH to SNDRA
        ISwapRouter(SWAP_ROUTER).exactInputSingle(params);

        // Distribute SNDRA airdrop
        uint256 sndraBalance = IERC20(SNDRA_TOKEN).balanceOf(address(this));
        uint256 halfSndra = sndraBalance / 2;

        uint256 random = generateRandomNumber();
        distributeAirdropToNFTOwner(random, halfSndra, SENDORA_NFT);

        distributeAirdropToStaker(halfSndra, NFT_STAKING);

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

        emit SubscriptionPurchased(recipient, referrer);
    }

    /**
     * @notice Distributes SNDRA airdrop to a random NFT owner
     * @param random Random number for selecting recipient
     * @param amount Amount of SNDRA to distribute
     * @param nftContract Address of the NFT contract
     */
    function distributeAirdropToNFTOwner(
        uint256 random,
        uint256 amount,
        address nftContract
    ) public {
        uint256 totalSupply = INFT(nftContract).totalSupply();
        uint256 tokenId = (random % totalSupply) + 1;
        address recipient = INFT(nftContract).ownerOf(tokenId);

        if (totalSupply == 0) {
            IERC20(SNDRA_TOKEN).transfer(feeCollector, amount);
        } else {
            IERC20(SNDRA_TOKEN).transfer(recipient, amount);
        }
    }

    /**
     * @notice Distributes SNDRA airdrop to a random NFT staker
     * @param amount Amount of SNDRA to distribute
     * @param stakingContract Address of the staking contract
     */
    function distributeAirdropToStaker(
        uint256 amount,
        address stakingContract
    ) public {
        address recipient = INFTStaking(stakingContract).getRandomStaker();

        if (recipient == address(0)) {
            IERC20(SNDRA_TOKEN).transfer(feeCollector, amount);
        } else {
            IERC20(SNDRA_TOKEN).transfer(recipient, amount);
        }
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
        totalUSD = priceUSD;
        totalETH = (totalUSD / ethPrice) * 10 ** 18;
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
        if (INFT(SENDORA_NFT).balanceOf(referrer) >= 1) return referrer; // NFT holder
        if (isKOL[referrer]) return referrer; // Registered KOL
        if (subscribers[recipient].createdAt != 0)
            return subscribers[recipient].referrer; // Existing referrer
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
            subscribers[user].expiry = newExpiry;
            emit SubscriptionRenewed(user, newExpiry);
        } else {
            subscribers[user] = Subscriber({
                expiry: newExpiry,
                referrer: referrer,
                createdAt: block.timestamp
            });
            subscriberCount += 1;
            emit SubscriptionCreated(user, newExpiry, referrer);
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

    /**
     * @notice Generates a pseudo-random number based on blockchain data
     * @return Random number
     */
    function generateRandomNumber() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        msg.sender,
                        subscriberCount
                    )
                )
            );
    }
}
