// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPrivateERC20} from "@coti-io/coti-contracts/contracts/token/PrivateERC20/IPrivateERC20.sol";
import "@coti-io/coti-contracts/contracts/utils/mpc/MpcCore.sol";

/**
 * @title WhisperMarket
 * @notice Confidential prediction market using encrypted bet storage via COTI MPC
 * @dev Individual bets stored as ctUint64 (encrypted). Only aggregate totals are public.
 */
contract WhisperMarket {
    address public owner;
    IPrivateERC20 public token;

    struct Market {
        string question;
        string category;
        string imageUrl;
        uint256 endTime;
        uint64 totalYes;
        uint64 totalNo;
        uint256 totalParticipants;
        bool resolved;
        bool outcome;
        bool exists;
        bool cancelled;
    }

    uint256 public marketCount;
    mapping(uint256 => Market) public markets;

    // Encrypted per-user bet storage
    mapping(uint256 => mapping(address => ctUint64)) private _yesBets;
    mapping(uint256 => mapping(address => ctUint64)) private _noBets;
    mapping(uint256 => mapping(address => bool)) public hasParticipated;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event MarketCreated(uint256 indexed id, string question, uint256 endTime);
    event BetPlaced(uint256 indexed id, address indexed bettor, bool isYes);
    event MarketResolved(uint256 indexed id, bool outcome);
    event WinningsClaimed(uint256 indexed id, address indexed claimer, uint64 amount);
    event MarketCancelled(uint256 indexed id);
    event RefundClaimed(uint256 indexed id, address indexed claimer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _token) {
        owner = msg.sender;
        token = IPrivateERC20(_token);
    }

    function createMarket(
        string calldata question,
        string calldata category,
        string calldata imageUrl,
        uint256 endTime
    ) external returns (uint256) {
        require(endTime > block.timestamp, "End time must be in the future");

        uint256 id = marketCount++;
        markets[id] = Market({
            question: question,
            category: category,
            imageUrl: imageUrl,
            endTime: endTime,
            totalYes: 0,
            totalNo: 0,
            totalParticipants: 0,
            resolved: false,
            outcome: false,
            exists: true,
            cancelled: false
        });

        emit MarketCreated(id, question, endTime);
        return id;
    }

    /**
     * @dev Safely onboard a ctUint64 — returns setPublic64(0) for uninitialized slots.
     */
    function _safeOnboard(ctUint64 value) internal returns (gtUint64) {
        if (ctUint64.unwrap(value) == 0) {
            return MpcCore.setPublic64(0);
        }
        return MpcCore.onBoard(value);
    }

    /**
     * @notice Place a bet on a market using cUSDC
     * @dev Bet amount stored encrypted via MPC. Only aggregate totals remain public.
     */
    function bet(uint256 marketId, bool isYes, uint64 amount) external {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(!m.resolved, "Market already resolved");
        require(block.timestamp < m.endTime, "Market has ended");
        require(amount > 0, "Must bet something");

        // Track unique participants
        if (!hasParticipated[marketId][msg.sender]) {
            hasParticipated[marketId][msg.sender] = true;
            m.totalParticipants++;
        }

        // Encrypted bet accumulation
        gtUint64 gtAmount = MpcCore.setPublic64(amount);

        if (isYes) {
            gtUint64 current = _safeOnboard(_yesBets[marketId][msg.sender]);
            _yesBets[marketId][msg.sender] = MpcCore.offBoard(MpcCore.add(current, gtAmount));
            m.totalYes += amount;
        } else {
            gtUint64 current = _safeOnboard(_noBets[marketId][msg.sender]);
            _noBets[marketId][msg.sender] = MpcCore.offBoard(MpcCore.add(current, gtAmount));
            m.totalNo += amount;
        }

        // Transfer tokens last (checks-effects-interactions)
        gtBool success = token.transferFrom(msg.sender, address(this), gtAmount);
        require(MpcCore.decrypt(success), "Transfer failed");

        emit BetPlaced(marketId, msg.sender, isYes);
    }

    /**
     * @notice Get your encrypted bet for a market (only you can decrypt)
     */
    function getMyBet(uint256 marketId) external view returns (ctUint64 yesBet, ctUint64 noBet) {
        return (_yesBets[marketId][msg.sender], _noBets[marketId][msg.sender]);
    }

    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(!m.resolved, "Already resolved");
        require(block.timestamp >= m.endTime, "Market has not ended yet");

        m.resolved = true;
        m.outcome = outcome;

        emit MarketResolved(marketId, outcome);
    }

    function cancelMarket(uint256 marketId) external onlyOwner {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(!m.resolved, "Already resolved");

        m.resolved = true;
        m.cancelled = true;

        emit MarketCancelled(marketId);
    }

    function claimRefund(uint256 marketId) external {
        Market storage m = markets[marketId];
        require(m.cancelled, "Market not cancelled");
        require(!hasClaimed[marketId][msg.sender], "Already claimed");

        // Decrypt user bets to compute refund
        gtUint64 gtYes = _safeOnboard(_yesBets[marketId][msg.sender]);
        gtUint64 gtNo = _safeOnboard(_noBets[marketId][msg.sender]);
        gtUint64 gtRefund = MpcCore.add(gtYes, gtNo);
        uint64 refund = MpcCore.decrypt(gtRefund);
        require(refund > 0, "Nothing to refund");

        hasClaimed[marketId][msg.sender] = true;

        gtBool success = token.transfer(msg.sender, gtRefund);
        require(MpcCore.decrypt(success), "Refund failed");

        emit RefundClaimed(marketId, msg.sender);
    }

    function claimWinnings(uint256 marketId) external {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(m.resolved, "Market not resolved yet");
        require(!m.cancelled, "Market was cancelled");
        require(!hasClaimed[marketId][msg.sender], "Already claimed");

        // Decrypt the winning side bet
        gtUint64 gtUserBet;
        uint64 winningSide;
        uint128 totalPool = uint128(m.totalYes) + uint128(m.totalNo);
        require(totalPool > 0, "Empty pool");

        if (m.outcome) {
            gtUserBet = _safeOnboard(_yesBets[marketId][msg.sender]);
            winningSide = m.totalYes;
        } else {
            gtUserBet = _safeOnboard(_noBets[marketId][msg.sender]);
            winningSide = m.totalNo;
        }

        uint64 userBet = MpcCore.decrypt(gtUserBet);
        require(userBet > 0, "No winning bet");
        require(winningSide > 0, "No winners");

        hasClaimed[marketId][msg.sender] = true;

        // Proportional payout: (userBet / winningSide) * totalPool
        uint64 payout = uint64((uint128(userBet) * totalPool) / uint128(winningSide));

        gtUint64 gtPayout = MpcCore.setPublic64(payout);
        gtBool success = token.transfer(msg.sender, gtPayout);
        require(MpcCore.decrypt(success), "Payout transfer failed");

        emit WinningsClaimed(marketId, msg.sender, payout);
    }

    function getMarket(uint256 marketId) external view returns (
        string memory question,
        string memory category,
        string memory imageUrl,
        uint256 endTime,
        uint64 totalYes,
        uint64 totalNo,
        uint256 totalParticipants,
        bool resolved,
        bool outcome
    ) {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        return (
            m.question,
            m.category,
            m.imageUrl,
            m.endTime,
            m.totalYes,
            m.totalNo,
            m.totalParticipants,
            m.resolved,
            m.outcome
        );
    }
}
