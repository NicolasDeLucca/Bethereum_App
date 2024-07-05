import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5/dist/ethers.esm.min.js";
import { abi } from './transferAbi.js';
import { galeonContractAddress } from "../../../constants/contracts.js";

const metamask = window.ethereum;
const provider = new ethers.providers.Web3Provider(ethereum);

const transferGaleonsInput = document.getElementById('my-galeons-amount');
const transferReceiverInput = document.getElementById('my-to-account');
const transferFromGaleonsInput = document.getElementById('other-galeons-amount');
const transferFromSourceInput = document.getElementById('other-from-account');
const transferFromReceiverInput = document.getElementById('other-to-account');
const eventText = document.getElementById('events-log');


let accounts, walletAddress, signer, contractInstance;

let receivedAddressFrom = [];
let receivedAddressTo = [];
let receivedAmount = [];

window.addEventListener('load', async function () {
    accounts = await metamask.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    signer = await provider.getSigner(walletAddress);
    contractInstance = new ethers.Contract(galeonContractAddress, abi, signer);
});

document.getElementById('my-transfer-btn').addEventListener('click', async function () {
    let receiver = transferReceiverInput.value;
    let amount = transferGaleonsInput.value;

    try {
        let tx = await contractInstance.transfer(receiver, amount);
        await tx.wait(1);
        alert('Transfer successful');
        await getLogs();
    } catch (e) {
        console.log(e);
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('other-transfer-btn').addEventListener('click', async function () {
    let receiver = transferFromReceiverInput.value;
    let amount = transferFromGaleonsInput.value;
    let source = transferFromSourceInput.value;

    try {
        let tx = await contractInstance.transferFrom(source, receiver, amount);
        await tx.wait(1);
        alert('Transfer successful');
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

    const eventSignature = "Transfer(address,address,uint256)";
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
        receivedAddressFrom[i] = ethers.utils.defaultAbiCoder.decode(['address'], logs[i].topics[1])[0];
        receivedAddressTo[i] = ethers.utils.defaultAbiCoder.decode(['address'], logs[i].topics[2])[0];
        receivedAmount[i] = ethers.utils.defaultAbiCoder.decode(['uint256'], logs[i].data);

        eventText.innerHTML = eventText.innerHTML + "Transfer from " + receivedAddressFrom[i] + "To: " + receivedAddressTo[i] + " Amount: " + receivedAmount[i] + "\n";
    }
}