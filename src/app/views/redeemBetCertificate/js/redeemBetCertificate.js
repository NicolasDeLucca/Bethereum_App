import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5/dist/ethers.esm.min.js";
import { abi } from './redeemBetCertificateAbi.js';
import { bettingContractAddress } from "../../../constants/contracts.js";

const metamask = window.ethereum;
const provider = new ethers.providers.Web3Provider(ethereum);

const winningBetCertificateId = document.getElementById('winning-bet-cert-id');
const losingBetCertificateId = document.getElementById('losing-bet-cert-id');
const wildcardType = document.getElementById('wildcard-type');

let accounts, walletAddress, signer, contractInstance;

window.addEventListener('load', async function () {
    accounts = await metamask.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    signer = await provider.getSigner(walletAddress);
    contractInstance = new ethers.Contract(bettingContractAddress, abi, signer);
});

document.getElementById('redeem-winning-bet-cert-btn').addEventListener('click', async function () {
    try {
        let tx = await contractInstance.redeemWinBetCertificate(winningBetCertificateId.value);
        await tx.wait(1);
        alert('Redeemed!');
    } catch (e) {
        console.log(e);
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('redeem-losing-bet-cert-btn').addEventListener('click', async function () {
    try {
        let tx = await contractInstance.redeemLostBetCertificate(losingBetCertificateId.value, wildcardType.value);
        await tx.wait(1);
        alert('Redeemed!');
    } catch (e) {
        console.log(e);
        alert(e.reason ?? 'Something went wrong');
    }
});
