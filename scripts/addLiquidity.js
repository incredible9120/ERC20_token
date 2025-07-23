const { ethers } = require("hardhat");

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
  "function addLiquidity(uint256 usdtAmount, uint256 wizardAmount)",
];

async function main() {
  const [signer] = await ethers.getSigners();
  const usdtAmount = ethers.parseUnits("1000000", 18); // Amount of USDT to add
  const wizardAmount = ethers.parseUnits("1000000", 18); // Amount of Wizard to add

  const usdt = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);
  const wizard = new ethers.Contract(WIZARD_ADDRESS, ERC20_ABI, signer);
  const pool = new ethers.Contract(SWAPPOOL_ADDRESS, SWAPPOOL_ABI, signer);

  // Approve pool to spend USDT
  let allowance = await usdt.allowance(signer.address, SWAPPOOL_ADDRESS);
  if (allowance < usdtAmount) {
    let tx = await usdt.approve(SWAPPOOL_ADDRESS, usdtAmount);
    await tx.wait();
    console.log("Approved USDT");
  }

  // Approve pool to spend Wizard
  allowance = await wizard.allowance(signer.address, SWAPPOOL_ADDRESS);
  if (allowance < wizardAmount) {
    let tx = await wizard.approve(SWAPPOOL_ADDRESS, wizardAmount);
    await tx.wait();
    console.log("Approved Wizard");
  }

  // Add liquidity
  let tx = await pool.addLiquidity(usdtAmount, wizardAmount);
  await tx.wait();
  console.log("Liquidity added!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
