// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {PrivateERC20} from "@coti-io/coti-contracts/contracts/token/PrivateERC20/PrivateERC20.sol";
import "@coti-io/coti-contracts/contracts/utils/mpc/MpcCore.sol";

/**
 * @title ConfidentialUSDC (cUSDC)
 * @notice Confidential ERC20 pegged to USDC for the Wispr prediction market
 * @dev Balances are encrypted on-chain using COTI's garbled circuits. 6 decimals.
 */
contract ConfidentialUSDC is PrivateERC20 {
    address public owner;
    uint64 private _totalSupplyValue;

    uint64 public constant FAUCET_AMOUNT = 1000 * 1e6; // 1000 cUSDC (6 decimals)
    mapping(address => bool) public hasClaimed;

    event Mint(address indexed to, uint64 amount);
    event FaucetClaim(address indexed claimer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() PrivateERC20("Confidential USDC", "cUSDC") {
        owner = msg.sender;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupplyValue;
    }

    function mint(address to, uint64 amount) external onlyOwner {
        gtBool success = _mint(to, MpcCore.setPublic64(amount));
        if (MpcCore.decrypt(success)) {
            _totalSupplyValue += amount;
            emit Mint(to, amount);
        }
    }

    function faucet() external {
        require(!hasClaimed[msg.sender], "Already claimed");

        gtBool success = _mint(msg.sender, MpcCore.setPublic64(FAUCET_AMOUNT));
        require(MpcCore.decrypt(success), "Mint failed");

        hasClaimed[msg.sender] = true;
        _totalSupplyValue += FAUCET_AMOUNT;
        emit FaucetClaim(msg.sender);
    }

    /**
     * @notice Approve with a plaintext amount (encrypted on-chain via MPC).
     * @dev Avoids the need for off-chain encryption, reducing wallet popups.
     */
    function approvePublic(address spender, uint64 amount) external returns (bool) {
        _approve(msg.sender, spender, MpcCore.setPublic64(amount));
        return true;
    }
}
