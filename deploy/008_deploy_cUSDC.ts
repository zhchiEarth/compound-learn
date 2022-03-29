import { deployments, getNamedAccounts } from "hardhat";
import { DeployResult, Deployment } from "hardhat-deploy/types";

const func = async function () {

	const {deployer} = await getNamedAccounts();

	let name = 'Compound USD Coin 📈'
	let symbol = 'cUSDC'
	let decimals = 8

	const unitrollerInfo: Deployment = await deployments.get('Unitroller');
	const base500bps_Slope1200bps: Deployment = await deployments.get('Base500bps_Slope1200bps');
	const token: Deployment = await deployments.get('USDCToken');
	const cErc20Delegate: Deployment = await deployments.get('USDCErc20Delegate');

  const cUSDC: DeployResult = await deployments.deploy('cUSDC', {
		contract: 'CErc20Delegator',
		from: deployer,
    args: [
			token.address,
			unitrollerInfo.address,
			base500bps_Slope1200bps.address, // 利率模型地址 address
			'200000000000000', // 初始汇率 0.02 * 10^28
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

	console.log("cUSDC:", cUSDC.address)
};

module.exports = func
// export default func;
func.tags = ['cUSDC'];