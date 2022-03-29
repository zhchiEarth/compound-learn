import { ethers, deployments, getNamedAccounts } from "hardhat";
import { CEther, CToken, Comptroller, SimplePriceOracle } from "../typechain/index";
import { BigNumber } from "ethers";
import { expect } from "chai";


const maxSafeBorrow = () => {
	it("流动性计算: ", async function () {
		const {deployer} = await getNamedAccounts();

		const unitrollerInfo = await deployments.get('Unitroller');
		const SimplePriceOracleInfo = await deployments.get('SimplePriceOracle');
		console.log(`unitrollerInfo.address: ${unitrollerInfo.address}`)
		let comptroller: Comptroller = await ethers.getContractAt('Comptroller', unitrollerInfo.address);
		let priceOracle: SimplePriceOracle = await ethers.getContractAt('SimplePriceOracle', SimplePriceOracleInfo.address);
		// 获取用户流动性
		// getAccountLiquidity
		let {0:errCode, 1:liquidity, 2:shortfall} = await comptroller.getAccountLiquidity(deployer);

		// 不等于0 代表错误
		expect(errCode.toString()).equal('0');

		let assets: string[] = await comptroller.getAssetsIn(deployer)
		let mantissa = ethers.BigNumber.from(10).pow(18)
		let exchangeMantissa = ethers.BigNumber.from(10).pow(18 -8 + 18)

		for (let index = 0; index < assets.length; index++) {
			let addr = assets[index];
			let cToken: CToken = await ethers.getContractAt('CToken', addr);
			let price: BigNumber = await priceOracle.getUnderlyingPrice(addr);

			let {0:errCode, 1:cTokenBalance, 2:borrowBalance, 3:exchangeRateMantissa} = await cToken.getAccountSnapshot(deployer);
			// exchangeRateMantissa = exchangeRateMantissa.div(exchangeMantissa)
			// cTokenBalance = cTokenBalance.div(1e8)
			// borrowBalance = borrowBalance.div(mantissa) // token 单位

			let {0:isListed, 1:collateralFactorMantissa, 2:isComped} = await comptroller.markets(addr);
			// collateralFactorMantissa = collateralFactorMantissa.div(mantissa)

			console.log(`address:${addr} cTokenBalance:${cTokenBalance} borrowBalance:${borrowBalance} exchangeRateMantissa:${exchangeRateMantissa} collateralFactorMantissa:${collateralFactorMantissa} ${price} `)

			let tokensToDenom: BigNumber =  price.mul(collateralFactorMantissa).div(mantissa).mul(exchangeRateMantissa).div(exchangeMantissa)

			let sumCollateral: BigNumber = tokensToDenom.mul(cTokenBalance).div(1e8);

			let sumBorrowPlusEffects: BigNumber = borrowBalance.mul(price).div(mantissa);

			console.log(`tokensToDenom:${tokensToDenom.toString()}
								sumCollateral:${sumCollateral.toString()}
								sumBorrowPlusEffects:${sumBorrowPlusEffects.toString()}
								sumCollateral - sumBorrowPlusEffects:${sumCollateral.sub(sumBorrowPlusEffects).toString()}`
			)
		}


		console.log(`liquidity: ${liquidity.toString()}`)
		console.log(`shortfall: ${shortfall.toString()}`)
		// console.log(`${asset} totalBorrows: ${totalBorrows.toString()}`)
		// console.log(`${asset} totalReserves: ${totalReserves.toString()}`)
		// console.log(`${asset} totalSupply: ${totalSupply.toString()}`)
	})
}

describe("borrow借款", function () {
	maxSafeBorrow()

	/**
	 * 贷款逻辑
	 * 1. 提款不能超过
	 */
});
