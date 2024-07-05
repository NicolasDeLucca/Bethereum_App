import { BrowserProvider, ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { abi } from './abi.js';
import { galeonContractAddress } from "../constants/contracts.js";

const metamask = window.ethereum;
const provider = new BrowserProvider(window.ethereum);

let accounts, walletAddress, signer, contractInstance, etherBalance, galeonsBalance;

let navOwnersDashboard = document.getElementById('nav-owners-dashboard');
let navOwnersClaims = document.getElementById('nav-owners-claims');
let navSetResults = document.getElementById('nav-set-results');
let navRedeemBetCertificate = document.getElementById('nav-redeem-bet-certificate');
let navPlaceABet = document.getElementById('nav-place-a-bet');
let navRedeemGaleons = document.getElementById('nav-redeem-galeons');
let approveSpender = document.getElementById('nav-approve-spender');
let navTransfer = document.getElementById('nav-transfer');
let navOwnersSettings = document.getElementById('nav-owners-settings');
let navBuyGaleons = document.getElementById('nav-buy-galeons');
let etherBalanceSpan = document.getElementById('ether-balance');
let galeonsBalanceSpan = document.getElementById('galeon-balance');

window.addEventListener('load', async function () {
    accounts = await metamask.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    signer = await provider.getSigner(walletAddress);

    contractInstance = new ethers.Contract(galeonContractAddress, abi, signer);

    etherBalance = await provider.getBalance(walletAddress);
    galeonsBalance = await contractInstance.balanceOf(walletAddress);
    etherBalanceSpan.innerHTML = ethers.formatEther(etherBalance);
    galeonsBalanceSpan.innerHTML = galeonsBalance;
});

navBuyGaleons.onclick = async () => {
    window.location.href = "./buyGaleons";
}

navOwnersSettings.onclick = async () => {
    window.location.href = "./ownersSettings";
}

navOwnersDashboard.onclick = async () => {
    window.location.href = "./ownersDashboard";
}

navOwnersClaims.onclick = async () => {
    window.location.href = "./ownersClaims";
}

navSetResults.onclick = async () => {
    window.location.href = "./setResults";
}

navRedeemBetCertificate.onclick = async () => {
    window.location.href = "./redeemBetCertificate";
}

navPlaceABet.onclick = async () => {
    window.location.href = "./placeABet";
}

navRedeemGaleons.onclick = async () => {
    window.location.href = "./redeemGaleons";
}

approveSpender.onclick = async () => {
    window.location.href = "./approveSpender";
}

navTransfer.onclick = async () => {
    window.location.href = "./transfer";
}

