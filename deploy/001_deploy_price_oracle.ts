import { deployments, getNamedAccounts } from "hardhat";
import { DeployResult } from "hardhat-deploy/types";

const func = async function () {

  const {deployer} = await getNamedAccounts();

	let simplePriceOracle: DeployResult = await deployments.deploy('SimplePriceOracle', {
		from: deployer,
    // args: ,
		skipIfAlreadyDeployed: true,
    log: false,
	})
	console.log("SimplePriceOracle:", simplePriceOracle.address)
};

module.exports = func
// export default func;
func.tags = ['SimplePriceOracle'];
