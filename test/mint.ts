import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { CEther, CToken, Token, Comptroller, SimplePriceOracle, CErc20Delegate,  } from "../typechain/index";
import {
	BigNumber,
  EventFilter,
  Signer,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";

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
		const cTokenInfo = await deployments.get(`c${asset}`);
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
 const mintFunc = (asset: string, decimals: number, amount: number = 100) => {
	it(`${asset} mint: `, async function () {
		const accounts = await ethers.getSigners();
		const deployer = accounts[0]

		const mantissa: BigNumber = ethers.utils.parseUnits('1', decimals)
		// mint 10000个 token
		let mintAmount = ethers.BigNumber.from(amount).mul(mantissa);
		if (asset != 'ETH') {
			const cTokenInfo = await deployments.get(`c${asset}`);
			const tokenInfo = await deployments.get(`${asset}Token`);
			// 非ETH 需要先授权
			let cErc20Delegate: CErc20Delegate = await ethers.getContractAt('CErc20Delegate', cTokenInfo.address);
			let token: Token = await ethers.getContractAt('Token', tokenInfo.address);
			// cToken 需要先授权
			let approveTx: ContractTransaction = await token.approve(cTokenInfo.address, mintAmount);

			let tx: ContractTransaction =  await cErc20Delegate.mint(mintAmount)
			await tx.wait();

			let balance: BigNumber = await cErc20Delegate.balanceOf(deployer.address);
			console.log(`${asset} blance`, balance.toString())
		} else {
			const cEtherInfo = await deployments.get(`cEther`);
			let cEther: CEther = await ethers.getContractAt('CEther', cEtherInfo.address);
			// 每个账户 存一个ETH
			for (let i = 2; i < accounts.length; i++) {
			// 	let tx:ContractTransaction  =  await cEther.connect(accounts[i]).mint({
			// 		value: ethers.utils.parseUnits('1')
			// 	});
			// 	await tx.wait();
			let blance:BigNumber = await accounts[i].getBalance()
			console.log(`${asset} account:${i} :  `, ethers.utils.formatEther(blance));
			}
		}
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


		// mintFunc('DAI', 18, 1000000);
	// mintFunc('BAT', 18, 1000000);
	// mintFunc('USDC', 6, 1000000);
	// mintFunc('ETH', 18);
});
