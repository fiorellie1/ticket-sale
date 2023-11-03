const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, bytecode } = require('./compile');
const provider = new HDWalletProvider(
'<INSERT SEED PHRASE HERE>',
// remember to change this to your own phrase!
'<INSERT ENDPOINT URL HERE>'
// remember to change this to your own endpoint!
);
const web3 = new Web3(provider);
const deploy = async () => {
const accounts = await web3.eth.getAccounts();
console.log('Attempting to deploy from account', accounts[0]);
inbox = await new web3.eth.Contract(abi)
.deploy({ data: bytecode, arguments: [100000, 10000] })
.send({ from: accounts[0], gasPrice: 8000000000, gas: 4700000});
console.log('Contract deployed to', inbox.options.address);
provider.engine.stop();
};
deploy();
