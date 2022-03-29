import { expect } from "chai";
import { ethers, deployments, getNamedAccounts } from "hardhat";
import { CEther, CErc20Delegator,  } from "../typechain/index";
import { BigNumber } from "ethers";
import {
  EventFilter,
  Signer,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";


/**
 * 提现逻辑
 * 1.
 */

const redeemFunc = (asset: string, decimals: number) => {
	it(`${asset}资金池，可提现金额`, async function () {
		const {deployer} = await getNamedAccounts();
		const cTokenInfo = await deployments.get(asset);
		console.log(`${asset}.address: ${cTokenInfo.address}`)
		let cErc20Delegator:CErc20Delegator = await ethers.getContractAt('CErc20Delegator', cTokenInfo.address);
		// 现金 单位token
		let cash: BigNumber = await cErc20Delegator.getCash();
		console.log(`${asset}  cash: ${cash.toString()}`)
		// 存款余额，借款余额，兑换率
		let {0:errCode, 1:bal, 2:borrow, 3:exchange} = await cErc20Delegator.getAccountSnapshot(deployer)
		console.log(`${asset}  存款余额： ${bal.toString()}`)
		console.log(`${asset}  借款余额： ${borrow.toString()}`)
		console.log(`${asset}  兑换率 ${exchange.toString()}`)

		let tx: ContractTransaction;
		// 如果提现的金额大于cash
		if (bal.gt(cash)) {
			tx = await cErc20Delegator.redeemUnderlying(cash);
			console.log(`${asset} 调用 redeemUnderlying 还款 ${bal.toString()} c${asset}`)
		} else {
			tx = await cErc20Delegator.redeem(bal);
			console.log(`${asset} 调用 redeem 还款 ${bal.toString()} c${asset}`)
		}
		let res = await tx.wait();
		// console.log()
	});
}

describe("测试redeem方法", function () {
	redeemFunc('cDAI', 18);
});
