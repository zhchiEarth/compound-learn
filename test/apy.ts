import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { CEther, CToken } from "../typechain/index";
import { BigNumber } from "ethers";

const blocksPerDay = 6570; // 13.15 seconds per block
const daysPerYear = 365;
const ethDecimals = 18;

const cTokenInfo = (asset: string, decimals: number) => {
	it("资金池使用情况: ", async function () {
		const cTokenInfo = await deployments.get(asset);
		console.log(`${asset}.address: ${cTokenInfo.address}`)
		let cToken: CToken = await ethers.getContractAt('CToken', cTokenInfo.address);
		// 存款流动性
		let cash: BigNumber = await cToken.getCash(); // 单位是 token
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

const etherAPYFunc = () => {
	it("CEther资金池，年华利率APY计算", async function () {
		const cEtherInfo = await deployments.get('cEther');
		console.log("cEther.address:", cEtherInfo.address)
		let cEther: CEther = await ethers.getContractAt('CEther', cEtherInfo.address);
		// 每个区块的供应利率
		let supplyRatePerBlock: BigNumber = await cEther.supplyRatePerBlock();
		let decimals: number = 18;
		// (本金+利息)365次方
		let supplyApy = (((Math.pow(( Number(ethers.utils.formatUnits(supplyRatePerBlock, decimals))  * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
		// （每个区块供应利息/1e18 * 每天6570个区块 + 本金 1).pow(365 - 1)
		// let supplyApy = ethers.BigNumber.from(ethers.utils.formatUnits(supplyRatePerBlock, decimals)).mul(blocksPerDay).add(1).pow(daysPerYear - 1).sub(1).mul(100)
		console.log(`cEther 每个区块供应率: ${supplyRatePerBlock.toString()}`);
		console.log(`cEther 每天供应率: ${Number(ethers.utils.formatUnits(supplyRatePerBlock, decimals))  * blocksPerDay}`)
		console.log(`cEther 存款年华利率APY： ${supplyApy.toString()} %`);

		// let apr = supplyRatePerBlock
		// let borrowApy = (((Math.pow((borrowRatePerBlock.toNumber() / ethMantissa.toNumber() * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
		let borrowRatePerBlock: BigNumber = await cEther.borrowRatePerBlock();
		let borrowApy = (((Math.pow((Number(ethers.utils.formatUnits(borrowRatePerBlock, decimals))  * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
		// let borrowApy = ethers.BigNumber.from(ethers.utils.formatUnits(borrowRatePerBlock, decimals).toString()).mul(blocksPerDay).add(1).pow(daysPerYear - 1).sub(1).mul(100)
		console.log(`cEther 每个区块借款率: ${borrowRatePerBlock.toString()}`);
		console.log(`cEther 每天借款率: ${Number(ethers.utils.formatUnits(borrowRatePerBlock, decimals))  * blocksPerDay}`)
		console.log(`cEther 借款年华利率APY： ${borrowApy.toString()} %`);
	});
}

const cTokenAPYFunc = (asset: string, decimals: number) => {
	it(`${asset}资金池，年华利率APY计算`, async function () {
		const cTokenInfo = await deployments.get(asset);
		console.log(`${asset}.address: ${cTokenInfo.address}`)
		let cToken: CToken = await ethers.getContractAt('CToken', cTokenInfo.address);
		// 每个区块的供应利率
		let supplyRatePerBlock: BigNumber = await cToken.supplyRatePerBlock();
		let ethMantissa = BigNumber.from("10").pow(decimals)
		// (本金+利息)365次方
		let supplyApy = (((Math.pow((Number(ethers.utils.formatUnits(supplyRatePerBlock, 18))  * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
		// （每个区块供应利息/1e18 * 每天6570个区块 + 本金 1).pow(365 - 1)
		// let supplyApy = ethers.BigNumber.from(ethers.utils.formatUnits(supplyRatePerBlock, decimals)).mul(blocksPerDay).add(1).pow(daysPerYear - 1).sub(1).mul(100)
		console.log(`${asset} 每个区块供应率: ${supplyRatePerBlock.toString()}`);
		console.log(`${asset} 每天供应率: ${Number(ethers.utils.formatUnits(supplyRatePerBlock, 18))  * blocksPerDay}`)
		console.log(`${asset} 存款年化利率APY： ${supplyApy.toString()} %`);

		let borrowRatePerBlock: BigNumber = await cToken.borrowRatePerBlock();
		let borrowApy = (((Math.pow((Number(ethers.utils.formatUnits(borrowRatePerBlock, 18))  * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
		// let borrowApy = ethers.BigNumber.from(ethers.utils.formatUnits(borrowRatePerBlock, decimals).toString()).mul(blocksPerDay).add(1).pow(daysPerYear - 1).sub(1).mul(100)
		console.log(`${asset} 每个区块借款率: ${borrowRatePerBlock.toString()}`);
		console.log(`${asset} 每天借款率: ${Number(ethers.utils.formatUnits(borrowRatePerBlock, 18))  * blocksPerDay}`)
		console.log(`${asset} 借款年化利率APY： ${borrowApy.toString()} %`);
	});
}

describe("APY计算", function () {
	// cTokenInfo("cEther", 18)
	// cTokenAPYFunc("cEther", 18)
	// etherAPYFunc()

	// cTokenAPYFunc("cDAI", 18)
	// cTokenInfo("cDAI", 18)

	// cTokenAPYFunc("cUSDC", 8)
	// cTokenInfo("cUSDC", 8)

	cTokenAPYFunc("cBAT", 18)
	cTokenInfo("cBAT", 18)
});
