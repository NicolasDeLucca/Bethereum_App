const { ethers } = require("hardhat");

const ownersContractPath = 'src/contracts/OwnersContract.sol:OwnersContract';
const bettingContractPath = 'src/contracts/BettingContract.sol:BettingContract';
const contractUtilsPath = 'src/utils/ContractUtils.sol:ContractUtils';
const ERC721UtilsPath = 'src/utils/ERC721Utils.sol:ERC721Utils';
const betCertificateContractPath = 'src/contracts/BetCertificate.sol:BetCertificate';
const galeonContractPath = 'src/contracts/Galeon.sol:Galeon'; 
const wildcardContractPath = 'src/contracts/Wildcard.sol:Wildcard';
const erc721TokenReceiverContractPath = 'src/contracts/ERC721TokenReceiver.sol:ERC721TokenReceiver';

const comissionFee = 100;
const galeonName = "Galeon";
const galeonSymbol = "GAL";
const betCertificateName = "BetCertificate";
const betCertificateSymbol = "BET";
const betCertificateTokenURI = "tokenBetURI";
const wildcardName = "Wildcard";
const wildcardSymbol = "WIL";
const wildcardTokenURI = "tokenWilURI";

let ownersContractInstance;
let bettingContractInstance;
let contractUtilsInstance;
let erc721UtilsInstance;
let betCertificateInstance;
let galeonInstance;
let wildcardInstance;
let erc721TokenReceiverInstance;

async function main() {

    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Deploy contracts process start...");
    console.log("---------------------------------------------------------------------------------------");

    erc721TokenReceiverInstance = await (await ethers.getContractFactory(erc721TokenReceiverContractPath)).deploy();

    const contractUtils = await ethers.getContractFactory(contractUtilsPath);
    contractUtilsInstance = await contractUtils.deploy();

    const ERC721Utils = await ethers.getContractFactory(ERC721UtilsPath, {
        libraries: { ContractUtils: contractUtilsInstance.address }
    });
    erc721UtilsInstance = await ERC721Utils.deploy();

    const ownersContractFactory = await ethers.getContractFactory(ownersContractPath,
    {
        signer: signer,
        libraries: { ContractUtils: contractUtilsInstance.address }
    });
    ownersContractInstance = await ownersContractFactory.deploy();

    const bettingContractFactory = await ethers.getContractFactory(bettingContractPath, {
        signer: signer,
        libraries: { ContractUtils: contractUtilsInstance.address }
    });
    bettingContractInstance = await bettingContractFactory.deploy(comissionFee, ownersContractInstance.address);

    const galeonContractFactory = await ethers.getContractFactory(galeonContractPath, {
        signer: signer,
        libraries: { ContractUtils: contractUtilsInstance.address }
    });
    galeonInstance = await galeonContractFactory.deploy(galeonName, galeonSymbol, ownersContractInstance.address);

    const betCertificateContractFactory = await ethers.getContractFactory(betCertificateContractPath, {
        signer: signer,
        libraries: {
            ContractUtils: contractUtilsInstance.address,
            ERC721Utils: erc721UtilsInstance.address
        }
    });
    betCertificateInstance = await betCertificateContractFactory.deploy(betCertificateName, betCertificateSymbol, 
        betCertificateTokenURI, bettingContractInstance.address);

    const wildcardContractFactory = await ethers.getContractFactory(wildcardContractPath, {
        signer: signer,
        libraries: { ContractUtils: contractUtilsInstance.address }
    });
    wildcardInstance = await wildcardContractFactory.deploy(wildcardName, wildcardSymbol, wildcardTokenURI, 
        ownersContractInstance.address);
    
    await contractUtilsInstance.deployed();
    await erc721UtilsInstance.deployed();

    console.log("contractUtils:\t", contractUtilsInstance.address);
    console.log("ERC721Utils:\t", erc721UtilsInstance.address);
    console.log("-- Libraries have been successfully deployed");
    console.log("---------------------------------------------------------------------------------------");    

    await erc721TokenReceiverInstance.deployed();
    await wildcardInstance.deployed();
    await ownersContractInstance.deployed();
    await galeonInstance.deployed();
    await bettingContractInstance.deployed();
    await betCertificateInstance.deployed();          

    console.log("erc721TokenReceiver:\t", erc721TokenReceiverInstance.address);
    console.log("OwnersContract:\t", ownersContractInstance.address);
    console.log("BettingContract:\t", bettingContractInstance.address);
    console.log("Galeon:\t", galeonInstance.address);
    console.log("BetCertificate:\t", betCertificateInstance.address);
    console.log("Wildcard:\t", wildcardInstance.address);
    console.log("-- Contracts have been successfully deployed");
    console.log("---------------------------------------------------------------------------------------");

    await bettingContractInstance.setTokenContracts(galeonInstance.address, betCertificateInstance.address, 
        wildcardInstance.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });