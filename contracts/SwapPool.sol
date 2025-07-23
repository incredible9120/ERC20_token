// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwapPool {
    IERC20 public usdt;
    IERC20 public wizard;

    uint256 public reserveUSDT;
    uint256 public reserveWizard;

    event Swap(
        address indexed user,
        address tokenIn,
        uint256 amountIn,
        address tokenOut,
        uint256 amountOut
    );
    event AddLiquidity(
        address indexed provider,
        uint256 usdtAmount,
        uint256 wizardAmount
    );

    constructor(address _usdt, address _wizard) {
        usdt = IERC20(_usdt);
        wizard = IERC20(_wizard);
    }

    function addLiquidity(uint256 usdtAmount, uint256 wizardAmount) external {
        require(
            usdt.transferFrom(msg.sender, address(this), usdtAmount),
            "USDT transfer failed"
        );
        require(
            wizard.transferFrom(msg.sender, address(this), wizardAmount),
            "Wizard transfer failed"
        );
        reserveUSDT += usdtAmount;
        reserveWizard += wizardAmount;
        emit AddLiquidity(msg.sender, usdtAmount, wizardAmount);
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");
        uint256 amountInWithFee = amountIn * 1000; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }

    function swap(address tokenIn, uint256 amountIn) external {
        require(
            tokenIn == address(usdt) || tokenIn == address(wizard),
            "Invalid token"
        );
        bool isUSDTIn = tokenIn == address(usdt);
        IERC20 inToken = isUSDTIn ? usdt : wizard;
        IERC20 outToken = isUSDTIn ? wizard : usdt;
        uint256 reserveIn = isUSDTIn ? reserveUSDT : reserveWizard;
        uint256 reserveOut = isUSDTIn ? reserveWizard : reserveUSDT;
        require(
            inToken.transferFrom(msg.sender, address(this), amountIn),
            "Transfer failed"
        );
        uint256 amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        require(
            outToken.transfer(msg.sender, amountOut),
            "Transfer out failed"
        );
        if (isUSDTIn) {
            reserveUSDT += amountIn;
            reserveWizard -= amountOut;
        } else {
            reserveWizard += amountIn;
            reserveUSDT -= amountOut;
        }
        emit Swap(msg.sender, tokenIn, amountIn, address(outToken), amountOut);
    }
}
