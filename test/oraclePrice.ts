import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { CEther, CToken,SimplePriceOracle } from "../typechain/index";
import { BigNumber } from "ethers";

const blocksPerDay = 6570; // 13.15 seconds per block
const daysPerYear = 365;
const ethDecimals = 18;

const oraclePriceFunc= (asset: string, decimals: number) => {
	it("资金使用了计算: ", async function () {

		const cDAI = await deployments.get('cDAI');

		const priceOracleInfo = await deployments.get('SimplePriceOracle');
		console.log(`${asset}.address: ${priceOracleInfo.address}`)
		let cToken: SimplePriceOracle = await ethers.getContractAt('SimplePriceOracle', priceOracleInfo.address);
		// 存款流动性
		let cash: BigNumber = await cToken.getUnderlyingPrice(); // 单位是 token
		let totalBorrows: BigNumber = await cToken.totalBorrows();
		let totalReserves: BigNumber = await cToken.totalReserves();
		let totalSupply: BigNumber = await cToken.totalSupply();

		// let ethMantissa = BigNumber.from("10").pow(decimals)

		console.log(`${asset} cash: ${cash.toString()}`)
		console.log(`${asset} totalBorrows: ${totalBorrows.toString()}`)
		console.log(`${asset} totalReserves: ${totalReserves.toString()}`)
		console.log(`${asset} totalSupply: ${totalSupply.toString()}`)
	})
}

describe("apy计算", function () {
	// etherAPYFunc()
	// cTokenAPYFunc("CEther", 18)
	// cTokenInfo("CEther", 18)

	cTokenAPYFunc("cDAI", 18)
	// cTokenInfo("cDAI", 18)

	// cTokenAPYFunc("cUSDC", 18)
	// cTokenInfo("cUSDC", 18)

	// cTokenAPYFunc("cBAT", 18)
	// cTokenInfo("cBAT", 18)
});
