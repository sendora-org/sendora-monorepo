// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;
}

interface IUniswapV3Pool {
    function liquidity() external view returns (uint128);
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

interface INonfungiblePositionManager {
    function positions(
        uint256 tokenId
    )
        external
        view
        returns (
            uint96 nonce,
            address operator,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        );
}

contract NFTStaking {
    address public constant NONFUNGIBLE_POSITION_MANAGER =
        0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1;
    address public constant WETH = 0x4200000000000000000000000000000000000006;
    address public constant ETH_SDNRA_POOL =
        0x0A22340713E114aeb7D004351Dc09fD7539C8DC7;

    // Mapping from user => staked tokenId
    mapping(address => uint256) public stakedNFTs;

    // List of stakers
    address[] public users;

    // Events
    event Staked(address indexed user, uint256 tokenId);
    event Unstaked(address indexed user, uint256 tokenId);

    function stake(uint256 _tokenId) external {
        require(
            stakedNFTs[msg.sender] == 0 && users.length < 1000,
            "Already staked or limit reached"
        );

        uint256 wethInPool = IERC20(WETH).balanceOf(ETH_SDNRA_POOL);
        uint128 totalLiquidity = IUniswapV3Pool(ETH_SDNRA_POOL).liquidity();

        require(totalLiquidity > 0, "Invalid pool liquidity");

        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            uint128 userLiquidity,
            ,
            ,
            ,

        ) = INonfungiblePositionManager(NONFUNGIBLE_POSITION_MANAGER).positions(
                _tokenId
            );

        uint256 userShareInWETH = (uint256(userLiquidity) * wethInPool) /
            totalLiquidity;
        require(
            userShareInWETH >= 0.5 ether,
            "Minimum 0.5 ETH liquidity required"
        );

        IERC721(NONFUNGIBLE_POSITION_MANAGER).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );

        stakedNFTs[msg.sender] = _tokenId;
        users.push(msg.sender);

        emit Staked(msg.sender, _tokenId);
    }

    function unstake() external {
        uint256 tokenId = stakedNFTs[msg.sender];
        require(tokenId != 0, "Nothing staked");

        delete stakedNFTs[msg.sender];
        _removeUser(msg.sender);

        IERC721(NONFUNGIBLE_POSITION_MANAGER).transferFrom(
            address(this),
            msg.sender,
            tokenId
        );

        emit Unstaked(msg.sender, tokenId);
    }

    function _removeUser(address user) internal {
        uint256 length = users.length;
        for (uint256 i = 0; i < length; i++) {
            if (users[i] == user) {
                users[i] = users[length - 1];
                users.pop();
                break;
            }
        }
    }

    function getAllStakers() external view returns (address[] memory) {
        return users;
    }

    function getRandomStaker() external view returns (address) {
        if (users.length == 0) return address(0);

        uint256 rand = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    blockhash(block.number - 1),
                    users.length
                )
            )
        );
        return users[rand % users.length];
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}