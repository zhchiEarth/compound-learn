pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;


contract GovernorBravoEvents {
    /// @notice An event emitted when a new proposal is created
    event ProposalCreated(uint id, address proposer, address[] targets, uint[] values, string[] signatures, bytes[] calldatas, uint startBlock, uint endBlock, string description);

    /// @notice An event emitted when a vote has been cast on a proposal
    /// @param voter The address which casted a vote
    /// @param proposalId The proposal id which was voted on
    /// @param support Support value for the vote. 0=against, 1=for, 2=abstain
    /// @param votes Number of votes which were cast by the voter
    /// @param reason The reason given for the vote by the voter
    event VoteCast(address indexed voter, uint proposalId, uint8 support, uint votes, string reason);

    /// @notice An event emitted when a proposal has been canceled
    event ProposalCanceled(uint id);

    /// @notice An event emitted when a proposal has been queued in the Timelock
    event ProposalQueued(uint id, uint eta);

    /// @notice An event emitted when a proposal has been executed in the Timelock
    event ProposalExecuted(uint id);

    /// @notice An event emitted when the voting delay is set
    event VotingDelaySet(uint oldVotingDelay, uint newVotingDelay);

    /// @notice An event emitted when the voting period is set
    event VotingPeriodSet(uint oldVotingPeriod, uint newVotingPeriod);

    /// @notice Emitted when implementation is changed
    event NewImplementation(address oldImplementation, address newImplementation);

    /// @notice Emitted when proposal threshold is set
    event ProposalThresholdSet(uint oldProposalThreshold, uint newProposalThreshold);

    /// @notice Emitted when pendingAdmin is changed
    event NewPendingAdmin(address oldPendingAdmin, address newPendingAdmin);

    /// @notice Emitted when pendingAdmin is accepted, which means admin is updated
    event NewAdmin(address oldAdmin, address newAdmin);

    /// @notice Emitted when whitelist account expiration is set
    event WhitelistAccountExpirationSet(address account, uint expiration);

    /// @notice Emitted when the whitelistGuardian is set
    event WhitelistGuardianSet(address oldGuardian, address newGuardian);
}

contract GovernorBravoDelegatorStorage {
    /// @notice Administrator for this contract
    address public admin;

    /// @notice Pending administrator for this contract
    address public pendingAdmin;

    /// @notice Active brains of Governor
    address public implementation;
}


/**
 * @title Storage for Governor Bravo Delegate
 * @notice For future upgrades, do not change GovernorBravoDelegateStorageV1. Create a new
 * contract which implements GovernorBravoDelegateStorageV1 and following the naming convention
 * GovernorBravoDelegateStorageVX.
 */
contract GovernorBravoDelegateStorageV1 is GovernorBravoDelegatorStorage {

    /// @notice The delay before voting on a proposal may take place, once proposed, in blocks
		/// 提案成功提交后，延迟多长时间再进入投票进程，最小1s，最大1week
    uint public votingDelay;

    /// @notice The duration of voting on a proposal, in blocks
		/// 投票时长，最小24h，最大2weeks
    uint public votingPeriod;

    /// @notice The number of votes required in order for a voter to become a proposer
		/// 发起提案需要的最小投票权数量（包括被委托的），最小50000，最大100000
    uint public proposalThreshold;

    /// @notice Initial proposal id set at become
		/// 初始提案 id 设置为 become
    uint public initialProposalId;

    /// @notice The total number of proposals
		/// 提案总数
    uint public proposalCount;

    /// @notice The address of the Compound Protocol Timelock
		/// timelock 地址
    TimelockInterface public timelock;

    /// @notice The address of the Compound governance token
		/// comp地址
    CompInterface public comp;

    /// @notice The official record of all proposals ever proposed
		/// 所有提案的记录
    mapping (uint => Proposal) public proposals;

    /// @notice The latest proposal for each proposer
		/// 每个提议者的最后一个提议
    mapping (address => uint) public latestProposalIds;

		/// 提案
    struct Proposal {
        /// @notice Unique id for looking up a proposal
				/// 提案唯一id
        uint id;

        /// @notice Creator of the proposal
				/// 提案的创建者
        address proposer;

        /// @notice The timestamp that the proposal will be available for execution, set once the vote succeeds
				/// 提案在投票通过后，应在多久之后才能被执行。这个时间用户不需要自己设置，由合约进行设置
        uint eta;

        /// @notice the ordered list of target addresses for calls to be made
				/// 该提案需要执行的目标合约地址(cToken)
        address[] targets;

        /// @notice The ordered list of values (i.e. msg.value) to be passed to the calls to be made
				/// 调用合约的参数
        uint[] values;

        /// @notice The ordered list of function signatures to be called
				/// 签名
        string[] signatures;

        /// @notice The ordered list of calldata to be passed to each call
        bytes[] calldatas;

        /// @notice The block at which voting begins: holders must delegate their votes prior to this block
				/// 提案发起的blockNumber，检验投票权将以此节点之前计算，即这之后的投票权委托操作将不会影响此提案
        uint startBlock;

        /// @notice The block at which voting ends: votes must be cast prior to this block
				/// 提案投票结束的blockNumber，票数的计算将以此节点之前计算
        uint endBlock;

        /// @notice Current number of votes in favor of this proposal
				/// 目前赞成的票数
        uint forVotes;

        /// @notice Current number of votes in opposition to this proposal
				/// 目前反对的票数
        uint againstVotes;

        /// @notice Current number of votes for abstaining for this proposal
				/// 目前弃权的票数
        uint abstainVotes;

        /// @notice Flag marking whether the proposal has been canceled
				/// 提案是否被取消
        bool canceled;

        /// @notice Flag marking whether the proposal has been executed
				/// 提案是否被执行
        bool executed;

        /// @notice Receipts of ballots for the entire set of voters
				/// 选民的选票回执
        mapping (address => Receipt) receipts;
    }

    /// @notice Ballot receipt record for a voter
		/// 选票收据
    struct Receipt {
        /// @notice Whether or not a vote has been cast
				/// 是否投票
        bool hasVoted;

        /// @notice Whether or not the voter supports the proposal or abstains
				/// 是否支持或者弃权 0=against, 1=for, 2=abstain
        uint8 support;

        /// @notice The number of votes the voter had, which were cast
				/// 选民投出的票数
        uint96 votes;
    }

    /// @notice Possible states that a proposal may be in
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }
}

contract GovernorBravoDelegateStorageV2 is GovernorBravoDelegateStorageV1 {
    /// @notice Stores the expiration of account whitelist status as a timestamp
    mapping (address => uint) public whitelistAccountExpirations;

    /// @notice Address which manages whitelisted proposals and whitelist accounts
    address public whitelistGuardian;
}

interface TimelockInterface {
    function delay() external view returns (uint);
    function GRACE_PERIOD() external view returns (uint);
    function acceptAdmin() external;
    function queuedTransactions(bytes32 hash) external view returns (bool);
    function queueTransaction(address target, uint value, string calldata signature, bytes calldata data, uint eta) external returns (bytes32);
    function cancelTransaction(address target, uint value, string calldata signature, bytes calldata data, uint eta) external;
    function executeTransaction(address target, uint value, string calldata signature, bytes calldata data, uint eta) external payable returns (bytes memory);
}

interface CompInterface {
    function getPriorVotes(address account, uint blockNumber) external view returns (uint96);
}

interface GovernorAlpha {
    /// @notice The total number of proposals
		// 提案数量
    function proposalCount() external returns (uint);
}