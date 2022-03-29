import { deployments, getNamedAccounts, ethers } from "hardhat";
import { DeployResult } from "hardhat-deploy/types";

const func = async function () {

	const {deployer} = await getNamedAccounts();

  const base500bps_Slope1200bps: DeployResult = await deployments.deploy('Base500bps_Slope1200bps', {
		contract: 'WhitePaperInterestRateModel',
		from: deployer,
		args: ["50000000000000000", "120000000000000000"],
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	const base0bps_Slope3000bps: DeployResult = await deployments.deploy('Base0bps_Slope3000bps', {
		contract: 'WhitePaperInterestRateModel',
		from: deployer,
		args: ["0", "200000000000000000"],
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	const base200bps_Slope3000bps: DeployResult =  await deployments.deploy('Base200bps_Slope3000bps', {
		contract: 'WhitePaperInterestRateModel',
		from: deployer,
		args: ["20000000000000000", "300000000000000000"],
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	//拐点模型
	const base200bps_Slope2000bps_Jump20000bps_Kink90 = await deployments.deploy('Base200bps_Slope2000bps_Jump20000bps_Kink90', {
		contract: 'JumpRateModel',
		from: deployer,
		args: ["20000000000000000", "200000000000000000", '2000000000000000000', '900000000000000000'],
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	console.log("Base500bps_Slope1200bps:", base500bps_Slope1200bps.address)
	console.log("base0bps_Slope3000bps:", base0bps_Slope3000bps.address)
	console.log("base200bps_Slope3000bps:", base200bps_Slope3000bps.address)
	console.log("base200bps_Slope2000bps_Jump20000bps_Kink90:", base200bps_Slope2000bps_Jump20000bps_Kink90.address)

};

module.exports = func
// export default func;
func.tags = ['InterestRateModel'];
