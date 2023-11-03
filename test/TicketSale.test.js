const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const{abi, bytecode} = require('../compile');

let accounts;
let ticketsales;

beforeEach(async () => {
	// Get a list of all accounts
	accounts = await web3.eth.getAccounts();
	//console.log(accounts);
	
	ticketsales = await new web3.eth.Contract(abi)
		.deploy({
			data: bytecode, arguments:[100000, 10000],
		})				//^sets initial values of our constructor
		.send({ 
			from: accounts[0], gasPrice: 8000000000, gas: 4700000
		});
});

describe("TicketSale", () => {
	
	it("deploys a contract", () => {
	//console.log(ticketsales);
		assert.ok(ticketsales.options.address);
	});

	it("tests buyTicket", async () => {
		const numTickets = await ticketsales.methods.numTickets().call();
		//we call buyTicket twice
		await ticketsales.methods.buyTicket(1)
			.send({
				from: accounts[4], value: 10000, gasPrice: 8000000000, gas: 4700000
			});
		await ticketsales.methods.buyTicket(13)
			.send({
				from: accounts[6], value: 10000, gasPrice: 8000000000, gas: 4700000
			});
		const numTicketsAfterBuy = await ticketsales.methods.numTickets().call();
		assert.equal(numTicketsAfterBuy, numTickets-2);
	});	
	it("tests offerSwap & acceptSwapOffer", async () => {
		
	         await ticketsales.methods.buyTicket(1)
                        .send({
                                from: accounts[4], value: 10000, gasPrice: 8000000000, gas: 4700000
                        });
                 await ticketsales.methods.buyTicket(13)
                        .send({
                                from: accounts[6], value: 10000, gasPrice: 8000000000, gas: 4700000
                    });
		
	
		//accounts[4] owns ticketId 1
		//accounts[6] owns ticketId 13
		//accounts[6] wants to swap for ticketId 1
		const desiredId = await ticketsales.methods.tickets(accounts[4]).ticketId;
		await ticketsales.methods.offerSwap(accounts[4])
			.send({
				from: accounts[6], gasPrice: 8000000000, gas: 4700000
			});	
		await ticketsales.methods.acceptSwapOffer(accounts[6])
			.send({
				from: accounts[4], gasPrice: 8000000000, gas: 4700000
			});
		
		//now, accounts[6] should have ticketId 1
		const obtainedId = await ticketsales.methods.tickets(accounts[6]).ticketId;
		assert.equal(obtainedId, desiredId);

	});

	it("tests returnTicket", async () => {
		const initialTickets = await ticketsales.methods.numTickets().call();
		await ticketsales.methods.buyTicket(1)
			.send({
                                from: accounts[4], value: 10000, gasPrice: 8000000000, gas: 4700000
                        });
		await ticketsales.methods.buyTicket(12)
			.send({
				from: accounts[5], value: 10000, gasPrice: 8000000000, gas: 4700000
			});
		const currentTickets = await ticketsales.methods.numTickets().call();
		const currentExpected = initialTickets - 2;
		assert.equal(currentTickets, currentExpected);
		await ticketsales.methods.returnTicket(1)
			.send({
				from: accounts[4], gasPrice: 8000000000, gas: 4700000
			});
		await ticketsales.methods.returnTicket(12)
			.send({
				from: accounts[5], gasPrice: 8000000000, gas: 4700000
			});
		const finalTickets = await ticketsales.methods.numTickets().call();
		const finalTicketsExpected = initialTickets;
		//since we returned all the tickets, the final should equal the initial
		assert.equal(finalTickets, finalTicketsExpected);

	});
});



