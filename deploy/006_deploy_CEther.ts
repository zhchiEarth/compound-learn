import { deployments, getNamedAccounts } from "hardhat";
import { DeployResult, Deployment } from "hardhat-deploy/types";

const func = async function () {

	const {deployer} = await getNamedAccounts();

	let name = 'Compound ETH'
	let symbol = 'cETH'
	let decimals = 8

	const unitrollerInfo: Deployment = await deployments.get('Unitroller');
	const base500bps_Slope1200bps: Deployment = await deployments.get('Base500bps_Slope1200bps');

  const cEther: DeployResult = await deployments.deploy('cEther', {
		contract: 'CEther',
		from: deployer,
    args: [
			unitrollerInfo.address,
			base500bps_Slope1200bps.address, // 利率模型地址 address
			'200000000000000000000000000', // 初始汇率 0.02 * 10^28
			name, // cToken name
			symbol, // cToken symbol_
			decimals, // cToken decimals_
			deployer, // admin_ 管理员 正式是Timelock合约地址，这里用 部署合约人的地址
		],
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	console.log("cEther:", cEther.address)
};

module.exports = func
// export default func;
func.tags = ['CEther'];