import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5/dist/ethers.esm.min.js";
import { abi } from './buyGaleonsAbi.js';
import { galeonContractAddress } from "../../../constants/contracts.js";

const metamask = window.ethereum;
const provider = new ethers.providers.Web3Provider(ethereum);

let accounts, walletAddress, signer, contractInstance;

let mintPrice = document.getElementById('mint-price');

window.addEventListener('load', async function () {
    accounts = await metamask.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    signer = await provider.getSigner(walletAddress);
    contractInstance = new ethers.Contract(galeonContractAddress, abi, signer);

    // Load mint price
    let galeonMintPrice = await contractInstance.mintPrice();
    mintPrice.innerHTML = galeonMintPrice.toString();
});

document.getElementById('buy-button').addEventListener('click', async function () {
    let galeonAmount = document.getElementById('galeon-amount');
    let etherAmount = document.getElementById('ether-amount');

    let tx = await contractInstance.mint(galeonAmount.value, { value: ethers.utils.parseEther(etherAmount.value.toString()) });
    await tx.wait(1);
    alert('Galeons bought successfully!');
});