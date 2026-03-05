// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title WhisperMarket
 * @notice Prediction market contract for Whisper platform
 * @dev Uses native COTI for betting. Simple yes/no markets.
 */
contract WhisperMarket {
    address public owner;

    struct Market {
        string question;
        string category;
        string imageUrl;
        uint256 endTime;
        uint256 totalYes;
        uint256 totalNo;
        uint256 totalParticipants;
        bool resolved;
        bool outcome; // true = yes won
        bool exists;
    }

    uint256 public marketCount;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => uint256)) public yesBets;
    mapping(uint256 => mapping(address => uint256)) public noBets;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event MarketCreated(uint256 indexed id, string question, uint256 endTime);
    event BetPlaced(uint256 indexed id, address indexed bettor, bool isYes, uint256 amount);
    event MarketResolved(uint256 indexed id, bool outcome);
    event WinningsClaimed(uint256 indexed id, address indexed claimer, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createMarket(
        string calldata question,
        string calldata category,
        string calldata imageUrl,
        uint256 endTime
    ) external onlyOwner returns (uint256) {
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
            exists: true
        });

        emit MarketCreated(id, question, endTime);
        return id;
    }

    function bet(uint256 marketId, bool isYes) external payable {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(!m.resolved, "Market already resolved");
        require(block.timestamp < m.endTime, "Market has ended");
        require(msg.value > 0, "Must bet something");

        if (yesBets[marketId][msg.sender] == 0 && noBets[marketId][msg.sender] == 0) {
            m.totalParticipants++;
        }

        if (isYes) {
            yesBets[marketId][msg.sender] += msg.value;
            m.totalYes += msg.value;
        } else {
            noBets[marketId][msg.sender] += msg.value;
            m.totalNo += msg.value;
        }

        emit BetPlaced(marketId, msg.sender, isYes, msg.value);
    }

    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(!m.resolved, "Already resolved");

        m.resolved = true;
        m.outcome = outcome;

        emit MarketResolved(marketId, outcome);
    }

    function claimWinnings(uint256 marketId) external {
        Market storage m = markets[marketId];
        require(m.exists, "Market does not exist");
        require(m.resolved, "Market not resolved yet");
        require(!hasClaimed[marketId][msg.sender], "Already claimed");

        uint256 userBet;
        uint256 winningSide;
        uint256 totalPool = m.totalYes + m.totalNo;

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
        uint256 payout = (userBet * totalPool) / winningSide;

        (bool sent, ) = payable(msg.sender).call{value: payout}("");
        require(sent, "Transfer failed");

        emit WinningsClaimed(marketId, msg.sender, payout);
    }

    function getMarket(uint256 marketId) external view returns (
        string memory question,
        string memory category,
        string memory imageUrl,
        uint256 endTime,
        uint256 totalYes,
        uint256 totalNo,
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

    // Allow contract to receive COTI
    receive() external payable {}
}
