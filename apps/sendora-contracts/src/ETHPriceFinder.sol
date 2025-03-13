// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IUniswapV3Pool {
    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        );
}

interface IChainlinkFeed {
    function latestAnswer() external view returns (uint256 price);
}

contract ETHPriceFinder {
    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant CHAINLINK_DECIMALS = 8;
    address public constant ETH_USDC_POOL_BASE =
        0xd0b53D9277642d899DF5C87A3966A349A798F224;
    address public constant CHAINLINK_FEED_BASE =
        0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70;

    function getETHPriceByUniswapV3() public view returns (uint256) {
        IUniswapV3Pool poolContract = IUniswapV3Pool(ETH_USDC_POOL_BASE);
        (uint160 sqrtPriceX96, , , , , , ) = poolContract.slot0();
        return (uint256(sqrtPriceX96) ** 2 * 1e18) / (2 ** 192);
    }

    function getETHPriceByChainlink() public view returns (uint256) {
        IChainlinkFeed feedContract = IChainlinkFeed(CHAINLINK_FEED_BASE);
        return feedContract.latestAnswer();
    }

    function getETHPrice() public view returns (uint256) {
        uint256 uniswapV3Price = getETHPriceByUniswapV3() *
            (10 ** (CHAINLINK_DECIMALS - USDC_DECIMALS));
        uint256 chainlinkPrice = getETHPriceByChainlink();

        return
            uniswapV3Price > chainlinkPrice ? uniswapV3Price : chainlinkPrice;
    }
}
