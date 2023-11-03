// SPDX-License-Identifier: ISC

pragma solidity ^0.8.17;

contract TicketSale{

    address public manager;
    uint public numTickets;
    uint public ticketPrice;

    constructor(uint _numTickets, uint _ticketPrice) {
        manager = msg.sender;
        numTickets = _numTickets;
        ticketPrice = _ticketPrice;
    }

    struct ticket{
        uint ticketId;
        address theirAddress;
        bool isSold;
    }

    mapping (address => address) public swapOffers;
    mapping (address => ticket) public tickets;
    mapping (uint => address) public ticketOwners;

    function buyTicket(uint ticketId) public payable returns(ticket memory){
        require(tickets[msg.sender].ticketId == 0, "you already own a ticket");
        require(tickets[ticketOwners[ticketId]].isSold == false, "this ticket has sold");
        require(msg.value >= ticketPrice, "insufficient funds");
        require(numTickets >= 1, "no more tickets");
        //creating thisTicket
        ticket memory thisTicket = ticket(ticketId, msg.sender, true);
        //mapping caller's address to thisTicket
        tickets[msg.sender] = thisTicket;
        //mapping thisTicket.ticketId to caller's address
        ticketOwners[thisTicket.ticketId] = msg.sender;
        //update state variables
        numTickets -= 1;
        //giving the caller their ticket
        return(thisTicket);
    }

    function getTicketOf(address person) public view returns(uint){
        return tickets[person].ticketId;
    }

    function offerSwap(address partner) public{
        require(tickets[msg.sender].theirAddress != partner, "can't trade with yourself");
        require(tickets[msg.sender].ticketId != 0, "you don't own a ticket");
        require(tickets[partner].ticketId != 0, "partner doesn't own a ticket");
        swapOffers[partner] = msg.sender;
    }

    function acceptSwapOffer(address partner) public{
        require(tickets[msg.sender].ticketId != 0, "you don't own a ticket");
        require(tickets[partner].ticketId != 0, "partner doesn't down a ticket");
        require(swapOffers[msg.sender] != 0x0000000000000000000000000000000000000000, "no swap offers");
        require(swapOffers[msg.sender] == partner, "no swap offers from partner");
        //copy caller's ticketId
        uint tempTicketId = tickets[msg.sender].ticketId;
        //set caller's ticketId to partner's ticketId
        tickets[msg.sender].ticketId = tickets[partner].ticketId;
        //set partner's ticketId to caller's ticketId (copied)
        tickets[partner].ticketId = tempTicketId;
        //clear tempTicketId variable
        delete tempTicketId;
        //update ticketOwners map
        ticketOwners[tickets[msg.sender].ticketId] = msg.sender;
        ticketOwners[tickets[partner].ticketId] = partner;
        //clear the swap offer
        delete swapOffers[msg.sender];
    }
   
    function returnTicket(uint ticketId) public payable returns(bool, bytes memory){
        //ensures a ticket can only be returned by it's owner
        require(tickets[msg.sender].ticketId == ticketId, "You dont own this ticket");
        //calculate the refund amount (deducting the 10% service fee)
        uint refundAmount = (ticketPrice * 9) / 10;
        //send refund amount to the caller
        (bool success, bytes memory data) = (msg.sender).call{value: refundAmount}("");
        require(success, "transfer failed");
        //clear the ticket
        delete tickets[msg.sender];
        //clear the mapping
        delete ticketOwners[ticketId];
        numTickets += 1;
        return(success, data);
    }
    //used for a ticket owner to find the owner of a ticketId, so they can initiate offerSwap
    function getTicketOwner(uint ticketId) public view returns(address){
        return(tickets[ticketOwners[ticketId]].theirAddress);
    }

    function viewContractBalance() public view returns(uint){
        return(address(this).balance);
    }
}
