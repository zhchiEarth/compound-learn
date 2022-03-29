pragma solidity ^0.5.16;

import "./CToken.sol";
import "./PriceOracle.sol";

contract UnitrollerAdminStorage {
    /**
    * @notice Administrator for this contract
    */
    address public admin;

    /**
    * @notice Pending administrator for this contract
    */
    address public pendingAdmin;

    /**
    * @notice Active brains of Unitroller
    */
    address public comptrollerImplementation;

    /**
    * @notice Pending brains of Unitroller
    */
    address public pendingComptrollerImplementation;
}

contract ComptrollerV1Storage is UnitrollerAdminStorage {

    /**
     * @notice Oracle which gives the price of any given asset
     */
    PriceOracle public oracle;

    /**
     * @notice Multiplier used to calculate the maximum repayAmount when liquidating a borrow
     * @dev 清算关闭因子 最大 50%
     */
    uint public closeFactorMantissa;

    /**
     * @notice Multiplier representing the discount on collateral that a liquidator receives
     * @dev 清算激励尾数 1.08 多了 0.08
     */
    uint public liquidationIncentiveMantissa;

    /**
     * @notice Max number of assets a single account can participate in (borrow or use as collateral)
     * @dev 最大资产 现在有20个资产
     */
    uint public maxAssets;

    /**
     * @notice Per-account mapping of "assets you are in", capped by maxAssets
     * @dev user -> CToken[] 每个用户参加的地址，CToken[] 用户参与了哪些资产
     */
    mapping(address => CToken[]) public accountAssets;
}

contract ComptrollerV2Storage is ComptrollerV1Storage {
    /// Market 代表市场
    struct Market {
        /// @notice Whether or not this market is listed
        bool isListed;

        /**
         * @notice Multiplier representing the most one can borrow against their collateral in this market.
         *  For instance, 0.9 to allow borrowing 90% of collateral value.
         *  Must be between 0 and 1, and stored as a mantissa.
         *  如果抵押物价值100， 0.9 表示可以借出 90
         * 资产抵押率
         */
        uint collateralFactorMantissa;

        /// @notice Per-market mapping of "accounts in this asset"
        // 表示用户是否出入了这个资产, 前端显示
        mapping(address => bool) accountMembership;

        /// @notice Whether or not this market receives COMP
        bool isComped;
    }

    /**
     * @notice Official mapping of cTokens -> Market metadata
     * @dev Used e.g. to determine if a market is supported
     */
    mapping(address => Market) public markets;


    /**
     * @notice The Pause Guardian can pause certain actions as a safety mechanism.
     *  Actions which allow users to remove their own assets cannot be paused.
     *  Liquidation / seizing / transfer can only be paused globally, not by market.
     * @dev 在一些紧急情况下的安全机制，不能暂停允许用户删除自己的资产的操作。清算扣押转移只能在全球范围内暂停，不能按市场暂停
     */
    address public pauseGuardian;
    // 所有cToken的 mint操作暂停
    bool public _mintGuardianPaused;
    bool public _borrowGuardianPaused;
    bool public transferGuardianPaused;
    bool public seizeGuardianPaused;

    // 对一下资产做了子的开关，下面如 cUSDT的 mint操作开关
    // @default false 没有被暂停可以使用
    // 0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9 cUSDT true
    // ...所有的的cToken
    mapping(address => bool) public mintGuardianPaused;

    // @default false 没有被暂停可以使用
    // 0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9 cUSDT true
    mapping(address => bool) public borrowGuardianPaused;
}

contract ComptrollerV3Storage is ComptrollerV2Storage {
    struct CompMarketState {
        /// @notice The market's last updated compBorrowIndex or compSupplyIndex
        uint224 index;

        /// @notice The block number the index was last updated at
        uint32 block;
    }

    /// @notice A list of all markets 所有的CToken
    CToken[] public allMarkets;

    /// @notice The rate at which the flywheel distributes COMP, per block
    uint public compRate;

    /// @notice The portion of compRate that each market currently receives
    mapping(address => uint) public compSpeeds;

    /// @notice The COMP market supply state for each market
    mapping(address => CompMarketState) public compSupplyState;

    /// @notice The COMP market borrow state for each market
    mapping(address => CompMarketState) public compBorrowState;

    /// @notice The COMP borrow index for each market for each supplier as of the last time they accrued COMP

    mapping(address => mapping(address => uint)) public compSupplierIndex;

    /// @notice The COMP borrow index for each market for each borrower as of the last time they accrued COMP
    // market => wallet_address => index(scaled by le36: Double)
    // 各个市场下，每个用户地址的指数
    mapping(address => mapping(address => uint)) public compBorrowerIndex;

    /// @notice The COMP accrued but not yet transferred to each user
    // 每个用户未提现的 COMP
    mapping(address => uint) public compAccrued;
}

contract ComptrollerV4Storage is ComptrollerV3Storage {
    // @notice The borrowCapGuardian can set borrowCaps to any number for any market. Lowering the borrow cap could disable borrowing on the given market.
    //
    address public borrowCapGuardian;

    // @notice Borrow caps enforced by borrowAllowed for each cToken address. Defaults to zero which corresponds to unlimited borrowing.
    // 每种 token 总的借贷上限，不区分用户
    // @default 0   0代表无上限   100000 代表总的用户借的总额 不能超过100000
    // 0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9 cUSDT
    mapping(address => uint) public borrowCaps;
}

contract ComptrollerV5Storage is ComptrollerV4Storage {
    /// @notice The portion of COMP that each contributor receives per block
		// 每个贡献者每个区块收到的奖励
    mapping(address => uint) public compContributorSpeeds;

    /// @notice Last block at which a contributor's COMP rewards have been allocated
		// 最后一个贡献者的最后一个更小的区块号
    mapping(address => uint) public lastContributorBlock;
}

contract ComptrollerV6Storage is ComptrollerV5Storage {
    /// @notice The rate at which comp is distributed to the corresponding borrow market (per block)
    // 设置每个资产一天可以生成多少个 COMP代币
    // https://compound.finance/governance/comp 查看Comp 每天的生成量
    mapping(address => uint) public compBorrowSpeeds;

    /// @notice The rate at which comp is distributed to the corresponding supply market (per block)
    mapping(address => uint) public compSupplySpeeds;
}

contract ComptrollerV7Storage is ComptrollerV6Storage {
    /// @notice Flag indicating whether the function to fix COMP accruals has been executed (RE: proposal 62 bug)
    bool public proposal65FixExecuted;

    /// @notice Accounting storage mapping account addresses to how much COMP they owe the protocol.
    mapping(address => uint) public compReceivable;
}
