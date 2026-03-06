// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPrivateERC20} from "@coti-io/coti-contracts/contracts/token/PrivateERC20/IPrivateERC20.sol";
import "@coti-io/coti-contracts/contracts/utils/mpc/MpcCore.sol";

/**
 * @title WisprMarket
 * @notice Prediction market using Confidential USDC (cUSDC) for betting
 * @dev Users approve cUSDC, then bet with cleartext amounts. Payouts use encrypted transfers.
 */
contract WisprMarket {
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
    mapping(uint256 => mapping(address => uint64)) public yesBets;
    mapping(uint256 => mapping(address => uint64)) public noBets;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event MarketCreated(uint256 indexed id, string question, uint256 endTime);
    event BetPlaced(uint256 indexed id, address indexed bettor, bool isYes, uint64 amount);
    event MarketResolved(uint256 indexed id, bool outcome);
    event WinningsClaimed(uint256 indexed id, address indexed claimer, uint64 amount);
    event MarketCancelled(uint256 indexed id);
    event RefundClaimed(uint256 indexed id, address indexed claimer, uint64 amount);

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
     * @notice Place a bet on a market using cUSDC
     * @param marketId The market to bet on
     * @param isYes True for YES, false for NO
     * @param amount Amount in cUSDC (6 decimals). Caller must approve this contract first.
     */
    function bet(uint256 marketId, bool isYes, uint64 amount) external {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(!m.resolved, "Market already resolved");
        require(block.timestamp < m.endTime, "Market has ended");
        require(amount > 0, "Must bet something");

        // State changes first (checks-effects-interactions)
        if (yesBets[marketId][msg.sender] == 0 && noBets[marketId][msg.sender] == 0) {
            m.totalParticipants++;
        }

        if (isYes) {
            yesBets[marketId][msg.sender] += amount;
            m.totalYes += amount;
        } else {
            noBets[marketId][msg.sender] += amount;
            m.totalNo += amount;
        }

        // External call last
        gtUint64 gtAmount = MpcCore.setPublic64(amount);
        gtBool success = token.transferFrom(msg.sender, address(this), gtAmount);
        require(MpcCore.decrypt(success), "Transfer failed");

        emit BetPlaced(marketId, msg.sender, isYes, amount);
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

        uint64 refund = yesBets[marketId][msg.sender] + noBets[marketId][msg.sender];
        require(refund > 0, "Nothing to refund");

        hasClaimed[marketId][msg.sender] = true;

        gtUint64 gtRefund = MpcCore.setPublic64(refund);
        gtBool success = token.transfer(msg.sender, gtRefund);
        require(MpcCore.decrypt(success), "Refund failed");

        emit RefundClaimed(marketId, msg.sender, refund);
    }

    function claimWinnings(uint256 marketId) external {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(m.resolved, "Market not resolved yet");
        require(!hasClaimed[marketId][msg.sender], "Already claimed");

        uint64 userBet;
        uint64 winningSide;
        uint64 totalPool = m.totalYes + m.totalNo;

        if (m.outcome) {
            userBet = yesBets[marketId][msg.sender];
            winningSide = m.totalYes;
        } else {
            userBet = noBets[marketId][msg.sender];
            winningSide = m.totalNo;
        }

        require(userBet > 0, "No winning bet");
        require(winningSide > 0, "No winners");

        hasClaimed[marketId][msg.sender] = true;

        // Proportional payout: (userBet / winningSide) * totalPool
        uint64 payout = uint64((uint128(userBet) * uint128(totalPool)) / uint128(winningSide));

        // Transfer cUSDC payout from contract to winner
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
