import { BigNumber, ethers } from "ethers";

export function truncate(value: BigNumber, decimals: number | BigNumber): BigNumber {
		let val;
		if (decimals instanceof BigNumber) {
			decimals = decimals.toNumber()
		}

		if (value instanceof BigNumber) {
			val = value.toString().substring(0, decimals)
		}

		return ethers.BigNumber.from(val);
}