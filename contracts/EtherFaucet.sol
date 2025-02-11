// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// import "hardhat/console.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract EtherFaucet is Ownable, Pausable {

    uint256 amount = 0.001 ether;
    mapping(address => uint256) sendTimes;

    constructor(address initialOwner)
        Ownable(initialOwner)
    {}

    event Deposit(address indexed from, uint256 amount);
    function deposit() external payable whenNotPaused {
        require(msg.value > 0, "No Ether sent");

        emit Deposit(msg.sender, msg.value);
    }

    event SendMe(address indexed to, uint256 amount);
    function sendMe() external whenNotPaused {
        require(address(this).balance > amount, "Not enough balance");
        require(sendTimes[msg.sender] + 1 weeks < block.timestamp, "Too soon");

        sendTimes[msg.sender] = block.timestamp;
        payable(msg.sender).transfer(amount);

        emit SendMe(msg.sender, amount);
    }

    function isOwner() public view returns (bool) {
        return msg.sender == owner();
    }

    function getContractAddress() public view returns (address) {
        return address(this);
    }
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getMeBalance() public view returns (uint256) {
        return msg.sender.balance;
    }

    function updateAmount(uint256 _amount) public onlyOwner {
        amount = _amount;
    }

    function updateOwner(address _owner) public onlyOwner {
        transferOwnership(_owner);
    }

    function destroy() public onlyOwner {
        require(paused(), "Contract must be paused before destroying");
        payable(msg.sender).transfer(address(this).balance);
    }

    function pause() public onlyOwner whenNotPaused {
        _pause();
    }
    function unpause() public onlyOwner whenPaused {
        _unpause();
    }


    receive() external payable {}
    fallback() external payable {}
}
