// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {PrivateERC20} from "@coti-io/coti-contracts/contracts/token/PrivateERC20/PrivateERC20.sol";
import "@coti-io/coti-contracts/contracts/utils/mpc/MpcCore.sol";

/**
 * @title WhisperToken (WHISP)
 * @notice Confidential ERC20 token for the Whisper prediction market platform
 * @dev Balances are encrypted on-chain using COTI's garbled circuits
 */
contract WhisperToken is PrivateERC20 {
    address public owner;
    uint64 private _totalSupplyValue;

    // Faucet: max 1000 WHISP per claim, once per address
    uint64 public constant FAUCET_AMOUNT = 1000 * 1e6; // 6 decimals
    mapping(address => bool) public hasClaimed;

    event Mint(address indexed to, uint64 amount);
    event FaucetClaim(address indexed claimer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() PrivateERC20("Whisper", "WHISP") {
        owner = msg.sender;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupplyValue;
    }

    /// @notice Owner can mint tokens to any address
    function mint(address to, uint64 amount) external onlyOwner {
        gtBool success = _mint(to, MpcCore.setPublic64(amount));
        if (MpcCore.decrypt(success)) {
            _totalSupplyValue += amount;
            emit Mint(to, amount);
        }
    }

    /// @notice Anyone can claim testnet tokens once (faucet)
    function faucet() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        hasClaimed[msg.sender] = true;

        gtBool success = _mint(msg.sender, MpcCore.setPublic64(FAUCET_AMOUNT));
        if (MpcCore.decrypt(success)) {
            _totalSupplyValue += FAUCET_AMOUNT;
            emit FaucetClaim(msg.sender);
        }
    }
}
