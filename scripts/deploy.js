const { ethers } = require("hardhat");

async function main() {
  // Deploy USDT
  const USDT = await ethers.getContractFactory("USDT");
  const usdt = await USDT.deploy(ethers.parseUnits("1000000000", 18));
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("USDT deployed to:", usdtAddress);

  // Deploy Wizard
  const Wizard = await ethers.getContractFactory("Wizard");
  const wizard = await Wizard.deploy(ethers.parseUnits("1000000000", 18));
  await wizard.waitForDeployment();
  const wizardAddress = await wizard.getAddress();
  console.log("Wizard deployed to:", wizardAddress);

  // Deploy SwapPool
  const SwapPool = await ethers.getContractFactory("SwapPool");
  const pool = await SwapPool.deploy(usdtAddress, wizardAddress);
  await pool.waitForDeployment();
  console.log("SwapPool deployed to:", await pool.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
