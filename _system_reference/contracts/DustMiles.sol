// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  DustMiles — Dustify Waterfall Rewards Token
 * @notice ERC-20 reward token. 100 DM = $1 USDC equivalent.
 *         Earned by every platform action. Redeemable for USDC at the
 *         DustRedeemer contract. Tier multipliers applied at earn time.
 *
 * Earning rules (applied by authorised minters — app contracts):
 *   - Code commit merged:           500 DM
 *   - Test suite passed:            100 DM
 *   - Security audit passed:      1,000 DM
 *   - NFT minted on Dust Studio:    200 DM
 *   - Agent task completed:    10–500 DM (varies by task)
 *   - SR&ED hour logged:            50 DM
 *   - DustMiner compute hour:      150 DM
 *
 * Tier multipliers (from DustID):
 *   DUST:    1.00×
 *   BREEZE:  1.25×
 *   STORM:   1.50×
 *   SURGE:   2.00×
 *   QUANTUM: 2.50×
 *
 * The token is NOT a security — it is a platform reward point with a defined
 * conversion rate. It is NOT freely tradeable on secondary markets by design.
 * Transfer is restricted to: holder → DustRedeemer and approved platform contracts.
 */

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Forward reference to DustID
interface IDustID {
    enum Tier { DUST, BREEZE, STORM, SURGE, QUANTUM }
    function computeTier(address holder) external view returns (Tier);
    function hasSBT(address holder) external view returns (bool);
    function snapshotTier(address holder) external;
}

