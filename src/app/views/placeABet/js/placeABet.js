import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5/dist/ethers.esm.min.js";
import { abi } from './placeABetAbi.js';
import { bettingContractAddress } from "../../../constants/contracts.js";

const metamask = window.ethereum;
const provider = new ethers.providers.Web3Provider(ethereum);

const minBetAmountSpan = document.getElementById('min-bet-amount');
const commissionFeeSpan = document.getElementById('commission-fee');
const betForSpan = document.getElementById('bet-for');
const amountInput = document.getElementById('galeon-amount');
const resultInput = document.getElementById('bet-option');
const wildcardIdInput = document.getElementById('wildcard-id');
const eventText = document.getElementById('events-log');

let accounts, walletAddress, signer, contractInstance;

let receivedBettor = [];
let receivedBetId = [];
let receivedAmount = [];

window.addEventListener('load', async function () {
    accounts = await metamask.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    signer = await provider.getSigner(walletAddress);
    contractInstance = new ethers.Contract(bettingContractAddress, abi, signer);

    // Load the minimum bet amount, commission fee and bet date
    let minBetAmount = await contractInstance.minBetAmount();
    let commissionFee = await contractInstance.commissionFee();
    let betDate = await contractInstance.getBetEpoch();

    minBetAmountSpan.innerHTML = minBetAmount;
    commissionFeeSpan.innerHTML = commissionFee;
    betForSpan.innerHTML = new Date(betDate * 1000).toLocaleString();
});

document.getElementById('bet-btn').addEventListener('click', async function () {
    let amount = amountInput.value;
    let result = resultInput.value;
    try {
        let tx = await contractInstance.bet(amount, result);
        await tx.wait(1);
        alert('Bet placed successfully!');
        await getLogs();
    } catch (e) {
        console.log(e);
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('bet-wildcard-btn').addEventListener('click', async function () {
    let amount = amountInput.value;
    let result = resultInput.value;
    let wildcardId = wildcardIdInput.value;

    try {
        let tx = await contractInstance.betWithWildcard(amount, result, wildcardId);
        await tx.wait(1);
        alert('Bet placed successfully!');
        await getLogs();
    } catch (e) {
        console.log(e);
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('get-events-btn').addEventListener('click', async function () {
    await getLogs();
});

async function getLogs() {
    eventText.innerHTML = "Loading...";

    const eventSignature = "NewBet(uint256,address,uint256)";
    const eventSignatureHash = ethers.utils.id(eventSignature);
    const topic0 = eventSignatureHash;

    const topics = [
        topic0
    ];

    const filter = {
        fromBlock: 0,
        toBlock: 'latest',
        address: contractInstance.address,
        topics: topics
    };

    const logs = await provider.getLogs(filter);

    eventText.innerHTML = "";
    for (let i = 0; i < logs.length; i++) {
        receivedBetId[i] = ethers.utils.defaultAbiCoder.decode(['uint256'], logs[i].topics[1])[0].toString();
        receivedBettor[i] = ethers.utils.defaultAbiCoder.decode(['address'], logs[i].topics[2])[0];
        receivedAmount[i] = ethers.utils.defaultAbiCoder.decode(['uint256'], logs[i].data);

        eventText.innerHTML = eventText.innerHTML + "NewBet from " + receivedBettor[i] + " with ID: " + receivedBetId[i] + " Amount: " + receivedAmount[i] + "\n";
    }
}