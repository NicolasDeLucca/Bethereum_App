import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5/dist/ethers.esm.min.js";
import { abi } from './ownersDashboardAbi.js';
import { ownersContractAddress } from "../../../constants/contracts.js";

const metamask = window.ethereum;
const provider = new ethers.providers.Web3Provider(ethereum);

const isOwnerSpan = document.getElementById('is-owner');
const ownerIndexSpan = document.getElementById('owner-index');
const galeonsClaimSpan = document.getElementById('galeons-claim');
const ethersClaimSpan = document.getElementById('ethers-claim');
const ownersCount = document.getElementById('owners-count');
const addressInput = document.getElementById('address-input');

let accounts, walletAddress, signer, contractInstance;

window.addEventListener('load', async function () {
    accounts = await metamask.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    signer = await provider.getSigner(walletAddress);
    contractInstance = new ethers.Contract(ownersContractAddress, abi, signer);

    await loadOwnersCount();
});

async function loadOwnersCount() {
    // Load owners count
    let ownersCountResult = await contractInstance.ownersCount();
    ownersCount.innerHTML = ownersCountResult.toNumber();
}

async function loadOwnerMetadata() {
    let ownerMetadata = await contractInstance.getOwner(addressInput.value);
    setOwnerMetadata(
        ownerMetadata.isOwner,
        ownerMetadata.ownerIndex.toString(),
        ownerMetadata.galeonsToClaim.toString(),
        ownerMetadata.ethToClaim.toString()
    );
}

document.getElementById('search-owner-btn').addEventListener('click', async function () {
    await loadOwnerMetadata();
});

document.getElementById('add-owner-btn').addEventListener('click', async function () {
    try {
        let tx = await contractInstance.addOwner(addressInput.value);
        await tx.wait(1);
        alert('Owner added successfuly!');
        await loadOwnerMetadata();
        await loadOwnersCount();
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

document.getElementById('remove-owner-btn').addEventListener('click', async function () {
    try {
        let tx = await contractInstance.removeOwner(addressInput.value);
        await tx.wait(1);
        alert('Owner removed successfuly!');
        await loadOwnerMetadata();
        await loadOwnersCount();
    } catch (e) {
        alert(e.reason ?? 'Something went wrong');
    }
});

function setOwnerMetadata(isOwner, ownerIndex, galeonsClaim, ethersClaim) {
    isOwnerSpan.innerHTML = isOwner ? 'Yes' : 'No';
    ownerIndexSpan.innerHTML = ownerIndex;
    galeonsClaimSpan.innerHTML = galeonsClaim;
    ethersClaimSpan.innerHTML = ethersClaim;
}