contract DustMiles is ERC20, ERC20Permit, Ownable, Pausable, ReentrancyGuard {

    // ── Constants ──────────────────────────────────────────────────────────

    uint256 public constant USDC_CONVERSION_RATE = 100; // 100 DM = 1 USDC (in whole USDC)
    uint256 public constant MULTIPLIER_BASIS     = 100; // 1.00× = 100, 1.25× = 125, etc.

    // Tier multipliers (basis points ×100)
    uint256 public constant MULT_DUST    = 100; // 1.00×
    uint256 public constant MULT_BREEZE  = 125; // 1.25×
    uint256 public constant MULT_STORM   = 150; // 1.50×
    uint256 public constant MULT_SURGE   = 200; // 2.00×
    uint256 public constant MULT_QUANTUM = 250; // 2.50×

    // Max per-mint to prevent runaway minting bugs
    uint256 public constant MAX_SINGLE_MINT = 1_000_000 ether; // 1M DM per action

    // ── State ──────────────────────────────────────────────────────────────

    /// @notice Authorised minters (app contracts: DustCode, DustStudio, etc.)
    mapping(address => bool) public minters;

    /// @notice Authorised transfer destinations (DustRedeemer + platform contracts)
    mapping(address => bool) public approvedTransferTargets;

    /// @notice Whether unrestricted transfers are enabled (false by default)
    bool public openTransfers;

    /// @notice Reference to DustID for tier lookups
    IDustID public dustIDContract;

    /// @notice DustRedeemer contract address
    address public redeemer;

    /// @notice Total DustMiles ever minted (monotonically increasing)
    uint256 public totalEarned;

    /// @notice Total DustMiles ever burned/redeemed
    uint256 public totalRedeemed;

    // ── Reward categories for event indexing ──────────────────────────────

    enum RewardCategory {
        CODE_COMMIT,
        TEST_PASSED,
        SECURITY_AUDIT,
        NFT_MINTED,
        AGENT_TASK,
        SRED_HOUR,
        DUSTMINER_COMPUTE,
        STUDIO_ASSET,
        GAME_CREATED,
        OFFICE_ACTION,
        CUSTOM
    }

    // ── Events ─────────────────────────────────────────────────────────────

    event DustMilesEarned(
        address indexed earner,
        uint256 baseAmount,
        uint256 multipliedAmount,
        uint256 multiplier,
        RewardCategory category,
        string description
    );
    event DustMilesRedeemed(address indexed redeemer, uint256 dmAmount, uint256 usdcAmount);
    event MinterUpdated(address indexed minter, bool authorised);
    event TransferTargetUpdated(address indexed target, bool approved);
    event RedeemerUpdated(address indexed redeemer);
    event OpenTransfersToggled(bool open);

    // ── Errors ─────────────────────────────────────────────────────────────

    error NotAuthorisedMinter(address caller);
    error TransferRestricted(address from, address to);
    error MintAmountExceedsMax(uint256 amount);
    error RequiresSBT(address caller);
    error NotRedeemer(address caller);
    error InvalidAmount();

    // ── Modifiers ──────────────────────────────────────────────────────────

    modifier onlyMinter() {
        if (!minters[msg.sender] && msg.sender != owner()) {
            revert NotAuthorisedMinter(msg.sender);
        }
        _;
    }

    modifier onlyRedeemer() {
        if (msg.sender != redeemer && msg.sender != owner()) {
            revert NotRedeemer(msg.sender);
        }
        _;
    }

    // ── Constructor ────────────────────────────────────────────────────────

    constructor(address initialOwner)
        ERC20("DustMiles", "DM")
        ERC20Permit("DustMiles")
        Ownable(initialOwner)
    {}

    // ── Core: Earn ─────────────────────────────────────────────────────────

    /**
     * @notice Mint DustMiles to an earner, applying tier multiplier.
     * @param  earner      Address receiving the DM
     * @param  baseAmount  DM amount before tier multiplier (18 decimals)
     * @param  category    Reward category for analytics
     * @param  description Human-readable description of what was earned
     * @return minted      Actual DM minted after multiplier
     *
     * @dev    Called by authorised app contracts (DustCode, DustStudio, etc.).
     *         The multiplier is applied here, not in the app contract, so the
     *         app only needs to pass the base amount.
     */
    function earn(
        address earner,
        uint256 baseAmount,
        RewardCategory category,
        string calldata description
    ) external whenNotPaused onlyMinter nonReentrant returns (uint256 minted) {
        if (baseAmount == 0) revert InvalidAmount();
        if (baseAmount > MAX_SINGLE_MINT) revert MintAmountExceedsMax(baseAmount);

        uint256 multiplier = _getMultiplier(earner);
        minted = (baseAmount * multiplier) / MULTIPLIER_BASIS;

        _mint(earner, minted);
        totalEarned += minted;

        // Snapshot tier after earning (may have crossed a threshold)
        if (address(dustIDContract) != address(0) && dustIDContract.hasSBT(earner)) {
            try dustIDContract.snapshotTier(earner) {} catch {}
        }

        emit DustMilesEarned(earner, baseAmount, minted, multiplier, category, description);
    }

    /**
     * @notice Batch earn for multiple addresses (e.g. DustMiner payouts)
     */
    function earnBatch(
        address[] calldata earners,
        uint256[] calldata baseAmounts,
        RewardCategory category,
        string calldata description
    ) external whenNotPaused onlyMinter nonReentrant {
        require(earners.length == baseAmounts.length, "Length mismatch");
        require(earners.length <= 200, "Batch too large");

        for (uint256 i = 0; i < earners.length; i++) {
            if (baseAmounts[i] == 0) continue;
            uint256 multiplier = _getMultiplier(earners[i]);
            uint256 minted = (baseAmounts[i] * multiplier) / MULTIPLIER_BASIS;
            _mint(earners[i], minted);
            totalEarned += minted;
            emit DustMilesEarned(earners[i], baseAmounts[i], minted, multiplier, category, description);
        }
    }

    // ── Core: Redeem ───────────────────────────────────────────────────────

    /**
     * @notice Burn DM and record the redemption (actual USDC transfer handled by DustRedeemer)
     * @param  dmHolder   Address whose DM is being redeemed
     * @param  dmAmount   DM to burn (18 decimals)
     * @return usdcAmount Equivalent USDC amount (6 decimals, USDC standard)
     */
    function redeem(address dmHolder, uint256 dmAmount)
        external onlyRedeemer nonReentrant returns (uint256 usdcAmount)
    {
        if (dmAmount == 0) revert InvalidAmount();

        // DM has 18 decimals; USDC has 6 decimals
        // 100 DM = 1 USDC → usdcAmount = dmAmount / (100 × 10^12)
        usdcAmount = dmAmount / (USDC_CONVERSION_RATE * 1e12);
        require(usdcAmount > 0, "Amount too small to redeem");

        _burn(dmHolder, dmAmount);
        totalRedeemed += dmAmount;

        emit DustMilesRedeemed(dmHolder, dmAmount, usdcAmount);
    }

    // ── Transfer restrictions ──────────────────────────────────────────────

    /**
     * @dev Override ERC-20 transfer to restrict to approved targets only.
     *      DM is a reward point, not a freely tradeable token.
     *      Allowed transfers:
     *        1. Minting (from = address(0)) — always allowed
     *        2. Burning (to = address(0)) — always allowed (redeemer only)
     *        3. To DustRedeemer — always allowed
     *        4. To other approved platform contracts
     *        5. Open transfers if flag enabled (governance decision)
     */
    function _update(address from, address to, uint256 value)
        internal virtual override
    {
        // Minting
        if (from == address(0)) {
            super._update(from, to, value);
            return;
        }
        // Burning
        if (to == address(0)) {
            super._update(from, to, value);
            return;
        }
        // Open transfers enabled (governance toggle)
        if (openTransfers) {
            super._update(from, to, value);
            return;
        }
        // Approved targets (redeemer, platform contracts)
        if (approvedTransferTargets[to]) {
            super._update(from, to, value);
            return;
        }

        revert TransferRestricted(from, to);
    }

    // ── Tier multiplier lookup ─────────────────────────────────────────────

    function _getMultiplier(address earner) internal view returns (uint256) {
        if (address(dustIDContract) == address(0)) return MULT_DUST;

        try dustIDContract.computeTier(earner) returns (IDustID.Tier tier) {
            if (tier == IDustID.Tier.QUANTUM) return MULT_QUANTUM;
            if (tier == IDustID.Tier.SURGE)   return MULT_SURGE;
            if (tier == IDustID.Tier.STORM)   return MULT_STORM;
            if (tier == IDustID.Tier.BREEZE)  return MULT_BREEZE;
            return MULT_DUST;
        } catch {
            return MULT_DUST;
        }
    }

    /// @notice Public getter for an address's current multiplier
    function getMultiplier(address earner) external view returns (uint256) {
        return _getMultiplier(earner);
    }

    // ── Read helpers ──────────────────────────────────────────────────────

    /// @notice How many USDC would dmAmount redeem for
    function previewRedeem(uint256 dmAmount) external pure returns (uint256 usdcAmount) {
        return dmAmount / (USDC_CONVERSION_RATE * 1e12);
    }

    /// @notice How many DM needed to redeem usdcAmount (6 decimals)
    function previewEarnForUSDC(uint256 usdcAmount) external pure returns (uint256 dmAmount) {
        return usdcAmount * USDC_CONVERSION_RATE * 1e12;
    }

    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }

    // ── Admin ─────────────────────────────────────────────────────────────

    function setMinter(address minter, bool authorised) external onlyOwner {
        minters[minter] = authorised;
        emit MinterUpdated(minter, authorised);
    }

    function setApprovedTransferTarget(address target, bool approved) external onlyOwner {
        approvedTransferTargets[target] = approved;
        emit TransferTargetUpdated(target, approved);
    }

    function setRedeemer(address _redeemer) external onlyOwner {
        redeemer = _redeemer;
        approvedTransferTargets[_redeemer] = true;
        emit RedeemerUpdated(_redeemer);
    }

    function setDustIDContract(address _dustID) external onlyOwner {
        dustIDContract = IDustID(_dustID);
    }

    function setOpenTransfers(bool open) external onlyOwner {
        openTransfers = open;
        emit OpenTransfersToggled(open);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
