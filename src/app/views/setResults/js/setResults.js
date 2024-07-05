import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5/dist/ethers.esm.min.js";
import { abi } from './setResultsAbi.js';
import { bettingContractAddress } from "../../../constants/contracts.js";

const metamask = window.ethereum;
const provider = new ethers.providers.Web3Provider(ethereum);

const betForSpan = document.getElementById('bet-for');

let accounts, walletAddress, signer, contractInstance;

window.addEventListener('load', async function () {
    accounts = await metamask.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    signer = await provider.getSigner(walletAddress);
    contractInstance = new ethers.Contract(bettingContractAddress, abi, signer);

    let betDate = await contractInstance.getBetEpoch();
    betForSpan.innerHTML = betDate;
});

document.getElementById('set-result-btn').addEventListener('click', async function () {
    let epoch = document.getElementById('epoch-integers').value;
    let result = document.getElementById('result').value;

    try {
        let tx = await contractInstance.setEpochResult(epoch, result);
        await tx.wait(1);
        alert('Result set successfully');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});
