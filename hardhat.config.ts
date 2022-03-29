import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.4"
      },
			{
				version: "0.5.16",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200
					}
				}
			}
    ]
  },
	defaultNetwork: "hardhat",
  networks: {
		hardhat: {
			saveDeployments: true,
		},
    localhost: {
      url: 'http://localhost:8545',
			saveDeployments: true,
			// tags: ["local"],
			// accounts:
			// 	["f997baaa5aa0be3b1bddc7da9f181a3a66a0378540a80a2ad585b693d6d48f9a"]
    },
		rinkeby: {
			url: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
			saveDeployments: true,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
		harmony: {
			url: 'https://api.s0.b.hmny.io',
			saveDeployments: true,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		}
  },
	namedAccounts: {
		deployer: {
				default: 0, // here this will by default take the first account as deployer
				1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
				// 4: '0xA296a3d5F026953e17F472B497eC29a5631FB51B', // but for rinkeby it will be a specific address
				// 'rinkeby': '0x84b9514E013710b9dD0811c9Fe46b837a4A0d8E0', //it can also specify a specific netwotk name (specified in hardhat.config.js)
		},
		tokenOwner:{
				default: 1, // 这里填的是链的ID
				1: '0x99C16dd504C0f56f00443c7d1ef55fe57423e871',
				1666700000: '0x99C16dd504C0f56f00443c7d1ef55fe57423e871'
		}
	},
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
