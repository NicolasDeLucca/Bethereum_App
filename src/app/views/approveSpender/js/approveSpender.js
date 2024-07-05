import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5/dist/ethers.esm.min.js";
import { abi } from './approveSpenderAbi.js';
import { galeonContractAddress } from "../../../constants/contracts.js";

const metamask = window.ethereum;
const provider = new ethers.providers.Web3Provider(ethereum);

const spenderInput = document.getElementById('spender');
const amountInput = document.getElementById('value');
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

document.getElementById('approve-btn').addEventListener('click', async function () {
    try {
        let tx = await contractInstance.approve(spenderInput.value, amountInput.value);
        await tx.wait(1);
        alert('Approved!');
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

    const eventSignature = "Approval(address,address,uint256)";
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

        eventText.innerHTML = eventText.innerHTML + "Approval from " + receivedAddressFrom[i] + "To: " + receivedAddressTo[i] + " Amount: " + receivedAmount[i] + "\n";
    }
}