# ERC20 Token Swap Project

This project deploys two ERC-20 tokens (USDT and Wizard) and a swap pool contract to allow swapping between them.

## Contracts

- **USDT**: Mock Tether USD token (ERC-20)
- **Wizard**: Custom Wizard token (ERC-20)
- **SwapPool**: Pool contract to swap USDT and Wizard tokens using a constant product formula

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Compile contracts:
   ```bash
   npx hardhat compile
   ```

## Deployment

### Localhost

1. Start a local Hardhat node:
   ```bash
   npx hardhat node
   ```
2. Deploy contracts to local node:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   - Save the contract addresses printed in the output.

### Sepolia Testnet

1. Create a `.env` file in your project root:
   ```env
   SEPOLIA_RPC_URL=your_sepolia_rpc_url
   PRIVATE_KEY=your_private_key
   ```
   - Replace with your Infura/Alchemy Sepolia endpoint and your wallet’s private key (never share this key!).
2. Deploy contracts to Sepolia:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   - Save the contract addresses printed in the output.

## Usage

### Add Liquidity

Before swapping, you must add liquidity to the pool:

```bash
npx hardhat run scripts/addLiquidity.js --network <localhost|sepolia>
```

### Swap Tokens

Run the swap script and follow the prompts:

```bash
npx hardhat run scripts/swap.js --network <localhost|sepolia>
```

- Enter the token to swap from (`USDT` or `WIZARD`)
- Enter the amount to swap
- The script will output the amount received

## Frontend

1. Go to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open the provided local URL in your browser.
3. Update `frontend/src/contracts.js` with your deployed contract addresses.

## Notes

- Uses OpenZeppelin's ERC-20 implementation.
- Swap fee: 0.3% per swap (Uniswap v2 style).
- You can deploy and interact with contracts on both localhost and Sepolia testnet.

---

For more details, see the contract files in the `contracts/` directory and the deployment scripts in `scripts/`.
