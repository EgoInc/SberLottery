// SPDX-License-Identifier: GPL-3.0
pragma experimental ABIEncoderV2;
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SberLottery is ERC1155, Ownable {
    constructor() ERC1155("") {}

    struct LotteryStruct {
        string name;
        uint winnersPart;
        uint winnersAmount;
        uint ticketPrice;
        string image;
        //Additional
        uint curCapital;
        uint curParticipants;
        bool isActive;
        string[] transactions;
    }

    mapping (uint=>LotteryStruct) public lottery;
    mapping(uint => mapping(uint => address)) ticketOwner;
    mapping (uint => mapping (uint => bool)) public ticketExists;  

    uint public actualLottery=0;
    event NewLottery(uint id);

    uint public multiplicity=2;

    string public name = "SberLottery";
    
    //NFT management
    mapping(uint => string) tokenMeta;

    function uri(uint256 _id) override public view virtual returns (string memory) {
        return tokenMeta [_id];
    }

    function lotResults(uint _lotId) external view returns (string[] memory){
        return lottery[_lotId].transactions;
    }

    //Lottery management
    function initializeLottery(string calldata _name, uint _winnersPart, uint _winnersAmount, uint _ticket, string calldata _image, uint _money) payable external onlyOwner{
        require(msg.value>=_money, "Add funds");
        string[] memory a = new string[](_winnersAmount*multiplicity);
        lottery[actualLottery]=LotteryStruct(_name, _winnersPart, _winnersAmount, _ticket, _image, _money, 0, true, a);
        emit NewLottery(actualLottery);
        actualLottery++;
    }

    function buyTicket(uint _lotId, uint _ticId, string calldata _meta) payable external{
        require(msg.value==lottery[_lotId].ticketPrice, "Add funds");
        require(lottery[_lotId].isActive, "Ends");
        require(!ticketExists[_lotId][_ticId], "Already bought");
        lottery[_lotId].curParticipants++;
        lottery[_lotId].curCapital+=lottery[_lotId].ticketPrice;
        ticketExists[_lotId][_ticId]=true;
        ticketOwner[_lotId][_ticId]=msg.sender;
        tokenMeta[_ticId]=_meta;
        _mint(msg.sender, _ticId, 1, "");
    }
   
   function arraySum(uint[] calldata _arr) internal pure returns (uint) {
        uint sum;
        uint len = _arr.length;
            for (uint i = 0; i < len; i++) {
            sum += _arr[i];
            }
        return sum;
  }
    function sendPrizes(uint _lotId, uint[] calldata _winners, uint[] calldata _amounts) external onlyOwner{
        require(lottery[_lotId].winnersAmount<=lottery[_lotId].curParticipants, "Not enough participants");
        uint sum = arraySum(_amounts);
        require(lottery[_lotId].curCapital>=sum, "Add funds");
        for (uint winner = 0; winner < multiplicity; winner++){
            uint id = _winners[winner];
            payable(ticketOwner[_lotId][id]).transfer(_amounts[winner]);
            lottery[_lotId].curCapital-=_amounts[winner];
        }
    }

    function writeLotteryResults(uint _lotId, string[] calldata _tx) external onlyOwner{
        for (uint it = 0; it < lottery[_lotId].winnersAmount/multiplicity; it++){
            lottery[_lotId].transactions[it]=_tx[it];
        }
        lottery[_lotId].isActive=false;
        payable(owner()).transfer(lottery[_lotId].curCapital);
    }

    function changeMultiplicity (uint _new) external onlyOwner{
        multiplicity = _new;
    }

    function withdraw() external onlyOwner{
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).transfer(address(this).balance);
    }

    
}
