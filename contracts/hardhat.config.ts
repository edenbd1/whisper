import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  defaultNetwork: "coti-testnet",
  solidity: {
    version: "0.8.19",
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "coti-testnet": {
      url: "https://testnet.coti.io/rpc",
      chainId: 7082400,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};

export default config;
