import { deployments, getNamedAccounts, ethers } from "hardhat";
import { DeployResult, Deployment } from "hardhat-deploy/types";

const func = async function () {
	const {deployer} = await getNamedAccounts();

	let name = 'Compound BAT'
	let symbol = 'cBAT'
	let decimals = 8

	const unitrollerInfo: Deployment = await deployments.get('Unitroller');
	const base200bps_Slope2000bps_Jump20000bps_Kink90: Deployment = await deployments.get('Base200bps_Slope2000bps_Jump20000bps_Kink90');
	const token: Deployment = await deployments.get('BATToken');
	const cErc20Delegate: Deployment = await deployments.get('BATErc20Delegate');

  const cBAT: DeployResult = await deployments.deploy('cBAT', {
		contract: 'CErc20Delegator',
		from: deployer,
    args: [
			token.address,
			unitrollerInfo.address,
			base200bps_Slope2000bps_Jump20000bps_Kink90.address, // 利率模型地址 address
			'200000000000000000000000000', // 初始汇率 0.02 * 10^28
			name, // cToken name
			symbol, // cToken symbol_
			decimals, // cToken decimals_
			deployer, // admin_ 管理员 正式是Timelock合约地址，这里用 部署合约人的地址
			cErc20Delegate.address, // ctoken实际执行的地址
			0x00 // becomeImplementationData
		],
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	console.log("cBAT:", cBAT.address)
};

module.exports = func
// export default func;
func.tags = ['cBAT'];