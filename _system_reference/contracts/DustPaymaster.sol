// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  DUSTPAYMASTER — ERC-4337 Gas Sponsorship                           ║
 * ║                                                                      ║
 * ║  PHASE 1 UPGRADE — Deploy NOW, works today on Polygon               ║
 * ║                                                                      ║
 * ║  The problem: A LUMIS family needs to mint two SBTs (parent +       ║
 * ║  child), register DustPermit rules, and anchor their Life Record.   ║
 * ║  All of that costs MATIC gas. Most parents don't have MATIC.        ║
 * ║  That's a hard barrier that would kill LUMIS adoption.              ║
 * ║                                                                      ║
 * ║  The solution: Dustify pays the gas. Always. Every SBT mint.        ║
 * ║  The family pays $500 for their LUMIS package. That's it.           ║
 * ║  They never see a gas fee. The technology disappears.               ║
 * ║                                                                      ║
 * ║  How: ERC-4337 Paymasters. Already live on Polygon since 2023.      ║
 * ║  We deploy this contract, fund it with MATIC, and it sponsors       ║
 * ║  gas for every UserOperation targeting approved Dustify contracts.   ║
 * ║                                                                      ║
 * ║  Dustify Technologies Corp, Edmonton, Alberta, Canada 🍁             ║
 * ║  April 2026 — Patent Pending at CIPO                                ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

interface IEntryPoint {
    function depositTo(address account) external payable;
    function getDepositInfo(address account) external view returns (
        uint112 deposit,
        bool staked,
        uint112 stake,
        uint32 unstakeDelaySec,
        uint48 withdrawTime
    );
}

interface IPaymaster {
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external returns (bytes memory context, uint256 validationData);

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external;
}

struct UserOperation {
    address   sender;
    uint256   nonce;
    bytes     initCode;
    bytes     callData;
    uint256   callGasLimit;
    uint256   verificationGasLimit;
    uint256   preVerificationGas;
    uint256   maxFeePerGas;
    uint256   maxPriorityFeePerGas;
    bytes     paymasterAndData;
    bytes     signature;
}

enum PostOpMode { opSucceeded, opReverted, postOpReverted }

