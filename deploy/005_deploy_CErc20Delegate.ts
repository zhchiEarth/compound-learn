import { deployments, getNamedAccounts, ethers } from "hardhat";
import { DeployResult } from "hardhat-deploy/types";

const func = async function () {

  const {deployer} = await getNamedAccounts();

	const DAIErc20Delegate: DeployResult = await deployments.deploy('DAIErc20Delegate', {
		contract: 'CErc20Delegate',
		from: deployer,
    // args: ,
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	const USDCErc20Delegate: DeployResult = await deployments.deploy('USDCErc20Delegate', {
		contract: 'CErc20Delegate',
		from: deployer,
    // args: ,
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	const BATErc20Delegate: DeployResult = await deployments.deploy('BATErc20Delegate', {
		contract: 'CErc20Delegate',
		from: deployer,
    // args: ,
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	console.log("DAIErc20Delegate:", DAIErc20Delegate.address)
	console.log("USDCErc20Delegate:", USDCErc20Delegate.address)
	console.log("BATErc20Delegate:", BATErc20Delegate.address)
};

module.exports = func
// export default func;
func.tags = ['CErc20Delegate'];
