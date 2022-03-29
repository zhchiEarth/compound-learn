import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { CEther, CToken } from "../typechain/index";
import { BigNumber } from "ethers";

const blocksPerDay = 6570; // 13.15 seconds per block
const daysPerYear = 365;
const ethDecimals = 18;


/**
 * 兑换率计算过程:
 * 1. 如果_totalSupply等于0，就直接返回初始利率,第一个用户会是0,因为还没有开始铸币，所以totalSupply是0，直接返回初始汇率
 * 2. 如果_totalSupply > 0 已经有人开始mint了，
 * 3. exchangeRate = token / cToekn =  (流动性总额 + 总借款 - 总储备金) / cToekn总供应量
 * exchangeRate = (getCash() + totalBorrows() - totalReserves()) / totalSupply()
 * 4. token 1 * 10^(18 - 8 + 基础代币小数) 缩放
 */

const exchangeRateFunc = (asset: string, decimals: number) => {
	it(`${asset} 汇率计算测试: `, async function () {
		const mantissa: BigNumber = ethers.utils.parseUnits('1', 18)
		let assetName;
		if (asset != 'Ether') {
			assetName = `c${asset}`;
		} else {
			assetName = `C${asset}`;
		}
		const cTokenInfo = await deployments.get(assetName);
		console.log('address:', cTokenInfo.address)
		let cToken: CToken = await ethers.getContractAt('CToken', cTokenInfo.address);
		// 获取最新兑换率
		let exchangeRate: BigNumber = await cToken.exchangeRateStored(); // 单位是

		// 流动性总额
		let cash: BigNumber = await cToken.getCash(); // 单位是 token
		// 总借款
		let totalBorrows: BigNumber = await cToken.totalBorrows();
		// 总储备金
		let totalReserves: BigNumber = await cToken.totalReserves();
		// cToken总供应量
		let totalSupply: BigNumber = await cToken.totalSupply();

		console.log(`${asset} cash: ${cash}`)
		console.log(`${asset} 总借款 totalBorrows: ${totalBorrows}`)
		console.log(`${asset} 总储备金 totalReserves: ${totalReserves}`)
		console.log(`${asset} cToken总供应量 totalSupply: ${totalSupply}`)

		if (totalSupply.eq(ethers.constants.Zero)) {
			console.log(`${asset} 初始汇率`)
			return
		}
		cash = cash.mul(mantissa)
		totalBorrows = totalBorrows.mul(mantissa)
		totalReserves = totalReserves.mul(mantissa)
		totalSupply = totalSupply.mul(mantissa)

		let exchange: BigNumber = cash.add(totalBorrows).sub(totalReserves).div(totalSupply);

		console.log(`${asset} 计算处理的汇率：${exchange.toString()} == ${exchangeRate.toString()}` )

		//  1 * 10^(18 - 8 + 基础代币小数) 缩放
		let tokenAmount: BigNumber = ethers.utils.parseUnits('1', (18 - 8 + decimals).toString())
		console.log(`${asset} tokenAmount:${tokenAmount}`)
		console.log(`1个${asset} 可以兑换${tokenAmount.div(exchangeRate)} c${asset}`)
	})
}

/**
 * mint 合约流程
 *
 */
const MintFunc = () => {
	it("CEther资金池，年华利率APY计算", async function () {
		const cEtherInfo = await deployments.get('CEther');
		console.log("cEther.address:", cEtherInfo.address)
		let cEther: CEther = await ethers.getContractAt('CEther', cEtherInfo.address);
		// 每个区块的供应利率
		let supplyRatePerBlock: BigNumber = await cEther.supplyRatePerBlock();
		let ethMantissa = BigNumber.from("10").pow(ethDecimals)
		// (本金+利息)365次方
		// let supplyApy = (((Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
		// （每个区块供应利息/1e18 * 每天6570个区块 + 本金 1).pow(365 - 1)
		let supplyApy = supplyRatePerBlock.div(ethMantissa).mul(blocksPerDay).add(1).pow(daysPerYear - 1).sub(1).mul(100)
		console.log(`每个区块供应率: ${supplyRatePerBlock.toString()}`);
		console.log(`每天供应率: ${supplyRatePerBlock.div(ethMantissa).mul(blocksPerDay).toString()}`)
		console.log(`存款年华利率APY： ${supplyApy.toString()} %`);

		let borrowRatePerBlock: BigNumber = await cEther.supplyRatePerBlock();
		let borrowApy = supplyRatePerBlock.div(ethMantissa).mul(blocksPerDay).add(1).pow(daysPerYear - 1).sub(1).mul(100)
		console.log(`每个区块借款率: ${borrowRatePerBlock.toString()}`);
		console.log(`每天借款率: ${borrowRatePerBlock.div(ethMantissa).mul(blocksPerDay).toString()}`)
		console.log(`借款年华利率APY： ${borrowApy.toString()} %`);

	});
}

describe("mint测试", function () {
	// exchangeRateFunc('Ether', 18)
	exchangeRateFunc('DAI', 18)
	// exchangeRateFunc('USDC', 6)
	// exchangeRateFunc('BAT', 18)

		// cTokenAPYFunc("CEther", 18)
	// cTokenInfo("CEther", 18)

	// cTokenAPYFunc("cDAI", 18)
	// cTokenInfo("cDAI", 18)

	// cTokenAPYFunc("cUSDC", 18)
	// cTokenInfo("cUSDC", 18)

	// cTokenAPYFunc("cBAT", 18)
	// cTokenInfo("cBAT", 18)

});
