const { ethers } = require("hardhat");
const readline = require("readline");

// Replace with your deployed contract addresses
const USDT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const WIZARD_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const SWAPPOOL_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// Minimal ABIs
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];
const SWAPPOOL_ABI = [
  "function swap(address tokenIn, uint256 amountIn)",
  "function reserveUSDT() view returns (uint256)",
  "function reserveWizard() view returns (uint256)",
  "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) view returns (uint256)",
];

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask(query) {
    return new Promise((resolve) => rl.question(query, resolve));
  }

  const tokenInName = (
    await ask("Enter token to swap from (USDT or WIZARD): ")
  ).toUpperCase();
  const amountStr = await ask("Enter amount to swap: ");
  rl.close();

  let tokenIn, tokenOut, reserveIn, reserveOut;
  if (tokenInName === "USDT") {
    tokenIn = USDT_ADDRESS;
    tokenOut = WIZARD_ADDRESS;
  } else if (tokenInName === "WIZARD") {
    tokenIn = WIZARD_ADDRESS;
    tokenOut = USDT_ADDRESS;
  } else {
    console.log("Invalid token. Use USDT or WIZARD.");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  const amount = ethers.parseUnits(amountStr, 18);
  const tokenContract = new ethers.Contract(tokenIn, ERC20_ABI, signer);
  const pool = new ethers.Contract(SWAPPOOL_ADDRESS, SWAPPOOL_ABI, signer);

  // Get reserves
  const reserveUSDT = await pool.reserveUSDT();
  const reserveWizard = await pool.reserveWizard();
  if (tokenInName === "USDT") {
    reserveIn = reserveUSDT;
    reserveOut = reserveWizard;
  } else {
    reserveIn = reserveWizard;
    reserveOut = reserveUSDT;
  }

  // Calculate expected output
  let amountOut;
  try {
    amountOut = await pool.getAmountOut(amount, reserveIn, reserveOut);
  } catch (e) {
    console.log("Error calculating output:", e);
    process.exit(1);
  }

  // Approve pool to spend token
  const allowance = await tokenContract.allowance(
    signer.address,
    SWAPPOOL_ADDRESS
  );
  if (allowance < amount) {
    const tx = await tokenContract.approve(SWAPPOOL_ADDRESS, amount);
    await tx.wait();
    console.log("Approved pool to spend token");
  }

  // Swap
  const tx2 = await pool.swap(tokenIn, amount);
  await tx2.wait();
  console.log(
    `Swapped ${amountStr} ${tokenInName} for ${ethers.formatUnits(
      amountOut,
      18
    )} ${tokenInName === "USDT" ? "WIZARD" : "USDT"}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
