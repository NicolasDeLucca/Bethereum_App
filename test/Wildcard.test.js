const { ethers } = require('hardhat');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
chai.use(solidity);
const { expect } = chai;

const WildcardType = {
    DayBefore: 0,
    doubleSpending: 1,
    wrongType:2
};

const ownersContractPath = 'src/contracts/OwnersContract.sol:OwnersContract';
const bettingContractPath = 'src/contracts/BettingContract.sol:BettingContract';
const contractUtilsPath = 'src/utils/ContractUtils.sol:ContractUtils';
const ERC721UtilsPath = 'src/utils/ERC721Utils.sol:ERC721Utils';
const betCertificateContractPath = 'src/contracts/BetCertificate.sol:BetCertificate';
const galeonContractPath = 'src/contracts/Galeon.sol:Galeon'; 
const wildcardContractPath = 'src/contracts/Wildcard.sol:Wildcard';

let wildcardContractFactory;

let contractUtilsInstance;
let erc721UtilsInstance;
let ownersContractInstance;
let bettingContractInstance;
let betCertificateInstance;
let galeonInstance;
let wildcardInstance;

describe('Wildcard Contract Tests', () => {
    beforeEach(async function () {
        [signer, signer1, testAccount1, testAccount2] = await ethers.getSigners();
        provider = ethers.provider;

        const contractUtils = await ethers.getContractFactory(contractUtilsPath);
        contractUtilsInstance = await contractUtils.deploy();

        const ERC721Utils = await ethers.getContractFactory(ERC721UtilsPath, {
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        erc721UtilsInstance = await ERC721Utils.deploy();

        const ownersContractFactory = await ethers.getContractFactory(ownersContractPath, {
            signer: signer,
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        ownersContractInstance = await ownersContractFactory.deploy();
        const bettingContractFactory = await ethers.getContractFactory(bettingContractPath, {
            signer: signer,
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        bettingContractInstance = await bettingContractFactory.deploy(100, ownersContractInstance.address);

        const galeonContractFactory = await ethers.getContractFactory(galeonContractPath, {
            signer: signer,
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        galeonInstance = await galeonContractFactory.deploy('Galeon', 'GAL', ownersContractInstance.address);

        const betCertificateContractFactory = await ethers.getContractFactory(betCertificateContractPath, {
            signer: signer,
            libraries: {
                ContractUtils: contractUtilsInstance.address,
                ERC721Utils: erc721UtilsInstance.address
            }
        });
        betCertificateInstance = await betCertificateContractFactory.deploy("BetCertificate", "BET", "tokenBetURI", bettingContractInstance.address);

        wildcardContractFactory = await ethers.getContractFactory(wildcardContractPath, {
            signer: signer,
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        wildcardInstance = await wildcardContractFactory.deploy("Wildcard", "WLD", "tokenURI", bettingContractInstance.address);

        await bettingContractInstance.deployed();
        await bettingContractInstance.setTokenContracts(galeonInstance.address, betCertificateInstance.address, wildcardInstance.address);  
        
        await wildcardInstance.deployed();
    });

    describe('Wildcard Contract Deployment', function () {

        it('Should set the right name', async function () {
            expect(await wildcardInstance.name()).to.equal('Wildcard');
        });

        it('Should set the right symbol', async function () {
            expect(await wildcardInstance.symbol()).to.equal('WLD');
        });

        it('Should set the right token URI', async function () {
            expect(await wildcardInstance.tokenURI()).to.equal('tokenURI');
        });

        it('Should set the right betting contract address', async function () {
            expect(await wildcardInstance.bettingContract()).to.equal(bettingContractInstance.address);
        });

        it('Should have zero total supply initially', async function () {
            expect(await wildcardInstance.totalSupply()).to.equal(0);
        });

        it('Should have zero current token ID initially', async function () {
            expect(await wildcardInstance.currentTokenID()).to.equal(0);
        });
    });

    describe('Correct function handling', function () {
        it('Should set approval for all correctly', async function () { 
            let approved = await wildcardInstance.operator(testAccount1,testAccount2);
            expect(approved).to.be.false;
            await wildcardInstance.connect(testAccount1).setApprovalForAll(testAccount2, true);
            approved = await wildcardInstance.operator(testAccount1,testAccount2);
            expect(approved).to.be.true;
        });
    });

    describe('Error handling', function () {

        it('Should revert when trying to deploy Wildcard with empty name', async function () {
            await expect(wildcardContractFactory.deploy("", "WLD", "tokenURI", bettingContractInstance.address)).to.be.revertedWith("Invalid_parameter_name");
        });

        it('Should revert when trying to deploy Wildcard with empty symbol', async function () {
            await expect(wildcardContractFactory.deploy("Wildcard", "", "tokenURI", bettingContractInstance.address)).to.be.revertedWith("Invalid_symbol");
        });

        it('Should revert when trying to deploy Wildcard with empty token URI', async function () {
            await expect(wildcardContractFactory.deploy("Wildcard", "WLD", "", bettingContractInstance.address)).to.be.revertedWith("Invalid_parameter_tokenURI");
        });

        it('Should revert when trying to deploy Wildcard with invalid betting contract address', async function () {
            await expect(wildcardContractFactory.deploy("Wildcard", "WLD", "tokenURI", ethers.constants.AddressZero)).to.be.revertedWith("Invalid_address");
        });

        it('Should revert when trying to set approval for all with invalid operator', async function () {
            await expect(wildcardInstance.setApprovalForAll(ethers.constants.AddressZero, true)).to.be.revertedWith('Invalid_Operator');
        });

        it('Should revert when trying to safe transfer to invalid address', async function () {
            await expect(wildcardInstance.safeTransfer(ethers.constants.AddressZero, 0)).to.be.revertedWith('Invalid_address');
        });

        it('Should revert when trying to safe transfer from invalid address', async function () {
            await expect(wildcardInstance.safeTransferFrom(ethers.constants.AddressZero, ethers.constants.AddressZero, 0)).to.be.revertedWith('Invalid_address');
        });

        it('Should revert when trying to transfer to invalid address', async function () {
            await expect(wildcardInstance.safeTransfer(ethers.constants.AddressZero, 0)).to.be.revertedWith('Invalid_address');
        });

        it('Should revert when trying to transfer from invalid address', async function () {
            await expect(wildcardInstance.safeTransferFrom(ethers.constants.AddressZero, ethers.constants.AddressZero, 0)).to.be.revertedWith('Invalid_address');
        });

        it('Should revert when trying to transfer with invalid token ID', async function () {
            await expect(wildcardInstance.safeTransfer(signer.address, 1)).to.be.revertedWith('Invalid_tokenId');
        });

    });
        
});
