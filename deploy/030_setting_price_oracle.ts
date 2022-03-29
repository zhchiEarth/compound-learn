import { deployments, ethers } from "hardhat";
import { Deployment } from "hardhat-deploy/types";
import { Comptroller, SimplePriceOracle } from "../typechain/index";
import { ContractTransaction } from "ethers";

const func = async function () {

	const simplePriceOracleInfo: Deployment = await deployments.get('SimplePriceOracle');
	const unitrollerInfo: Deployment = await deployments.get('Unitroller');
	const cEther: Deployment = await deployments.get('cEther');
	const cDAI: Deployment = await deployments.get('cDAI');
	const cUSDC: Deployment = await deployments.get('cUSDC');
	const cBAT: Deployment = await deployments.get('cBAT');

	const priceOracle: SimplePriceOracle = await ethers.getContractAt('SimplePriceOracle', simplePriceOracleInfo.address);

	// 将代理合约包装成 逻辑合约
	let unitrollerProxy: Comptroller = await ethers.getContractAt('Comptroller', unitrollerInfo.address)


	// 设置预言机价格 参数根据kovan 的设置而设置的 价格/1e18 = usd
	// https://kovan.etherscan.io/address/0x42caa09ee47e01011c869a211b162b7ad690d2f8
	// eETH kovan address 0x41B5844f4680a8C38fBb695b7F9CFd1F64474a72
	let txRes: ContractTransaction = await priceOracle.setUnderlyingPrice(cEther.address, '2100000000000000000000')
	await txRes.wait();

	//cDAI kovan address 0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD
	txRes = await priceOracle.setUnderlyingPrice(cDAI.address, '1001616000000000000')
	await txRes.wait();

	//cUSDC kovan address 0x4a92E71227D294F041BD82dd8f78591B75140d63
	txRes = await priceOracle.setUnderlyingPrice(cUSDC.address, '1000000000000000000000000000000')
	await txRes.wait();

	// kovan address 0x4a77fAeE9650b09849Ff459eA1476eaB01606C7a
	txRes = await priceOracle.setUnderlyingPrice(cBAT.address, '299255000000000000')
	await txRes.wait();

	// 获取抵押率 kovan
	// let {0:isListed, 1:collateralFactor,2:isComped } = await comptroller.callStatic.markets(cTokenAddress);
	// 必须先设置 `添加到市场` 然后在设置 `抵押率`，反之就会被 设置市场的时候初始化掉，具体看 _supportMarket函数

	// cEther
	txRes = await unitrollerProxy._supportMarket(cEther.address)
	await txRes.wait();
	//cETH 设置抵押率 0.8 * 1e18
	txRes = await unitrollerProxy._setCollateralFactor(cEther.address, '800000000000000000');
	await txRes.wait();

	// cDAI
	// 必须先设置 `添加到市场` 然后在设置 `抵押率`
	txRes = await unitrollerProxy._supportMarket(cDAI.address)
	await txRes.wait();
	//cDAI设置抵押率 0.75 * 1e18
	txRes = await unitrollerProxy._setCollateralFactor(cDAI.address, '750000000000000000');
	await txRes.wait();

	//cUSDC
	txRes = await unitrollerProxy._supportMarket(cUSDC.address)
	await txRes.wait();
	//cUSDC 设置抵押率 0.75 * 1e18
	txRes = await unitrollerProxy._setCollateralFactor(cUSDC.address, '750000000000000000');
	await txRes.wait();

	//cBAT
	txRes = await unitrollerProxy._supportMarket(cBAT.address)
	await txRes.wait();
	//cBAT 设置抵押率 0.6 * 1e18
	txRes = await unitrollerProxy._setCollateralFactor(cBAT.address, '600000000000000000');
	await txRes.wait();

};

module.exports = func
// export default func;
// func.tags = ['comptroller'];
