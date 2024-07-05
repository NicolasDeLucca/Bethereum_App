import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5/dist/ethers.esm.min.js";
import { abi } from './redeemGaleonsAbi.js';
import { galeonContractAddress } from "../../../constants/contracts.js";

const metamask = window.ethereum;
const provider = new ethers.providers.Web3Provider(ethereum);

let accounts, walletAddress, signer, contractInstance;

window.addEventListener('load', async function () {
    accounts = await metamask.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    signer = await provider.getSigner(walletAddress);
    contractInstance = new ethers.Contract(galeonContractAddress, abi, signer);
});

document.getElementById('redeem-btn').addEventListener('click', async function () {
    let galeonsAmount = document.getElementById('galeons-amount').value;
    try {
        let tx = await contractInstance.redeem(galeonsAmount);
        await tx.wait(1);
        alert('Redeemed!');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});
