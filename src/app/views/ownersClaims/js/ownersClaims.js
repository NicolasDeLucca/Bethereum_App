import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5/dist/ethers.esm.min.js";
import { ownersAbi, bettingContractAbi, galeonAbi } from './ownersClaimsAbi.js';
import { ownersContractAddress, bettingContractAddress, galeonContractAddress } from "../../../constants/contracts.js";

const metamask = window.ethereum;
const provider = new ethers.providers.Web3Provider(ethereum);

const galeonsToClaim = document.getElementById('galeons-claim');
const ethersToClaim = document.getElementById('ethers-claim');


let accounts, walletAddress, signer, ownersContractInstance, bettingContractInstance, galeonContractInstance;

window.addEventListener('load', async function () {
    accounts = await metamask.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    signer = await provider.getSigner(walletAddress);
    ownersContractInstance = new ethers.Contract(ownersContractAddress, ownersAbi, signer);
    bettingContractInstance = new ethers.Contract(bettingContractAddress, bettingContractAbi, signer);
    galeonContractInstance = new ethers.Contract(galeonContractAddress, galeonAbi, signer);


    await loadGaleonsAndEthers();
});

async function loadGaleonsAndEthers() {
    let ethersToClaimResult = await galeonContractInstance.withdrawFeesAmount();
    let galeonsToClaimResult = await bettingContractInstance.totalFee();

    galeonsToClaim.innerHTML = galeonsToClaimResult;
    ethersToClaim.innerHTML = ethersToClaimResult;
}

document.getElementById('claim-galeons-btn').addEventListener('click', async function () {
    try {
        let tx = await ownersContractInstance.claimGaleons();
        await tx.wait(1);
        alert('Galeons claimed successfully');
        await loadGaleonsAndEthers();
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('claim-ethers-btn').addEventListener('click', async function () {
    try {
        let tx = await ownersContractInstance.claimEth();
        await tx.wait(1);
        alert('Ethers claimed successfully');
        await loadGaleonsAndEthers();
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('withdraw-galeons-btn').addEventListener('click', async function () {
    let galeonsAmount = document.getElementById('galeons-amount').value;
    try {
        let tx = await ownersContractInstance.withdrawGaleons(galeonsAmount);
        await tx.wait(1);
        alert('Galeons withdrawn successfully');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('withdraw-ethers-btn').addEventListener('click', async function () {
    let ethersAmount = document.getElementById('ethers-amount').value;
    try {
        let tx = await ownersContractInstance.withdrawEth(ethersAmount);
        await tx.wait(1);
        alert('Ethers withdrawn successfully');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});
