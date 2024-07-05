const { ethers } = require('hardhat');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
chai.use(solidity);
const { expect } = chai;

const ownersContractPath = 'src/contracts/OwnersContract.sol:OwnersContract';
const bettingContractPath = 'src/contracts/BettingContract.sol:BettingContract';
const galeonContractPath = 'src/contracts/Galeon.sol:Galeon';
const contractUtilsPath = 'src/utils/ContractUtils.sol:ContractUtils';

const zeroAddress = '0x0000000000000000000000000000000000000000';
const oneEther = ethers.utils.parseEther('1');
let ownersContractInstance;
let contractUtilsInstance;
let bettingContractInstance;
let galeonContractInstance;

describe('OwnersContract tests', () => {
    beforeEach(async () => {
        [signer, account1] = await ethers.getSigners();
        provider = ethers.provider;

        const contractUtils = await ethers.getContractFactory(contractUtilsPath);
        contractUtilsInstance = await contractUtils.deploy();

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
        bettingContractInstance = await bettingContractFactory.deploy(650, ownersContractInstance.address);

        const galeonContractFactory = await ethers.getContractFactory(galeonContractPath, {
            signer: signer,
            libraries: { ContractUtils: contractUtilsInstance.address }
        });
        galeonContractInstance = await galeonContractFactory.deploy('Galeon', 'GAL', ownersContractInstance.address);

        await ownersContractInstance.deployed();
    });

    describe('Constructor tests', () => {
        it('Should be constructed with the sender as the first owner', async () => {
            let receivedAddress = await ownersContractInstance.ownersList(0);
            expect(receivedAddress).to.be.equals(signer.address);
        });

        it('Should be constructed with an owners count of 1', async () => {
            let receivedCount = await ownersContractInstance.ownersCount();
            expect(receivedCount).to.be.equals(1);
        });

        it('Should be constructed with correct metadata for the first owner', async () => {
            let receivedMetadata = await ownersContractInstance.getOwner(signer.address);
            expect(receivedMetadata.isOwner).to.be.equals(true);
            expect(receivedMetadata.ownerIndex).to.be.equals(0);
            expect(receivedMetadata.galeonsToClaim).to.be.equals(0);
            expect(receivedMetadata.ethToClaim).to.be.equals(0);
        });
    });

    describe('bettingContract getter tests', () => {
        it('Should return the zero address if the betting contract has not been set', async () => {
            let receivedAddress = await ownersContractInstance.bettingContract();
            expect(receivedAddress).to.be.equals(zeroAddress);
        });

        it('Should return the correct address if the betting contract has been set', async () => {
            await ownersContractInstance.setBettingContract(bettingContractInstance.address);
            let receivedAddress = await ownersContractInstance.bettingContract();
            expect(receivedAddress).to.be.equals(bettingContractInstance.address);
        });
    });

    describe('galeonContract getter tests', () => {
        it('Should return the zero address if the galeon contract has not been set', async () => {
            let receivedAddress = await ownersContractInstance.galeonContract();
            expect(receivedAddress).to.be.equals(zeroAddress);
        });

        it('Should return the correct address if the galeon contract has been set', async () => {
            await ownersContractInstance.setGaleonContract(galeonContractInstance.address);
            let receivedAddress = await ownersContractInstance.galeonContract();
            expect(receivedAddress).to.be.equals(galeonContractInstance.address);
        });
    });

    describe('ownersCount tests', () => {
        it('Should return the correct owners count after adding an owner', async () => {
            await ownersContractInstance.addOwner(account1.address);
            let receivedCount = await ownersContractInstance.ownersCount();
            expect(receivedCount).to.be.equals(2);
        });

        it('Should return the correct owners count after removing an owner', async () => {
            await ownersContractInstance.addOwner(account1.address);
            await ownersContractInstance.removeOwner(account1.address);
            let receivedCount = await ownersContractInstance.ownersCount();
            expect(receivedCount).to.be.equals(1);
        });
    });

    describe('ownersList tests', () => {
        it('Should return the correct address after adding an owner', async () => {
            await ownersContractInstance.addOwner(account1.address);
            let receivedAddress = await ownersContractInstance.ownersList(1);
            expect(receivedAddress).to.be.equals(account1.address);
        });

        it('Should return the correct address after removing an owner', async () => {
            await ownersContractInstance.addOwner(account1.address);
            await ownersContractInstance.removeOwner(account1.address);

            let receivedSignerAddress = await ownersContractInstance.ownersList(0);
            expect(receivedSignerAddress).to.be.equals(signer.address);

            let receivedAddress = await ownersContractInstance.ownersList(1);
            expect(receivedAddress).to.be.equals(zeroAddress);
        });
    });

    describe('getOwner tests', () => {
        it('Should return the correct metadata for the first owner', async () => {
            let receivedMetadata = await ownersContractInstance.getOwner(signer.address);
            expect(receivedMetadata.isOwner).to.be.equals(true);
            expect(receivedMetadata.ownerIndex).to.be.equals(0);
            expect(receivedMetadata.galeonsToClaim).to.be.equals(0);
            expect(receivedMetadata.ethToClaim).to.be.equals(0);
        });

        it('Should return the correct metadata for the second owner', async () => {
            await ownersContractInstance.addOwner(account1.address);
            let receivedMetadata = await ownersContractInstance.getOwner(account1.address);
            expect(receivedMetadata.isOwner).to.be.equals(true);
            expect(receivedMetadata.ownerIndex).to.be.equals(1);
            expect(receivedMetadata.galeonsToClaim).to.be.equals(0);
            expect(receivedMetadata.ethToClaim).to.be.equals(0);
        });
    });

    describe('isOwner tests', () => {
        it('Should return true for the first owner', async () => {
            let isOwner = await ownersContractInstance.isOwner(signer.address);
            expect(isOwner).to.be.equals(true);
        });

        it('Should return false for an address that is not an owner', async () => {
            let isOwner = await ownersContractInstance.isOwner(account1.address);
            expect(isOwner).to.be.equals(false);
        });
    });

    describe('addOwner tests', () => {
        it('Should add an owner correctly to the indexed list', async () => {
            await ownersContractInstance.addOwner(account1.address);
            let receivedAddress = await ownersContractInstance.ownersList(1);
            expect(receivedAddress).to.be.equals(account1.address);
        });

        it('Should add an owner with the correct metadata', async () => {
            await ownersContractInstance.addOwner(account1.address);
            let receivedMetadata = await ownersContractInstance.getOwner(account1.address);
            expect(receivedMetadata.isOwner).to.be.equals(true);
            expect(receivedMetadata.ownerIndex).to.be.equals(1);
            expect(receivedMetadata.galeonsToClaim).to.be.equals(0);
            expect(receivedMetadata.ethToClaim).to.be.equals(0);
        });
    });

    describe('removeOwner tests', () => {
        it('Should revert if the sender is not an owner', async () => { });

        it('Should revert if the owner to be removed is not an owner', async () => { });

        it('Should remove an owner correctly from the indexed list', async () => {
            await ownersContractInstance.addOwner(account1.address);
            await ownersContractInstance.removeOwner(account1.address);
            let receivedAddress = await ownersContractInstance.ownersList(1);
            expect(receivedAddress).to.be.equals(zeroAddress);
        });

        it('Should remove an owner that has no eth or galeons to claim', async () => {
            await ownersContractInstance.addOwner(account1.address);
            await ownersContractInstance.removeOwner(account1.address);
            let receivedMetadata = await ownersContractInstance.getOwner(account1.address);
            expect(receivedMetadata.isOwner).to.be.equals(false);
            expect(receivedMetadata.ownerIndex).to.be.equals(0);
            expect(receivedMetadata.galeonsToClaim).to.be.equals(0);
            expect(receivedMetadata.ethToClaim).to.be.equals(0);
        });

        it('Should set an owner that has eth to claim as a non owner', async () => {
            await ownersContractInstance.setGaleonContract(galeonContractInstance.address);
            await galeonContractInstance.setMintPrice(10);
            await galeonContractInstance.setWithdrawFee(10);
            await galeonContractInstance.connect(account1).mint(100, { value: 1000 });
            await galeonContractInstance.connect(account1).redeem(100);
            await ownersContractInstance.addOwner(account1.address);
            await ownersContractInstance.connect(account1).claimEth();
            await ownersContractInstance.removeOwner(account1.address);

            let receivedMetadata = await ownersContractInstance.getOwner(account1.address);
            expect(receivedMetadata.isOwner).to.be.equals(false);
            expect(receivedMetadata.ownerIndex).to.not.be.equals(0);
            expect(receivedMetadata.ethToClaim).to.not.be.equals(0);
        });
    });

    describe('setBettingContract tests', () => {
        it('Should revert if the sender is not an owner', async () => {
            await expect(ownersContractInstance.connect(account1).setBettingContract(bettingContractInstance.address)).to.be.revertedWith('Not_an_owner');
        });

        it('Should revert if the betting contract address is the zero address', async () => {
            await expect(ownersContractInstance.setBettingContract(zeroAddress)).to.be.revertedWith('Invalid_address');
        });

        it('Should revert if the given address is not a contract', async () => {
            await expect(ownersContractInstance.setBettingContract(account1.address)).to.be.revertedWith('Invalid_contract');
        });

        it('Should set the betting contract correctly', async () => {
            await ownersContractInstance.setBettingContract(bettingContractInstance.address);
            let receivedAddress = await ownersContractInstance.bettingContract();
            expect(receivedAddress).to.be.equals(bettingContractInstance.address);
        });
    });

    describe('setGaleonContract tests', () => {
        it('Should revert if the sender is not an owner', async () => {
            await expect(ownersContractInstance.connect(account1).setGaleonContract(galeonContractInstance.address)).to.be.revertedWith('Not_an_owner');
        });

        it('Should revert if the galeon contract address is the zero address', async () => {
            await expect(ownersContractInstance.setGaleonContract(zeroAddress)).to.be.revertedWith('Invalid_address');
        });

        it('Should revert if the given address is not a contract', async () => {
            await expect(ownersContractInstance.setGaleonContract(account1.address)).to.be.revertedWith('Invalid_contract');
        });

        it('Should set the galeon contract correctly', async () => {
            await ownersContractInstance.setGaleonContract(galeonContractInstance.address);
            let receivedAddress = await ownersContractInstance.galeonContract();
            expect(receivedAddress).to.be.equals(galeonContractInstance.address);
        });
    });

    describe('claimGaleons tests', () => {
        it('Should revert if the sender is not an owner', async () => {
            await expect(ownersContractInstance.connect(account1).claimGaleons()).to.be.revertedWith('Not_an_owner');
        });

        it('Should revert if the betting contract has not been set', async () => {
            await expect(ownersContractInstance.claimGaleons()).to.be.revertedWith('Betting_contract_not_set');
        });

        it('Should revert if the galeon contract has not been set', async () => {
            await ownersContractInstance.setBettingContract(bettingContractInstance.address);
            await expect(ownersContractInstance.claimGaleons()).to.be.revertedWith('Galeon_contract_not_set');
        });
    });

    describe('claimEth tests', () => {
        it('Should revert if the sender is not an owner', async () => {
            await expect(ownersContractInstance.connect(account1).claimEth()).to.be.revertedWith('Not_an_owner');
        });

        it('Should revert if the galeon contract has not been set', async () => {
            await expect(ownersContractInstance.claimEth()).to.be.revertedWith('Galeon_contract_not_set');
        });
    });

    describe('withdrawGaleons tests', () => {
        it('Should revert if the sender is not an owner', async () => {
            await expect(ownersContractInstance.connect(account1).withdrawGaleons(oneEther)).to.be.revertedWith('Not_an_owner');
        });

        it('Should revert if the sender has less galeons than the amount he is trying to withdraw', async () => {
            await expect(ownersContractInstance.withdrawGaleons(oneEther)).to.be.revertedWith('Insufficient_balance');
        });
    });

    describe('withdrawEth tests', () => {
        it('Should revert if the sender is not an owner', async () => {
            await expect(ownersContractInstance.connect(account1).withdrawEth(oneEther)).to.be.revertedWith('Not_an_owner');
        });

        it('Should revert if the sender has less ethers than the amount he is trying to withdraw', async () => {
            await expect(ownersContractInstance.withdrawEth(oneEther)).to.be.revertedWith('Insufficient_balance');
        });
    });
});