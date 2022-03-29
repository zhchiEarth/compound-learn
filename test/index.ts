import { expect } from "chai";
import { ethers, deployments, getNamedAccounts } from "hardhat";
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
				let tx:ContractTransaction  =  await cEther.connect(accounts[i]).mint({
					value: ethers.utils.parseUnits('1')
				});
				await tx.wait();
			let blance:BigNumber = await accounts[i].getBalance()
			console.log(`${asset} account:${i} :  `, ethers.utils.formatEther(blance));
			}
		}
	});
}



const ethBorrowFunc = (asset: string, decimals: number) => {
	it(`${asset} borrow: `, async function () {
		const accounts = await ethers.getSigners();
		let addr1 = accounts[1];
		// let priceMantissa =ethers.utils.parseUnits('1', 18 + 18 - decimals)
		let priceMantissa = ethers.utils.parseUnits('1', 18 - decimals)

		const unitrollerInfo = await deployments.get('Unitroller');
		const SimplePriceOracleInfo = await deployments.get('SimplePriceOracle');
		const cTokenInfo = await deployments.get(`c${asset}`);

		const cEtherInfo = await deployments.get(`cEther`);
		let cEther: CEther = await ethers.getContractAt('CEther', cEtherInfo.address);

		let comptroller: Comptroller = await ethers.getContractAt('Comptroller', unitrollerInfo.address, addr1);
		let priceOracle: SimplePriceOracle = await ethers.getContractAt('SimplePriceOracle', SimplePriceOracleInfo.address);

		// 判断是否加入市场
		let isEnterMarket: boolean = await comptroller.checkMembership(addr1.address, cEtherInfo.address);
		console.log("isEnterMarket:", isEnterMarket)
		if (!isEnterMarket) {
			let res: ContractTransaction = await comptroller.enterMarkets([cEtherInfo.address]);
			let receipt =  await res.wait()
		}

		// 获取用户流动性
		// getAccountLiquidity
		let {0:errCode, 1:liquidity, 2:shortfall} = await comptroller.getAccountLiquidity(addr1.address);
		let cTokenPrice: BigNumber = await priceOracle.getUnderlyingPrice(cTokenInfo.address)
		console.log('usdcPrice:', cTokenPrice.div(priceMantissa).toString())
		console.log(`liquidity: ${liquidity.div(cTokenPrice.div(priceMantissa)).toString()}`)
		console.log(`shortfall: ${shortfall.toString()}`)
	})
}

const liquidateBorrowFunc = (asset: string, decimals: number) => {
	it(`${asset} borrow: `, async function () {
		// liquidateBorrow(address borrower, uint repayAmount, CTokenInterface cTokenCollateral)
	})
}

describe("测试清算", function () {
	// mintFunc('DAI', 18, 1000000);
	// mintFunc('BAT', 18, 1000000);
	// mintFunc('USDC', 6, 1000000);
	// mintFunc('ETH', 18);

	// 借款
	ethBorrowFunc('USDC', 6)

});
