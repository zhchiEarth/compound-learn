import { deployments, getNamedAccounts } from "hardhat";
import { DeployResult } from "hardhat-deploy/types";

const totalSupply = 100000000;

const func = async function () {
	const {deployer, tokenOwner} = await getNamedAccounts();

  const DAIErc20: DeployResult = await deployments.deploy('DAIToken', {
		contract: 'Token',
		from: deployer,
		args: [[deployer, tokenOwner], "MY DAI", "DAI", 18, totalSupply],
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	const USDCErc20: DeployResult = await deployments.deploy('USDCToken', {
		contract: 'Token',
		from: deployer,
		args: [[deployer,tokenOwner], "MY USDC", "USDC", 6, totalSupply],
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	const BATErc20: DeployResult = await deployments.deploy('BATToken', {
		contract: 'Token',
		from: deployer,
		args: [[deployer,tokenOwner], "MY BAT", "BAT", 18, totalSupply],
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	console.log("DAIToken:", DAIErc20.address)
	console.log("USDCToken:", USDCErc20.address)
	console.log("BATToken:", BATErc20.address)

};

module.exports = func
// export default func;
func.tags = ['token'];
