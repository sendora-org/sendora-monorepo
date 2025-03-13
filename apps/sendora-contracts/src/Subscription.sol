// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./ETHPriceFinder.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IWETH} from "./interfaces/IWETH.sol";

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

interface INFT {
    function totalSupply() external view returns (uint256);

    function ownerOf(uint256 id) external view returns (address result);
}

contract Subscription is ETHPriceFinder {
    struct Stake {
        uint256 unlockTime;
        bool isStaked;
    }

    struct Subscriber {
        uint256 id;
        uint256 expiry;
        address referrer;
        uint256 createdAt;
    }

    address public constant BASEBUILDERNFT =
        0x8DC80A209A3362f0586e6C116973Bb6908170c84;
    address public constant UniswapV3PositionsNFT_V1 =
        0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1;

    uint256 public constant DEFAULT_PRICE = 8; // Default price: 800 USD ,Temporarily change to 8 for convenient on-chain testing.
    uint256 public constant DISCOUNT_PRICE = 6; // Discounted price:600 USD ,Temporarily change to 6 for convenient on-chain testing.
    uint256 public constant REWARD_AMOUNT = 2; // Referral reward: 200 USD,Temporarily change to 2 for convenient on-chain testing.
    uint256 public constant AIRDROP_AMOUNT = 2; // Airdrop: 200 USD,Temporarily change to 2 for convenient on-chain testing.

    uint256 public constant STAKE_AMOUNT = 1_000_000 * 10 ** 18;
    address public constant SNDRA = 0xb7e943C2582f76Ef220d081468CeC97ccdaDc3Ee;
    address public constant ETH_SDNRA_POOL_BASE =
        0x0A22340713E114aeb7D004351Dc09fD7539C8DC7;
    address public constant WETH = 0x4200000000000000000000000000000000000006;
    address public constant swapRouter =
        0x2626664c2603336E57B271c5C0b26F421741e481;

    address public feeCollector;
    address public owner;
    Subscriber[] public subscribers;

    mapping(address => uint256) public addressToId;
    mapping(address => Stake) public stakes;

    event Bought(
        address indexed recipient,
        uint256 numberOfYears,
        address referrer
    );

    event Staked(
        address indexed user,
        uint256 amount,
        uint256 numberOfYears,
        uint256 unlockTime
    );
    event Unstaked(address indexed user, uint256 amount);
    event SubscriptionUpdated(
        address indexed subscriber,
        uint256 numberOfYears,
        uint256 expiry
    );
    event SubscriptionCreated(
        address indexed subscriber,
        uint256 numberOfYears,
        uint256 expiry,
        address referrer
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor(address _feeCollector, address _owner) payable {
        feeCollector = _feeCollector;
        owner = _owner;
    }

    function buy(
        uint256 numberOfYears,
        address recipient,
        address referrer
    ) public payable {
        (, uint256 totalETH) = calcPrice(numberOfYears, recipient, referrer);

        require(msg.value >= totalETH, "Incorrect payment amount");

        address validReferrer = getValidReferrer(recipient, referrer);
        uint256 rewardETH = 0;
        uint256 ethPrice = getETHPrice();
        if (validReferrer != address(0)) {
            rewardETH = ((REWARD_AMOUNT * 10 ** 8) / ethPrice) * 10 ** 18;
            (bool success1, ) = payable(validReferrer).call{value: rewardETH}(
                ""
            );
            require(success1, "ETH Transfer failed");
        }

        uint256 amountIn = ((AIRDROP_AMOUNT * 10 ** 8) / ethPrice) * 10 ** 18;

        IWETH(WETH).deposit{value: amountIn}();
        IWETH(WETH).approve(swapRouter, amountIn);

        // Set up the swap parameters
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH,
                tokenOut: SNDRA,
                fee: 1000,
                recipient: address(this),
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // Execute the swap
        ISwapRouter(swapRouter).exactInputSingle(params);

        uint256 balance = IERC20(SNDRA).balanceOf(address(this));

        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    msg.sender,
                    countSubscribers()
                )
            )
        );

        uint256 amount1 = balance / 2;
        uint256 amount2 = balance - amount1;

        // Airdrop to Uniswap V2 LP holders.
        airdropSNDRA(random, amount1, UniswapV3PositionsNFT_V1);
        // Airdrop to Base builder NFT holders.
        airdropSNDRA(random, amount2, BASEBUILDERNFT);

        // Collect fee
        (bool success2, ) = payable(feeCollector).call{
            value: msg.value - rewardETH - amountIn
        }("");

        require(success2, "ETH Transfer failed");
        addSubscription(recipient, numberOfYears, referrer);
        emit Bought(recipient, numberOfYears, referrer);
    }

    function airdropSNDRA(
        uint256 random,
        uint256 balance,
        address NFTContract
    ) public {
        uint256 totalSupply = INFT(NFTContract).totalSupply();
        uint256 idx = random % totalSupply == 0 ? 1 : random % totalSupply;
        address recipient = INFT(NFTContract).ownerOf(idx);
        IERC20(SNDRA).transfer(recipient, balance);
    }

    function calcPrice(
        uint256 numberOfYears,
        address recipient,
        address referrer
    ) public view returns (uint256, uint256) {
        uint256 price = DEFAULT_PRICE * 10 ** 8;
        bool hasDiscount = checkDiscount(recipient, referrer);
        if (hasDiscount) {
            price = DISCOUNT_PRICE * 10 ** 8;
        }
        uint256 ethPrice = getETHPrice();
        uint256 totalUSD = price * numberOfYears;
        uint256 totalETH = (totalUSD / ethPrice) * 10 ** 18;
        return (totalUSD, totalETH);
    }

    function checkDiscount(
        address recipient,
        address referrer
    ) public view returns (bool) {
        uint256 referrerID = addressToId[referrer];
        uint256 recipientID = addressToId[recipient];
        bool has_discount = false;

        if (referrerID >= 1) {
            Subscriber memory referrerSub = subscribers[referrerID - 1];
            has_discount = referrerSub.expiry > block.timestamp;
        }

        if (recipientID >= 1) {
            has_discount = true;
        }

        return has_discount;
    }

    function getValidReferrer(
        address recipient,
        address referrer
    ) public view returns (address) {
        uint256 referrerID = addressToId[referrer];
        uint256 recipientID = addressToId[recipient];
        address validReferrer = address(0);

        if (referrerID >= 1) {
            Subscriber memory referrerSub = subscribers[referrerID - 1];
            if (referrerSub.expiry > block.timestamp) {
                validReferrer = referrer;
            }
        }

        if (recipientID >= 1) {
            Subscriber memory recipientSub = subscribers[recipientID - 1];

            uint256 referrer2ID = addressToId[recipientSub.referrer];
            Subscriber memory referrer2Sub = subscribers[referrer2ID - 1];
            if (referrer2Sub.expiry > block.timestamp) {
                validReferrer = referrer;
            } else {
                validReferrer = address(0);
            }
        }

        return validReferrer;
    }

    function stake(uint256 numberOfYears, address referrer) public {
        require(numberOfYears > 0, "Must stake for at least 1 year");
        require(!stakes[msg.sender].isStaked, "Already staked");

        uint256 unlockTime = block.timestamp + (numberOfYears * 365 days);

        require(
            IERC20(SNDRA).transferFrom(msg.sender, address(this), STAKE_AMOUNT),
            "Token transfer failed"
        );

        stakes[msg.sender] = Stake({unlockTime: unlockTime, isStaked: true});

        addSubscription(msg.sender, numberOfYears, referrer);

        emit Staked(msg.sender, numberOfYears, STAKE_AMOUNT, unlockTime);
    }

    function unstake() public {
        Stake memory userStake = stakes[msg.sender];
        require(userStake.isStaked, "No staked tokens found");
        require(
            block.timestamp >= userStake.unlockTime,
            "Tokens are still locked"
        );
        delete stakes[msg.sender];

        require(
            IERC20(SNDRA).transfer(msg.sender, STAKE_AMOUNT),
            "Token transfer failed"
        );

        emit Unstaked(msg.sender, STAKE_AMOUNT);
    }

    function gift(uint256 numberOfYears, address recipient) public onlyOwner {
        addSubscription(recipient, numberOfYears, address(0));
    }

    function countSubscribers() public view returns (uint256) {
        return subscribers.length;
    }

    function addSubscription(
        address user,
        uint256 numberOfYears,
        address referrer
    ) private {
        uint256 id = countSubscribers() + 1;
        uint256 newExpiry = block.timestamp + (numberOfYears * 365 days);

        if (addressToId[user] != 0) {
            id = addressToId[user];
            newExpiry = subscribers[id - 1].expiry + (numberOfYears * 365 days);
            subscribers[id - 1].expiry = newExpiry;
            emit SubscriptionUpdated(user, numberOfYears, newExpiry);
        } else {
            subscribers.push(
                Subscriber({
                    id: id,
                    expiry: newExpiry,
                    referrer: referrer,
                    createdAt: block.timestamp
                })
            );
            addressToId[user] = id;
            emit SubscriptionCreated(user, numberOfYears, newExpiry, referrer);
        }
    }

    function getSubscriptionInfo(
        address user
    )
        external
        view
        returns (
            uint256 id,
            bool isExpired,
            uint256 expiry,
            address referrer,
            uint256 createdAt
        )
    {
        id = addressToId[user];
        if (id > 0) {
            Subscriber memory subscriber = subscribers[id - 1];
            return (
                subscriber.id,
                subscriber.expiry <= block.timestamp,
                subscriber.expiry,
                subscriber.referrer,
                subscriber.createdAt
            );
        } else {
            return (0, false, 0, address(0), 0);
        }
    }
}
