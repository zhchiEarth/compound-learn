const Web3 = require('web3');
const web3 = new Web3('https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');

const comptrollerAbi = require("../abi/comptroller_abi.json");
const ctokenAbi = require("../abi/ctoken_abi.json");

const BN = web3.utils.BN

// Your Ethereum wallet private key
const privateKey = process.env.PRIVATE_KEY;

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add('0x' + privateKey);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

// Web3 transaction information, we'll use this for every transaction we'll send
const fromMyWallet = {
  from: myWalletAddress,
  gasLimit: web3.utils.toHex(500000),
  gasPrice: web3.utils.toHex(20000000000) // use ethgasstation.info (mainnet only)
};

const comptrollerAddress = '0x5eAe89DC1C671724A672ff0630122ee834098657';
const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress);

const blocksPerDay = 6570; // 13.15 seconds per block
const daysPerYear = 365;


const logBalances = () => {
  return new Promise(async (resolve, reject) => {
    let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
    let myWalletCTokenBalance = await cToken.methods.balanceOf(myWalletAddress).call() / 1e8;
    let myWalletUnderlyingBalance = +await underlying.methods.balanceOf(myWalletAddress).call() / 1e18;

    console.log(`My Wallet's  ETH Balance:`, myWalletEthBalance);
    console.log(`My Wallet's c${assetName} Balance:`, myWalletCTokenBalance);
    console.log(`My Wallet's  ${assetName} Balance:`, myWalletUnderlyingBalance);

    resolve();
  });
};

const marketInfo = (market, assets) => {
  return new Promise(async (resolve, reject) => {
		let ctokenInstance = new web3.eth.Contract(ctokenAbi, market);
		let decimals = await ctokenInstance.methods.decimals().call();
		let name = await ctokenInstance.methods.name().call();
		let symbol = await ctokenInstance.methods.symbol().call();
		let underlying = await ctokenInstance.methods.underlying().call();

		let supplyRatePerBlock = await ctokenInstance.methods.supplyRatePerBlock().call();
		let borrowRatePerBlock = await ctokenInstance.methods.borrowRatePerBlock().call();
 
    console.log(`ctoken's  decimals:`, decimals);
    console.log(`ctoken's name:`, name);
    console.log(`ctoken's  symbol:`, symbol);
		console.log(`ctoken's  underlying:`, underlying);

		// let tokenInstance = new web3.eth.Contract(ctokenAbi, underlying);
		// let underlyingDecimals = await tokenInstance.methods.decimals().call();
		// let underlyingSymbol = await tokenInstance.methods.symbol().call();
		// let ethMantissa = Math.pow(10, underlyingDecimals);

		// let supplyApy = (((Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
		// let borrowApy = (((Math.pow((borrowRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
		// console.log(`token's  symbol:`, underlyingSymbol);
		// console.log(`token's  underlyingDecimals:`, underlyingDecimals);
		// console.log(`Supply APY for ${underlyingSymbol} ${supplyApy} %`);
		// console.log(`Borrow APY for ${underlyingSymbol} ${borrowApy} %\n`);
		// let collateral = false
		// if (assets.includes(market)) {

		// 	collateral  = await comptroller.methods.checkMembership(myWalletAddress, market).call();

		// 	// let {0:errcode, 1:balance, 2:borrow, 3:exchange }  = await ctokenInstance.methods.getAccountSnapshot(myWalletAddress).call();

		// 	// borrow = new BN(borrow).div(new BN())

		// 	// exchange = exchange / Math.pow(10, (new BN(18).sub(new BN(decimals)).add(new BN(underlyingDecimals))).toString())
		// 	// console.log(`errcode:${errcode} balance:${balance} borrow:${borrow} exchange:${exchange}`)
			
		// }

		// console.log(`Collateral for ${underlyingSymbol} ${collateral} %\n`);
    resolve();
  });
};



const main = async () => {

  // await logBalances();
	// let enterMarkets = await comptroller.methods.enterMarkets(markets).send(fromMyWallet);

	let markets = await comptroller.methods.getAllMarkets().call();
	let market = '0x4a77fAeE9650b09849Ff459eA1476eaB01606C7a'
	let assets = await comptroller.methods.getAssetsIn(myWalletAddress).call();

	markets.forEach( async market => {
		let marketToJoin = await comptroller.methods.markets(market).call();
		
		if ('0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72' == market.toLowerCase()) {
			console.log("====相等")
		}

		// 已经上市的
		if (marketToJoin.isListed) {
			if ('0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72' != market.toLowerCase()) {
				let res =  await marketInfo(market, assets)
			}
			// 
			console.log("assets:", market)
		}

	});


	// let cDAI = '0xF0d0EB522cfa50B716B3b1604C4F0fA6f04376AD'
	// let cBAT = '0x4a77fAeE9650b09849Ff459eA1476eaB01606C7a'
	// let cDAIInstance = new web3.eth.Contract(ctokenAbi, cDAI);
	// let cBAtInstance = new web3.eth.Contract(ctokenAbi, cBAT);
	// let supplyRatePerBlock = await ctokenInstance.methods.supplyRatePerBlock().call();





	// console.log(marketToJoin.isListed, marketToJoin)

	// let marketToJoin = await comptroller.methods.markets(markets[0]).call();
	
  
};

main().catch((err) => {
  console.error('ERROR:', err);
});