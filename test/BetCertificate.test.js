const { ethers } = require('hardhat');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
chai.use(solidity);
const { expect } = chai;

const commissionFee = 50;

const ownersContractPath = 'src/contracts/OwnersContract.sol:OwnersContract';
const bettingContractPath = 'src/contracts/BettingContract.sol:BettingContract';
const contractUtilsPath = 'src/utils/ContractUtils.sol:ContractUtils';
const ERC721UtilsPath = 'src/utils/ERC721Utils.sol:ERC721Utils';
const betCertificateContractPath = 'src/contracts/BetCertificate.sol:BetCertificate';
const galeonContractPath = 'src/contracts/Galeon.sol:Galeon'; 
const wildcardContractPath = 'src/contracts/Wildcard.sol:Wildcard';

let contractUtilsInstance;
let ownersContractInstance;
let bettingContractInstance;
let betCertificateInstance;

let betResult = 0;
let betEpoch = 1;
let amount = 100;

let name = "BetCertificate";
let symbol = "BET";
let tokenURI = "betCertificateTokenURI";

describe('BetCertificate tests', () => {
    beforeEach(async () => {
        [signer, testAccount] = await ethers.getSigners();
        provider = ethers.provider;

        const contractUtils = await ethers.getContractFactory(contractUtilsPath);
        contractUtilsInstance = await contractUtils.deploy();
        await contractUtilsInstance.deployed();

        const ERC721Utils = await ethers.getContractFactory(ERC721UtilsPath, {
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        ERC721UtilsInstance = await ERC721Utils.deploy();
        await ERC721UtilsInstance.deployed();

        const ownersContractFactory = await ethers.getContractFactory(ownersContractPath,
        {
            signer: signer,
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        ownersContractInstance = await ownersContractFactory.deploy();
        await ownersContractInstance.deployed();

        const bettingContractFactory = await ethers.getContractFactory(bettingContractPath, {
            signer: signer,
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        bettingContractInstance = await bettingContractFactory.deploy(commissionFee, ownersContractInstance.address);
        await bettingContractInstance.deployed();

        const galeonContractFactory = await ethers.getContractFactory(galeonContractPath, {
            signer: signer,
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        galeonContractInstance = await galeonContractFactory.deploy('Galeon', 'GAL', ownersContractInstance.address);
        await galeonContractInstance.deployed();

        const betCertificateContractFactory = await ethers.getContractFactory(betCertificateContractPath, {
            signer: signer,
            libraries: {
                ContractUtils: contractUtilsInstance.address,
                ERC721Utils: ERC721UtilsInstance.address
            }
        });
        betCertificateInstance = await betCertificateContractFactory.deploy("BetCertificate", "BET", tokenURI, bettingContractInstance.address);
        await betCertificateInstance.deployed();

        const wildcardContractFactory = await ethers.getContractFactory(wildcardContractPath, {
            signer: signer,
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        wildcardContractInstance = await wildcardContractFactory.deploy("Wildcard", "GAL", "tokenuri2", bettingContractInstance.address);
        await wildcardContractInstance.deployed();
        
        await bettingContractInstance.setTokenContracts(galeonContractInstance.address,betCertificateInstance.address,wildcardContractInstance.address);
        await ownersContractInstance.setGaleonContract(galeonContractInstance.address);
        await ownersContractInstance.setBettingContract(bettingContractInstance.address);
    });

    describe("Constructor tests", function () {

        it("Should set the right name", async function () {
            expect(await betCertificateInstance.name()).to.equal(name);
        });

        it("Should set the right symbol", async function () {
            expect(await betCertificateInstance.symbol()).to.equal(symbol);
        });

        it("Should set the right token URI", async function () {
            expect(await betCertificateInstance.tokenURI()).to.equal(tokenURI);
        });

        it("Should set the right betting contract", async function () {
            expect(await betCertificateInstance.bettingContract()).to.equal(bettingContractInstance.address);
        });

        it("Should have zero total supply initially", async function () {
            expect(await betCertificateInstance.totalSupply()).to.equal(0);
        });

        it("Should have zero current token ID initially", async function () {
            expect(await betCertificateInstance.currentTokenID()).to.equal(0);
        });

        it("Should not deploy if name is empty", async function () {
            const betCertificateContractFactory = await ethers.getContractFactory(betCertificateContractPath, {
                signer: signer,
                libraries: {
                    ContractUtils: contractUtilsInstance.address,
                    ERC721Utils: ERC721UtilsInstance.address
                }
            });
            await expect(betCertificateContractFactory.deploy("", symbol, tokenURI, bettingContractInstance.address)).to.be.revertedWith("Invalid_parameter_name");
        });

        it("Should not deploy if symbol is empty", async function () {
            const betCertificateContractFactory = await ethers.getContractFactory(betCertificateContractPath, {
                signer: signer,
                libraries: {
                    ContractUtils: contractUtilsInstance.address,
                    ERC721Utils: ERC721UtilsInstance.address
                }
            });
            await expect(betCertificateContractFactory.deploy(name, "", tokenURI, bettingContractInstance.address)).to.be.revertedWith("Invalid_symbol");
        });

        it("Should not deploy if token URI is empty", async function () {
            const betCertificateContractFactory = await ethers.getContractFactory(betCertificateContractPath, {
                signer: signer,
                libraries: {
                    ContractUtils: contractUtilsInstance.address,
                    ERC721Utils: ERC721UtilsInstance.address
                }
            });
            await expect(betCertificateContractFactory.deploy(name, symbol, "", bettingContractInstance.address)).to.be.revertedWith("Invalid_parameter_tokenURI");
        });

        it("Should not deploy if betting contract is empty", async function () {
            const betCertificateContractFactory = await ethers.getContractFactory(betCertificateContractPath, {
                signer: signer,
                libraries: {
                    ContractUtils: contractUtilsInstance.address,
                    ERC721Utils: ERC721UtilsInstance.address
                }
            });
            await expect(betCertificateContractFactory.deploy(name, symbol, tokenURI, ethers.constants.AddressZero)).to.be.revertedWith("Invalid_address");
        });

        it("Should not deploy if betting contract is not a contract", async function () {
            const betCertificateContractFactory = await ethers.getContractFactory(betCertificateContractPath, {
                signer: signer,
                libraries: {
                    ContractUtils: contractUtilsInstance.address,
                    ERC721Utils: ERC721UtilsInstance.address
                }
            });
            await expect(betCertificateContractFactory.deploy(name, symbol, tokenURI, signer.address)).to.be.revertedWith("Not_a_contract");
        });
    });

    describe("Minting tests", function () {

        it("Should not mint if sender is not the betting contract", async function () {
            await expect(betCertificateInstance.connect(signer).mint(signer.address, amount, betEpoch, betResult)).to.be.revertedWith("Not_the_owner");
        });

        it("Should not mint if receiver is not a valid address", async function () {
            await expect(betCertificateInstance.mint(ethers.constants.AddressZero, amount, betEpoch, betResult)).to.be.revertedWith("Invalid_address");
        });
    });

    describe("Approve tests", function () {
        it("Should not approve if operator is invalid", async function () {
            await expect(betCertificateInstance.setApprovalForAll(ethers.constants.AddressZero, true)).to.be.revertedWith("Invalid_Operator");
        });

        it("Should not approve if address is invalid", async function () {
            await expect(betCertificateInstance.approve(ethers.constants.AddressZero, 1)).to.be.revertedWith("Invalid_address");
        });

        it("Should not approve if token ID is invalid", async function () {
            await expect(betCertificateInstance.approve(signer.address, 0)).to.be.revertedWith("Invalid_tokenId");
        });
    });

    describe("Burn tests", function () {

        it("Should not burn if token ID is invalid", async function () {
            await expect(betCertificateInstance.burn(0)).to.be.revertedWith("Invalid_tokenId");
        });
    });

    describe("Transfer tests", function () {

        it("Should not transfer if receiver is invalid", async function () {
            await expect(betCertificateInstance.safeTransfer(ethers.constants.AddressZero, 1)).to.be.revertedWith("Invalid_address");
        });

        it("Should not transfer if spender address is invalid", async function () {
            await expect(betCertificateInstance.safeTransferFrom(ethers.constants.AddressZero, signer.address, 1)).to.be.revertedWith("Invalid_address");
        });

        it("Should not transfer if receiver address is invalid", async function () {
            await expect(betCertificateInstance.safeTransferFrom(signer.address, ethers.constants.AddressZero, 1)).to.be.revertedWith("Invalid_address");
        });
    });

    describe("Invalid Getters tests", function () {

        it("Should not return balance if address is invalid", async function () {
            await expect(betCertificateInstance.balanceOf(ethers.constants.AddressZero)).to.be.revertedWith("Invalid_address");
        });

        it("Should not return owner if token ID is invalid", async function () {
            await expect(betCertificateInstance.ownerOf(0)).to.be.revertedWith("Invalid_tokenId");
        });

        it("Should not return allowance if token ID is invalid", async function () {
            await expect(betCertificateInstance.allowance(0)).to.be.revertedWith("Invalid_tokenId");
        });

        it("Should not return operator if address is invalid", async function () {
            await expect(betCertificateInstance.operator(ethers.constants.AddressZero, signer.address)).to.be.revertedWith("Invalid_address");
        });

        it("Should not return operator if operator is invalid", async function () {
            await expect(betCertificateInstance.operator(signer.address, ethers.constants.AddressZero)).to.be.revertedWith("Invalid_address");
        });

        it("Should not return bet metadata if token ID is invalid", async function () {
            await expect(betCertificateInstance.getBetMetadata(0)).to.be.revertedWith("Invalid_tokenId");
        });

        it("Should return the right betting contract", async function () {
            expect(await betCertificateInstance.bettingContract()).to.equal(bettingContractInstance.address);
        });            
    });

});
