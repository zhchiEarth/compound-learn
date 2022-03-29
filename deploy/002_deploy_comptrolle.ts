import { deployments, getNamedAccounts, ethers } from "hardhat";
import { DeployResult } from "hardhat-deploy/types";
import { Comptroller, Unitroller } from "../typechain/index";
import { ContractTransaction } from "ethers";

const func = async function () {
  const {deploy} = deployments;

	const {deployer} = await getNamedAccounts();

  const unitrollerInfo: DeployResult = await deploy('Unitroller', {
		from: deployer,
    // args: ,
		skipIfAlreadyDeployed: true, //已经部署 跳过部署
    log: false,
	})

	const comptrollerInfo: DeployResult = await deployments.deploy('Comptroller', {
		from: deployer,
		skipIfAlreadyDeployed: true,
    log: false,
	})

		const simplePriceOracleInfo = await deployments.get('SimplePriceOracle');

		let comptroller: Comptroller = await ethers.getContractAt('Comptroller', comptrollerInfo.address);
		let unitroller: Unitroller  = await ethers.getContractAt('Unitroller', unitrollerInfo.address);
		let txRes: ContractTransaction = await unitroller._setPendingImplementation(comptrollerInfo.address)

		// 等到交易完成 不然会影响后面的部署 因为只有一个账户
		let txReceipt = await txRes.wait();
		// console.log("txReceipt:", txReceipt)

		// 这里实际调用了 unitroller._acceptImplementation(unitroller.address)方法,设置逻辑合约
		txRes = await comptroller._become(unitroller.address)
		await txRes.wait();

		// 将代理合约包装成 逻辑合约
		let unitrollerProxy = await ethers.getContractAt('Comptroller', unitroller.address)

		//下面的方法，通过unitroller代理，实际调用的 comptroller 合约里的方法 ！！！ 这个要清楚

		// 设置关闭因子 设置50%  注意18个0 0.5 * 1e18
		txRes = await unitrollerProxy._setCloseFactor('500000000000000000')
		await txRes.wait();

		// 设置抵押率，借款之前必须要设置，不然所有的借款都会失败. (0.8*1e18).toString
		// await unitrollerProxy._setCollateralFactor('ctoken', '800000000000000000');

		// // 设置清算激励 1.08  1.08*1e18  1080000000000000000
		txRes = await unitrollerProxy._setLiquidationIncentive('1080000000000000000');
		await txRes.wait();
		// unitrollerProxy._supportMarket(CToken(address(cUni)));

		// 设置预言机
		txRes = await unitrollerProxy._setPriceOracle(simplePriceOracleInfo.address)
		await txRes.wait();

		console.log("comptroller:", comptrollerInfo.address)
		console.log("unitroller:", unitrollerInfo.address)
};

module.exports = func
// export default func;
func.tags = ['comptroller'];
