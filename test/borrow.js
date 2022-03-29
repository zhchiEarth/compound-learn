// Example to supply ETH as collateral and borrow a supported ERC-20 token
const Web3 = require('web3');
// const web3 = new Web3('http://127.0.0.1:8545');
const web3 = new Web3('https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');

const comptrollerAbi = require("../abi/comptroller_abi.json");
const ctokenAbi = require("../abi/ctoken_abi.json");
const priceFeedAbi = require("../abi/price_feed_abi.json");


// Your Ethereum wallet private key
const privateKey = process.env.PRIVATE_KEY;

// Add your Ethereum wallet to the Web3 object
// 将你的以太坊钱包添加到 Web3 对象
web3.eth.accounts.wallet.add('0x' + privateKey);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

// Mainnet Contract for cETH (the collateral-supply process is different for cERC20 tokens)

const cDAIAddress = '0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD'; // cDai
const cToken = new web3.eth.Contract(ctokenAbi, cDAIAddress);
const assetName = 'DAI'; // for the log output lines
const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract

const cBAT = '0x4a77fAeE9650b09849Ff459eA1476eaB01606C7a';
const cBatToken = new web3.eth.Contract(ctokenAbi, cBAT);

// Mainnet Contract for the Compound Protocol's Comptroller
// Unitroller代理合约主网地址
const comptrollerAddress = '0x5eAe89DC1C671724A672ff0630122ee834098657';
const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress);

// Mainnet Contract for the Open Price Feed
// uniswap预言机地址
const priceFeedAddress = '0x42caa09ee47e01011c869a211b162b7ad690d2f8';
const priceFeed = new web3.eth.Contract(priceFeedAbi, priceFeedAddress);

// Mainnet address of underlying token (like DAI or USDC)
// DAI underlying地址
// const underlyingAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // Dai
// const underlying = new web3.eth.Contract(erc20Abi, underlyingAddress);

// Mainnet address for a cToken (like cDai, https://compound.finance/docs#networks)
// cDAI主网地址


// Web3 transaction information, we'll use this for every transaction we'll send
const fromMyWallet = {
  from: myWalletAddress,
  gasLimit: web3.utils.toHex(400000),
};

// const logBalances = () => {
//   return new Promise(async (resolve, reject) => {
//     let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
//     let myWalletCEthBalance = await cEth.methods.balanceOf(myWalletAddress).call() / 1e8;
//     let myWalletUnderlyingBalance = +await underlying.methods.balanceOf(myWalletAddress).call() / Math.pow(10, underlyingDecimals);

//     console.log("My Wallet's  ETH Balance:", myWalletEthBalance);
//     console.log("My Wallet's cETH Balance:", myWalletCEthBalance);
//     console.log(`My Wallet's  ${assetName} Balance:`, myWalletUnderlyingBalance);

//     resolve();
//   });
// };

const main = async () => {
  // await logBalances();

  // console.log('Calculating your liquid assets in the protocol...');
  let { 1:liquidity } = await comptroller.methods.getAccountLiquidity(myWalletAddress).call();
  liquidity = liquidity / 1e18;
	console.log(`计算用户,流动性: liquidity / 1e18 = ${liquidity}...`);

  // console.log('Fetching cETH collateral factor...');
	
  let { 1:collateralFactor } = await comptroller.methods.markets(cDAIAddress).call();
  // collateralFactor = (collateralFactor / 1e18) * 100; // Convert to percent
	// console.log(`获取 cDAI 抵押因子,(${collateralFactor} / 1e18) * 100 = ${collateralFactor}...`);

  let daiPriceInUsd = await priceFeed.methods.getUnderlyingPrice(cDAIAddress).call();
	let batPriceInUsd = await priceFeed.methods.getUnderlyingPrice(cBAT).call();
	
	daiPriceInUsd = daiPriceInUsd/1e18
	batPriceInUsd = batPriceInUsd/1e18
	console.log("dai 价格:", daiPriceInUsd)
	console.log("bat 价格:", batPriceInUsd)
	console.log("bat:", liquidity / batPriceInUsd, liquidity / batPriceInUsd * 0.8)
	console.log("dai", liquidity / daiPriceInUsd, liquidity / daiPriceInUsd * 0.8)

	
  // underlyingPriceInUsd = underlyingPriceInUsd / 1e6; // Price feed provides price in USD with 6 decimal places
	// console.log(`获取 ${assetName} 预言机价格 underlyingPriceInUsd / 1e6 =${daiPriceInUsd}...`);
	// console.log(`获取 bat 预言机价格 ethPrice / 1e6 =${batPrice/ 1e6}...`);
  // // console.log(`Fetching borrow rate per block for ${assetName} borrowing...`);
  // let borrowRate = await cBatToken.methods.borrowRatePerBlock().call();
  // borrowRate = borrowRate / Math.pow(10, underlyingDecimals);
	// console.log(`获取 ${assetName} 借款的每个区块的借贷率...`);

  // // console.log(`\nYou have ${liquidity} of LIQUID assets (worth of USD) pooled in the protocol.`);
	// console.log(`\n您在协议中汇集了${liquidity}的LIQUID资产(USD）.`);
	// console.log(`您可以借入最多 ${collateralFactor}% 的 ${collateralFactor}% 作为 ${assetName} 提供给协议的.`);
  // console.log(`1 ${assetName} == ${daiPriceInUsd.toFixed(6)} USD`);
	// console.log(`您可以从协议中借入最多 ${liquidity}/${batPrice} ${liquidity/batPrice} bat.`);
	// console.log(`切勿在接近最高金额时借款，因为您的帐户将立即清算.`);
  // // console.log(`\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) ${assetName} per block.\nThis is based on the current borrow rate.\n`);
	// console.log(`\n您的借入金额增加（${borrowRate} * 借入金额）${assetName}每个区块。\n这是基于当前的借款利率.\n`);
};

main().catch((err) => {
  console.error('ERROR:', err);
});
