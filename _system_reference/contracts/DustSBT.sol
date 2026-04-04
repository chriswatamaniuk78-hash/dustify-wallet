// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============================================================
// FILE 1: DustSBT.sol
// ERC-5114 SoulBound NFT — Non-Transferable Identity Token
// Dustify Technologies Corp | Edmonton, Alberta 🍁
// CIPO Patents P6-P11 Pending
// ============================================================

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DustSBT is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE  = keccak256("MINTER_ROLE");
    bytes32 public constant DUSTER_ROLE  = keccak256("DUSTER_ROLE");
    bytes32 public constant PHOENIX_ROLE = keccak256("PHOENIX_ROLE");

    Counters.Counter private _tokenIds;

    // ── Token Data ────────────────────────────────────────────
    struct SBTData {
        address owner;
        string  tier;        // PIONEER | SOVEREIGN | ARCHITECT
        string  status;      // ACTIVE | SUSPENDED | DUSTED | RESURRECTING
        uint256 mintedAt;
        bytes32 lifeRecordHash;  // For LUMIS children
        bool    isLUMISChild;
    }

    mapping(uint256 => SBTData)  private _tokens;
    mapping(address => uint256)  private _ownerToToken;  // One SBT per address
    mapping(uint256 => string)   private _tokenURIs;

    // ── Events ────────────────────────────────────────────────
    event SBTMinted(address indexed to, uint256 indexed tokenId, string tier);
    event SBTDusted(uint256 indexed tokenId);
    event SBTResurrected(uint256 indexed tokenId);
    event SBTStatusChanged(uint256 indexed tokenId, string newStatus);
    event LUMISBadgeMinted(address indexed child, uint256 indexed tokenId, string phase);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(DUSTER_ROLE, admin);
        _grantRole(PHOENIX_ROLE, admin);
    }

    // ── Minting ───────────────────────────────────────────────

    function mint(
        address to,
        string calldata tier
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(_ownerToToken[to] == 0, "DustSBT: address already has SBT");
        require(
            keccak256(bytes(tier)) == keccak256(bytes("PIONEER")) ||
            keccak256(bytes(tier)) == keccak256(bytes("SOVEREIGN")) ||
            keccak256(bytes(tier)) == keccak256(bytes("ARCHITECT")),
            "DustSBT: invalid tier"
        );

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _tokens[tokenId] = SBTData({
            owner:         to,
            tier:          tier,
            status:        "ACTIVE",
            mintedAt:      block.timestamp,
            lifeRecordHash: bytes32(0),
            isLUMISChild:  false
        });

        _ownerToToken[to] = tokenId;

        emit SBTMinted(to, tokenId, tier);
        return tokenId;
    }

    function mintLUMISSBT(
        address parent,
        address child,
        bytes32 lifeRecordHash
    ) external onlyRole(MINTER_ROLE) returns (uint256 parentId, uint256 childId) {
        // Mint parent SBT (if they don't have one)
        if (_ownerToToken[parent] == 0) {
            parentId = mint(parent, "PIONEER");
        } else {
            parentId = _ownerToToken[parent];
        }

        // Mint child SBT
        _tokenIds.increment();
        childId = _tokenIds.current();

        _tokens[childId] = SBTData({
            owner:         child,
            tier:          "PIONEER",
            status:        "ACTIVE",
            mintedAt:      block.timestamp,
            lifeRecordHash: lifeRecordHash,
            isLUMISChild:  true
        });

        _ownerToToken[child] = childId;
        emit SBTMinted(child, childId, "PIONEER");
    }

    function mintLUMISBadge(
        address child,
        string calldata phase,
        string calldata timestamp
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        _tokenIds.increment();
        uint256 badgeId = _tokenIds.current();

        // Badge is separate from the main SBT — it's a milestone token
        _tokens[badgeId] = SBTData({
            owner:         child,
            tier:          phase,
            status:        "ACTIVE",
            mintedAt:      block.timestamp,
            lifeRecordHash: keccak256(bytes(timestamp)),
            isLUMISChild:  true
        });

        emit LUMISBadgeMinted(child, badgeId, phase);
        return badgeId;
    }

    // ── Phoenix Protocol ──────────────────────────────────────

    function dust(uint256 tokenId) external onlyRole(DUSTER_ROLE) {
        require(_exists(tokenId), "DustSBT: token does not exist");
        _tokens[tokenId].status = "DUSTED";
        emit SBTDusted(tokenId);
    }

    function resurrect(uint256 tokenId) external onlyRole(PHOENIX_ROLE) {
        require(_exists(tokenId), "DustSBT: token does not exist");
        require(
            keccak256(bytes(_tokens[tokenId].status)) == keccak256(bytes("DUSTED")),
            "DustSBT: token is not dusted"
        );
        _tokens[tokenId].status = "ACTIVE";
        emit SBTResurrected(tokenId);
    }

    function setStatus(uint256 tokenId, string calldata status) external onlyRole(DUSTER_ROLE) {
        require(_exists(tokenId), "DustSBT: token does not exist");
        _tokens[tokenId].status = status;
        emit SBTStatusChanged(tokenId, status);
    }

    function upgradeTier(uint256 tokenId, string calldata newTier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_exists(tokenId), "DustSBT: token does not exist");
        _tokens[tokenId].tier = newTier;
    }

    // ── Read Functions ────────────────────────────────────────

    function ownerOf(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "DustSBT: token does not exist");
        return _tokens[tokenId].owner;
    }

    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function tokenOf(address owner) external view returns (uint256) {
        return _ownerToToken[owner];
    }

    function tier(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "DustSBT: token does not exist");
        return _tokens[tokenId].tier;
    }

    function status(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "DustSBT: token does not exist");
        return _tokens[tokenId].status;
    }

    function tokenData(uint256 tokenId) external view returns (SBTData memory) {
        require(_exists(tokenId), "DustSBT: token does not exist");
        return _tokens[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

    // ── Internal ──────────────────────────────────────────────

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _tokens[tokenId].owner != address(0);
    }

    // ── TRANSFERS DISABLED — SoulBound ────────────────────────
    // These functions exist in the interface but ALWAYS revert.
    // SBTs cannot be transferred, sold, or given away. Ever.

    function transferFrom(address, address, uint256) external pure {
        revert("DustSBT: SoulBound tokens cannot be transferred");
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert("DustSBT: SoulBound tokens cannot be transferred");
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert("DustSBT: SoulBound tokens cannot be transferred");
    }

    function approve(address, uint256) external pure {
        revert("DustSBT: SoulBound tokens cannot be approved");
    }

    function setApprovalForAll(address, bool) external pure {
        revert("DustSBT: SoulBound tokens cannot be approved");
    }
}
