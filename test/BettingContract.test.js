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

const EpochResult = {
    Pending: 0,
    EqualOrGreater: 1,
    Smaller: 2
};

const ownersContractPath = 'src/contracts/OwnersContract.sol:OwnersContract';
const bettingContractPath = 'src/contracts/BettingContract.sol:BettingContract';
const galeonContractPath = 'src/contracts/Galeon.sol:Galeon';
const betCertificateContractPath = 'src/contracts/BetCertificate.sol:BetCertificate';
const wildcardContractPath = 'src/contracts/Wildcard.sol:Wildcard';
const contractUtilsPath = 'src/utils/ContractUtils.sol:ContractUtils';
const ERC721UtilsPath = 'src/utils/ERC721Utils.sol:ERC721Utils';

const zeroAddress = '0x0000000000000000000000000000000000000000';
const commissionFee = 500;
let ownersContractInstance;
let contractUtilsInstance;
let bettingContractInstance;
let galeonContractInstance;
let betCertificateContractInstance;
let wildcardContractInstance;
let ERC721UtilsInstance;

describe('BettingContract tests', () => {
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
        betCertificateContractInstance = await betCertificateContractFactory.deploy("BetCertificate", "BET", "tokenuri", bettingContractInstance.address);
        await betCertificateContractInstance.deployed();

        const wildcardContractFactory = await ethers.getContractFactory(wildcardContractPath, {
            signer: signer,
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        wildcardContractInstance = await wildcardContractFactory.deploy("Wildcard", "GAL", "tokenuri2", bettingContractInstance.address);
        await wildcardContractInstance.deployed();
        
        await bettingContractInstance.setTokenContracts(galeonContractInstance.address,betCertificateContractInstance.address,wildcardContractInstance.address);
        await ownersContractInstance.setGaleonContract(galeonContractInstance.address);
        await ownersContractInstance.setBettingContract(bettingContractInstance.address);
    });

    describe('Constructor tests', () => {
        it('Should fail to be constructed with error "Not_a_contract"', async () => {
            const testBettingContractFactory = await ethers.getContractFactory(bettingContractPath, {
                signer: signer,
                libraries: { ContractUtils: contractUtilsInstance.address }
            });
            await expect(testBettingContractFactory.deploy(commissionFee,zeroAddress)).to.be.revertedWith("Not_a_contract");
        });

        it('Should fail to be constructed with error "Invalid_commissionFee"', async () => {
            const testBettingContractFactory = await ethers.getContractFactory(bettingContractPath, {
                signer: signer,
                libraries: { ContractUtils: contractUtilsInstance.address }
            });
            await expect(testBettingContractFactory.deploy(0,ownersContractInstance.address)).to.be.revertedWith("Invalid_commissionFee");
            await expect(testBettingContractFactory.deploy(701,ownersContractInstance.address)).to.be.revertedWith("Invalid_commissionFee");
        });

        it('Should be constructed with correct data', async () => {
            let contractCommissionFee   = await bettingContractInstance.commissionFee();
            let ownersContractAddress   = await bettingContractInstance.ownersContract();
            let contractTotalFee        = await bettingContractInstance.totalFee();
            let bountyToCollect         = await bettingContractInstance.bountyToCollect();
            expect(contractCommissionFee).to.be.equals(commissionFee);
            expect(ownersContractAddress).to.be.equals(ownersContractInstance.address);
            expect(contractTotalFee).to.be.equals(0);
            expect(bountyToCollect).to.be.equals(0);
        });
    });

    describe('Various minor tests', () => {
        describe('setMintPrice tests', () => {
            it('Should fail with error "Invalid_WildcardType"', async () => {
                await expect(bettingContractInstance.setMintPrice(WildcardType.wrongType,100)).to.be.revertedWith("");
            });

            it('Should fail with error "Invalid_mintprice"', async () => {
                await expect(bettingContractInstance.setMintPrice(WildcardType.DayBefore,0)).to.be.revertedWith("Invalid_mintprice");
            });

            it('Should change the price of the correct wildcard type', async () => {
                await bettingContractInstance.setMintPrice(WildcardType.DayBefore,100);
                let price = await wildcardContractInstance.mintPrice(WildcardType.DayBefore);
                expect(price).to.be.equals(100);
            });
        });

        describe('setMinBetAmount tests', () => {
            it('Should fail with error "Invalid_minBetAmount"', async () => {
                await expect(bettingContractInstance.setMinBetAmount(0)).to.be.revertedWith("Invalid_minBetAmount");
            });

            it('Should change the minimum bet amount', async () => {
                await bettingContractInstance.setMinBetAmount(100);
                let minBetAmount = await bettingContractInstance.minBetAmount();
                expect(minBetAmount).to.be.equals(100);
            });
        });

        describe('setCommissionFee tests', () => {
            it('Should fail with error "Invalid_commissionFee"', async () => {
                await expect(bettingContractInstance.setCommissionFee(0)).to.be.revertedWith("Invalid_commissionFee");
                await expect(bettingContractInstance.setCommissionFee(701)).to.be.revertedWith("Invalid_commissionFee");
            });

            it('Should change the comission fee', async () => {
                await bettingContractInstance.setCommissionFee(30);
                let commissionFee = await bettingContractInstance.commissionFee();
                expect(commissionFee).to.be.equals(30);
            });
        });
    });


    describe('redeemWinBetCertificate tests', () => {
        it('Should fail with error "Not_the_owner"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            await expect(bettingContractInstance.redeemWinBetCertificate(1)).to.be.revertedWith("Not_the_owner");
        });

        it('Should fail with error "Bet_not_resolved"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            await expect(bettingContractInstance.connect(testAccount).redeemWinBetCertificate(1)).to.be.revertedWith("Bet_not_resolved");
        });

        it('Should fail with error "Your_bet_is_not_a_winner"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.Smaller);
            await expect(bettingContractInstance.connect(testAccount).redeemWinBetCertificate(1)).to.be.revertedWith("Your_bet_is_not_a_winner");
        });

        it('Should fail with error "Insufficient_balance"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.EqualOrGreater);
            await expect(bettingContractInstance.connect(testAccount).redeemWinBetCertificate(1)).to.be.revertedWith("Insufficient_balance");
        });

        it('Should redeem a won bet certificate succesfully', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let bettingContractBalance = await galeonContractInstance.balanceOf(bettingContractInstance.address);
            expect(bettingContractBalance).to.be.equals(100); 
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.EqualOrGreater);
            let betMetaData = await betCertificateContractInstance.getBetMetadata(1);
            expect(betMetaData.amount).to.be.equals(100);
            expect(betMetaData.epoch).to.be.equals(epoch);
            expect(betMetaData.result).to.be.equals(EpochResult.EqualOrGreater);
            let epochMetadata = await bettingContractInstance.epoch(epoch);
            expect(epochMetadata.bounty).to.be.equals(95);
            await bettingContractInstance.connect(testAccount).redeemWinBetCertificate(1);
            let bountyToCollect = await bettingContractInstance.bountyToCollect();
            expect(bountyToCollect).to.be.equals(0);
        });
    });

    describe('redeemLostBetCertificate tests', () => {
        it('Should fail with error "Not_the_owner"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            await expect(bettingContractInstance.redeemLostBetCertificate(1,WildcardType.DayBefore)).to.be.revertedWith("Not_the_owner");
        });
   
        it('Should fail with error "Bet_not_resolved"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            await expect(bettingContractInstance.connect(testAccount).redeemLostBetCertificate(1,WildcardType.DayBefore)).to.be.revertedWith("Bet_not_resolved");
        });

        it('Should fail with error "Your_bet_is_not_a_loser"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.EqualOrGreater);
            await expect(bettingContractInstance.connect(testAccount).redeemLostBetCertificate(1,WildcardType.DayBefore)).to.be.revertedWith("Your_bet_is_not_a_loser");
        });

        it('Should fail with error "Insufficient_balance_to_pay_wildcard"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.Smaller);
            await bettingContractInstance.setMintPrice(WildcardType.DayBefore,1000);
            await expect(bettingContractInstance.connect(testAccount).redeemLostBetCertificate(1,WildcardType.DayBefore)).to.be.revertedWith("Insufficient_balance_to_pay_wildcard");
        });

        it('Should fail with error "Insufficient_allowance"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.Smaller);
            await bettingContractInstance.setMintPrice(WildcardType.DayBefore,1000);
            await galeonContractInstance.connect(testAccount).mint(1000, { value: 1000 });
            await expect(bettingContractInstance.connect(testAccount).redeemLostBetCertificate(1,WildcardType.DayBefore)).to.be.revertedWith("Insufficient_allowance");
        });

        it('Should redeem a lost bet certificate succesfully', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.Smaller);
            await bettingContractInstance.setMintPrice(WildcardType.DayBefore,1000);
            await galeonContractInstance.connect(testAccount).mint(1000, { value: 1000 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,1000);
            await bettingContractInstance.connect(testAccount).redeemLostBetCertificate(1,WildcardType.DayBefore);
            let wildcardId = wildcardContractInstance.currentTokenID();
            let owner = await wildcardContractInstance.ownerOf(wildcardId);
            let wildcardMetaData = await wildcardContractInstance.getMetadata(wildcardId);
            expect(owner).to.be.equals(testAccount.address);
            expect(wildcardMetaData.betId).to.be.equals(1);
            expect(wildcardMetaData.wildcardType).to.be.equals(WildcardType.DayBefore);
        });
    });

    describe('bet tests', () => {
        it('Should fail with error "Invalid_amount"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await expect(bettingContractInstance.bet(99,EpochResult.EqualOrGreater)).to.be.revertedWith("Invalid_amount");
        });

        it('Should fail with error "Insufficient_balance"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await expect(bettingContractInstance.bet(100,EpochResult.EqualOrGreater)).to.be.revertedWith("Insufficient_balance");
        });

        it('Should fail with error "Insufficient_allowance"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.mint(100, { value: 100 });
            await expect(bettingContractInstance.bet(100,EpochResult.EqualOrGreater)).to.be.revertedWith("Insufficient_allowance");
        });

        it('Should make a bet', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await expect(bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater)).to.emit(bettingContractInstance,"NewBet").withArgs(1,testAccount.address,100);
            let totalFee = await bettingContractInstance.totalFee();
            expect(totalFee).to.be.equals(5);
            let epochMetaData = await bettingContractInstance.epoch(await bettingContractInstance.getBetEpoch());
            expect(epochMetaData.bounty).to.be.equals(95);
            expect(epochMetaData.fee).to.be.equals(5);
            let tokenId = await betCertificateContractInstance.currentTokenID();
            let totalSupply = await betCertificateContractInstance.totalSupply();
            expect(tokenId).to.be.equals(1);
            expect(totalSupply).to.be.equals(1);
            let betMetaData = await betCertificateContractInstance.getBetMetadata(1);
            expect(betMetaData.result).to.be.equals(EpochResult.EqualOrGreater);
            expect(betMetaData.amount).to.be.equals(100);
            expect(betMetaData.epoch).to.be.equals(await bettingContractInstance.getBetEpoch());
        });
    });

    describe('betWithWildcard tests', () => {
        it('Should fail with error "Invalid_amount"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await expect(bettingContractInstance.betWithWildcard(99,EpochResult.EqualOrGreater,1)).to.be.revertedWith("Invalid_amount");
        });

        it('Should fail with error "Insufficient_balance"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await expect(bettingContractInstance.betWithWildcard(100,EpochResult.EqualOrGreater,1)).to.be.revertedWith("Insufficient_balance");
        });

        it('Should fail with error "Insufficient_allowance"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.mint(100, { value: 100 });
            await expect(bettingContractInstance.betWithWildcard(100,EpochResult.EqualOrGreater,1)).to.be.revertedWith("Insufficient_allowance");
        });

        it('Should fail with error "Invalid_wildcardId"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await expect(bettingContractInstance.connect(testAccount).betWithWildcard(100,EpochResult.EqualOrGreater,1)).to.be.revertedWith("Invalid_wildcardId");
        });

        it('Should fail with error "Not_the_owner_of_the_wildcard"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.Smaller);
            await bettingContractInstance.setMintPrice(WildcardType.DayBefore,1000);
            await galeonContractInstance.connect(testAccount).mint(1000, { value: 1000 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,1000);
            await bettingContractInstance.connect(testAccount).redeemLostBetCertificate(1,WildcardType.DayBefore);
            let wildcardId = wildcardContractInstance.currentTokenID();
            await galeonContractInstance.mint(100, { value: 100 });
            await galeonContractInstance.approve(bettingContractInstance.address,100);
            await expect(bettingContractInstance.betWithWildcard(100,EpochResult.EqualOrGreater,wildcardId)).to.be.revertedWith("Not_the_owner_of_the_wildcard");
        });

        it('Should make a bet with a DayBefore type wildcard', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.Smaller);
            await bettingContractInstance.setMintPrice(WildcardType.DayBefore,1000);
            await galeonContractInstance.connect(testAccount).mint(1000, { value: 1000 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,1000);
            await bettingContractInstance.connect(testAccount).redeemLostBetCertificate(1,WildcardType.DayBefore);
            let wildcardId = wildcardContractInstance.currentTokenID();
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await expect(bettingContractInstance.connect(testAccount).betWithWildcard(100,EpochResult.EqualOrGreater,wildcardId)).to.emit(bettingContractInstance,"NewBet").withArgs(2,testAccount.address,100);
            let totalFee = await bettingContractInstance.totalFee();
            expect(totalFee).to.be.equals(10);
            let epochMetaData = await bettingContractInstance.epoch(await bettingContractInstance.getBetEpoch() - 86400);
            expect(epochMetaData.bounty).to.be.equals(95);
            expect(epochMetaData.fee).to.be.equals(5);
        });

        it('Should make a bet with a doubleSpending type wildcard', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.Smaller);
            await bettingContractInstance.setMintPrice(WildcardType.doubleSpending,1000);
            await galeonContractInstance.connect(testAccount).mint(1000, { value: 1000 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,1000);
            await bettingContractInstance.connect(testAccount).redeemLostBetCertificate(1,WildcardType.doubleSpending);
            let wildcardId = wildcardContractInstance.currentTokenID();
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            let amountWildcards = await wildcardContractInstance.totalSupply();
            await expect(bettingContractInstance.connect(testAccount).betWithWildcard(100,EpochResult.EqualOrGreater,wildcardId)).to.emit(bettingContractInstance,"NewBet").withArgs(2,testAccount.address,200);
            expect(await wildcardContractInstance.totalSupply()).to.be.equals(amountWildcards - 1);
            let totalFee = await bettingContractInstance.totalFee();
            expect(totalFee).to.be.equals(10);
            let epochMetaData = await bettingContractInstance.epoch(await bettingContractInstance.getBetEpoch());
            expect(epochMetaData.bounty).to.be.equals(195);
            expect(epochMetaData.fee).to.be.equals(5);
        });
    });

    describe('claimGaleons tests', () => {
        it('Should fail with error "Not_authorized"', async () => {
            await expect(bettingContractInstance.claimGaleons()).to.be.revertedWith("Not_authorized");
        });

        it('Should fail with error "No_fees_to_claim"', async () => {
            await ownersContractInstance.addOwner(testAccount.address);
            await expect(ownersContractInstance.connect(testAccount).claimGaleons()).to.be.revertedWith("No_fees_to_claim");
        });
    });

    describe('setEpochResult tests', () => {
        it('Should fail with error "Invalid_betEpoch"', async () => {
            await expect(bettingContractInstance.setEpochResult(bettingContractInstance.getBetEpoch(),EpochResult.EqualOrGreater)).to.be.revertedWith("Invalid_betEpoch");
        });

        it('Should fail with error "Result_already_set"', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.EqualOrGreater);
            await expect(bettingContractInstance.setEpochResult(epoch,EpochResult.EqualOrGreater)).to.be.revertedWith("Result_already_set");
        });

        it('Should set the result succesfully', async () => {
            await bettingContractInstance.setMinBetAmount(100);
            await galeonContractInstance.setMintPrice(1);
            await galeonContractInstance.connect(testAccount).mint(100, { value: 100 });
            await galeonContractInstance.connect(testAccount).approve(bettingContractInstance.address,100);
            await bettingContractInstance.connect(testAccount).bet(100,EpochResult.EqualOrGreater);
            let epoch = await bettingContractInstance.getBetEpoch();
            await hre.ethers.provider.send('evm_increaseTime', [2 * 24 * 60 * 60]);
            await bettingContractInstance.setEpochResult(epoch,EpochResult.EqualOrGreater);
            let epochMetaData = await bettingContractInstance.epoch(epoch);
            let totalFee = await bettingContractInstance.totalFee();
            let bountyToCollect = await bettingContractInstance.bountyToCollect();
            expect(epochMetaData.result).to.be.equals(EpochResult.EqualOrGreater);
            expect(totalFee).to.be.equals(5);
            expect(bountyToCollect).to.be.equals(95);
        });
    });
});