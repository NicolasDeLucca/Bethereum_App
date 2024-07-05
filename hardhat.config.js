require('@nomiclabs/hardhat-ethers');
require('hardhat-contract-sizer');
require('solidity-coverage');
require('dotenv').config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: "0.8.24",
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    sepolia: {
      chainId: 11155111,
      timeout: 20000,
      gasPrice: 8000000000,
      gas: "auto",
      name: "Sepolia",
      url: process.env.SEPOLIA_ACCESSPOINT_URL,
      from: process.env.SEPOLIA_ACCOUNT,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    },
  }
};