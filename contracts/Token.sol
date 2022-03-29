// SPDX-License-Identifier: unlicensed
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
	uint8 private _decimals;

    constructor(
	    address[] memory accounts,
        string memory name, //代币名称
        string memory symbol, //代币缩写
        uint8 decimals_, //精度
        uint256 totalSupply //发行总量
		) ERC20(name, symbol) {
        uint len = accounts.length;
        for (uint i = 0; i < len; i++) {
            _mint(accounts[i], totalSupply * 10 ** decimals_);
        }
		_decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}