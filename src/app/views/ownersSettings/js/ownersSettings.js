import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5/dist/ethers.esm.min.js";
import { bettingContractAbi, galeonAbi, ownersContractAbi } from './ownersSettingsAbi.js';
import { galeonContractAddress, bettingContractAddress, ownersContractAddress } from "../../../constants/contracts.js";

const metamask = window.ethereum;
const provider = new ethers.providers.Web3Provider(ethereum);

const galeonMintPriceInput = document.getElementById('galeon-mint-price');
const minimumBetAMountInput = document.getElementById('minimum-bet-amount');
const commissionFeeInput = document.getElementById('commission-fee');
const wildcardMintPriceInput = document.getElementById('wildcard-mint-price');
const withdrawFeeInput = document.getElementById('withdraw-fee');

let accounts, walletAddress, signer, bettingContractInstance, galeonContractInstance, ownersContractInstance;

window.addEventListener('load', async function () {
    accounts = await metamask.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    signer = await provider.getSigner(walletAddress);

    bettingContractInstance = new ethers.Contract(bettingContractAddress, bettingContractAbi, signer);
    galeonContractInstance = new ethers.Contract(galeonContractAddress, galeonAbi, signer);
    ownersContractInstance = new ethers.Contract(ownersContractAddress, ownersContractAbi, signer);
});

document.getElementById('galeon-mint-price-btn').addEventListener('click', async function () {
    try {
        let tx = await galeonContractInstance.setMintPrice(ethers.utils.parseEther(galeonMintPriceInput.value.toString()));
        await tx.wait(1);
        alert('Galeon mint price updated!');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('withdraw-fee-btn').addEventListener('click', async function () {
    try {
        let tx = await galeonContractInstance.setWithdrawFee(withdrawFeeInput.value.toString());
        await tx.wait(1);
        alert('Withdraw fee updated!');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('wildcard-mint-price-btn').addEventListener('click', async function () {
    try {
        let wildcardType = document.getElementById('wildcard-type').value;
        let tx = await bettingContractInstance.setMintPrice(wildcardType, ethers.utils.parseEther(wildcardMintPriceInput.value.toString()));
        await tx.wait(1);
        alert('Wildcard mint price updated!');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('commission-fee-btn').addEventListener('click', async function () {
    try {
        let tx = await bettingContractInstance.setCommissionFee(commissionFeeInput.value.toString());
        await tx.wait(1);
        alert('Commission fee updated!');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('minimum-bet-amount-btn').addEventListener('click', async function () {
    try {
        let tx = await bettingContractInstance.setMinBetAmount(minimumBetAMountInput.value.toString());
        await tx.wait(1);
        alert('Minimum bet amount updated!');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('galeon-contract-address-owners-btn').addEventListener('click', async function () {
    try {
        let galeonContractAddress = document.getElementById('galeon-contract-address-owners').value;

        let tx = await ownersContractInstance.setGaleonContract(galeonContractAddress);
        await tx.wait(1);
        alert('Galeon contract updated!');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('betting-contract-address-owners-btn').addEventListener('click', async function () {
    try {
        let bettingContractAddress = document.getElementById('betting-contract-address-owners').value;

        let tx = await ownersContractInstance.setBettingContract(bettingContractAddress);
        await tx.wait(1);
        alert('Betting contract updated!');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('betting-contract-set-token-contracts-btn').addEventListener('click', async function () {
    try {
        let betCertificateContractAddress = document.getElementById('betting-contract-set-token-contracts-bet-certificate').value;
        let wildcardContractAddress = document.getElementById('betting-contract-set-token-contracts-wildcard').value;
        let galeonContractAddress = document.getElementById('betting-contract-set-token-contracts-galeon').value;

        let tx = await bettingContractInstance.setTokenContracts(galeonContractAddress, betCertificateContractAddress, wildcardContractAddress);
        await tx.wait(1);
        alert('Contracts updated!');
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});