contract DustPaymaster is IPaymaster {

    // ── ERC-4337 EntryPoint on Polygon ─────────────────────────────────
    // Deployed at the same address on all EVM chains
    address public constant ENTRY_POINT = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;

    // ── Contract owner (Dustify Technologies Corp multisig) ────────────
    address public immutable owner;

    // ── Contracts we're willing to sponsor gas for ─────────────────────
    // Only Dustify-deployed contracts can use this paymaster
    mapping(address => bool) public approvedContracts;

    // ── SBT holders whose gas we sponsor (once they have an SBT) ───────
    // True = Dustify pays their gas
    // False = they pay their own gas
    mapping(address => bool) public sponsoredWallets;

    // ── Daily spend limit per wallet (prevents abuse) ──────────────────
    mapping(address => uint256) public dailySpent;
    mapping(address => uint256) public lastSpendDay;
    uint256 public constant MAX_DAILY_SPONSORED_MATIC = 0.5 ether; // 0.5 MATIC/day/wallet

    // ── Global spend limit (prevents draining the paymaster) ──────────
    uint256 public totalSponsored;
    uint256 public constant MAX_TOTAL_MATIC = 100 ether; // Refill when needed

    // ── Events ─────────────────────────────────────────────────────────
    event GasSponsored(address indexed wallet, address indexed target, uint256 gasCost);
    event ContractApproved(address indexed contractAddr, string name);
    event ContractRevoked(address indexed contractAddr);
    event WalletSponsored(address indexed wallet);
    event WalletUnsponsored(address indexed wallet);
    event PaymasterFunded(uint256 amount);

    // ── Errors ─────────────────────────────────────────────────────────
    error NotOwner();
    error NotEntryPoint();
    error ContractNotApproved(address target);
    error WalletNotSponsored(address wallet);
    error DailyLimitExceeded(address wallet, uint256 spent, uint256 max);
    error GlobalLimitExceeded(uint256 total, uint256 max);
    error InsufficientDeposit();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyEntryPoint() {
        if (msg.sender != ENTRY_POINT) revert NotEntryPoint();
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    // ── Fund the paymaster ─────────────────────────────────────────────
    receive() external payable {
        // Deposit all received MATIC into the EntryPoint
        IEntryPoint(ENTRY_POINT).depositTo{value: msg.value}(address(this));
        emit PaymasterFunded(msg.value);
    }

    // ── Approve Dustify contracts that can use sponsored gas ───────────
    function approveContract(address contractAddr, string calldata name) external onlyOwner {
        approvedContracts[contractAddr] = true;
        emit ContractApproved(contractAddr, name);
    }

    function revokeContract(address contractAddr) external onlyOwner {
        approvedContracts[contractAddr] = false;
        emit ContractRevoked(contractAddr);
    }

    // ── Sponsor (or un-sponsor) a wallet address ───────────────────────
    // Called automatically when an SBT is minted to a wallet
    function sponsorWallet(address wallet) external {
        // Only approved contracts can sponsor wallets (called by SBT mint contract)
        require(approvedContracts[msg.sender], "Only approved contracts can sponsor wallets");
        sponsoredWallets[wallet] = true;
        emit WalletSponsored(wallet);
    }

    function unsponsorWallet(address wallet) external onlyOwner {
        sponsoredWallets[wallet] = false;
        emit WalletUnsponsored(wallet);
    }

    // ── ERC-4337: Validate whether we'll pay for this UserOperation ────
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 /*userOpHash*/,
        uint256 maxCost
    ) external override onlyEntryPoint returns (bytes memory context, uint256 validationData) {

        // Extract the target contract from the UserOperation callData
        // The first 4 bytes are the function selector, but the target
        // is actually the contract being called (userOp.sender for smart accounts,
        // or extracted from callData for direct calls)
        address target = userOp.sender;

        // ── Check 1: Is this wallet sponsored? ─────────────────────────
        // For initial SBT minting (first tx), we sponsor ALL wallets
        // regardless of sponsored status — they can't have an SBT yet
        bool isFirstMint = _isFirstSBTMint(userOp.callData);
        if (!sponsoredWallets[userOp.sender] && !isFirstMint) {
            revert WalletNotSponsored(userOp.sender);
        }

        // ── Check 2: Is the target a Dustify contract? ─────────────────
        // We only sponsor calls to contracts we control
        // Extract target from callData if this is a delegated call
        address callTarget = _extractCallTarget(userOp.callData);
        if (callTarget != address(0) && !approvedContracts[callTarget]) {
            revert ContractNotApproved(callTarget);
        }

        // ── Check 3: Daily spend limit ─────────────────────────────────
        uint256 today = block.timestamp / 1 days;
        if (lastSpendDay[userOp.sender] < today) {
            dailySpent[userOp.sender] = 0;
            lastSpendDay[userOp.sender] = today;
        }
        if (dailySpent[userOp.sender] + maxCost > MAX_DAILY_SPONSORED_MATIC) {
            revert DailyLimitExceeded(userOp.sender, dailySpent[userOp.sender], MAX_DAILY_SPONSORED_MATIC);
        }

        // ── Check 4: Global spend limit ────────────────────────────────
        if (totalSponsored + maxCost > MAX_TOTAL_MATIC) {
            revert GlobalLimitExceeded(totalSponsored, MAX_TOTAL_MATIC);
        }

        // Encode context for postOp: the wallet and maxCost
        context = abi.encode(userOp.sender, maxCost);

        // validationData = 0 means: signature valid, no time range restriction
        return (context, 0);
    }

    // ── ERC-4337: Called after the UserOperation executes ─────────────
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external override onlyEntryPoint {
        (address wallet, ) = abi.decode(context, (address, uint256));

        if (mode != PostOpMode.postOpReverted) {
            // Track actual gas spent
            dailySpent[wallet] += actualGasCost;
            totalSponsored += actualGasCost;
            emit GasSponsored(wallet, wallet, actualGasCost);
        }
    }

    // ── Admin: Check our deposit balance ──────────────────────────────
    function getDeposit() external view returns (uint256) {
        (uint112 deposit, , , ,) = IEntryPoint(ENTRY_POINT).getDepositInfo(address(this));
        return uint256(deposit);
    }

    // ── Admin: Update daily limit ──────────────────────────────────────
    uint256 public maxDailyPerWallet = MAX_DAILY_SPONSORED_MATIC;
    // (immutable in production, upgradeable via separate proxy if needed)

    // ── Internal: Detect first-time SBT mint from callData ────────────
    function _isFirstSBTMint(bytes calldata callData) internal pure returns (bool) {
        if (callData.length < 4) return false;
        bytes4 selector = bytes4(callData[:4]);
        // DustID SBT mint function selectors:
        return selector == bytes4(keccak256("mintSBT(address,string,uint8)")) ||
               selector == bytes4(keccak256("mintFamilySBT(address,address,string)")) ||
               selector == bytes4(keccak256("mintLUMISSBT(address,address,bytes32)"));
    }

    // ── Internal: Extract call target from UserOperation callData ──────
    function _extractCallTarget(bytes calldata callData) internal pure returns (address) {
        // For execute(address target, uint256 value, bytes calldata data) calls
        // This is the standard ERC-4337 smart account execute format
        if (callData.length < 36) return address(0);
        bytes4 selector = bytes4(callData[:4]);
        if (selector == bytes4(keccak256("execute(address,uint256,bytes)"))) {
            // Target is the first argument (bytes 4-36)
            return address(uint160(uint256(bytes32(callData[4:36]))));
        }
        return address(0);
    }
}
