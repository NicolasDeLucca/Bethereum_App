const { ethers } = require('hardhat');
const chai = require('chai');
const { solidity } = require('ethereum-waffle');
chai.use(solidity);
const { expect } = chai;

const contractUtilsPath = 'src/utils/ContractUtils.sol:ContractUtils';
const ownersContractPath = 'src/contracts/OwnersContract.sol:OwnersContract';
const galeonContractPath = 'src/contracts/Galeon.sol:Galeon';

let GaleonFactory;

let ownersContractInstance;
let galeonInstance;
let contractUtilsInstance;

describe("Galeon tests", function () {

  beforeEach(async function () {
    [signer, signer1, signer2, signer3] = await ethers.getSigners();

    const ContractUtils = await ethers.getContractFactory(contractUtilsPath);
    contractUtilsInstance = await ContractUtils.deploy();

    const OwnersContractFactory = await ethers.getContractFactory(ownersContractPath, {
      signer: signer,
      libraries: {
        ContractUtils: contractUtilsInstance.address,
      }
    });

    GaleonFactory = await ethers.getContractFactory(galeonContractPath, {
      signer: signer,
      libraries: {
        ContractUtils: contractUtilsInstance.address,
      },
    });

    ownersContractInstance = await OwnersContractFactory.deploy();
    galeonInstance = await GaleonFactory.deploy("GaleonToken", "GLN", ownersContractInstance.address);

    await galeonInstance.deployed();
  });

  describe("Constructor tests", function () {
    let decimals = 18;
    let galeonName = "GaleonToken";
    let galeonSymbol = "GLN";

    it("Should set the right owner", async function () {
      expect(await galeonInstance.decimals()).to.equal(decimals);
    });

    it("Should set the right name", async function () {
      expect(await galeonInstance.name()).to.equal(galeonName);
    });

    it("Should set the right symbol", async function () {
      expect(await galeonInstance.symbol()).to.equal(galeonSymbol);
    });

    it("Should have zero total supply initially", async function () {
      expect(await galeonInstance.totalSupply()).to.equal(0);
    });

    it("Should not deploy if owners contract is zero address", async function () {
      await expect(GaleonFactory.deploy(galeonName, galeonSymbol, ethers.constants.AddressZero)).to.be.revertedWith("Invalid_address");
    });

    it("Should not deploy if owners contract is not a contract", async function () {
      await expect(GaleonFactory.deploy(galeonName, galeonSymbol, signer.address)).to.be.revertedWith("Not_a_contract");
    });

    it("Should not deploy if name is empty", async function () {
      await expect(GaleonFactory.deploy("", galeonSymbol, ownersContractInstance.address)).to.be.revertedWith("Invalid_parameter_name");
    });

    it("Should not deploy if symbol is empty", async function () {
      await expect(GaleonFactory.deploy(galeonName, "", ownersContractInstance.address)).to.be.revertedWith("Invalid_parameter_symbol");
    });

    it("Should not deploy if symbol is not three characters", async function () {
      await expect(GaleonFactory.deploy(galeonName, "GL", ownersContractInstance.address)).to.be.revertedWith("Invalid_symbol");
    });
  });

  describe("Withdraw Fees tests", function () {
    it("Should set withdraw fee correctly", async function () {
      await galeonInstance.setWithdrawFee(1);
      expect(await galeonInstance.withdrawFee()).to.equal(1);
    });

    it("Should not set withdraw fee if fee is not greater than zero", async function () {
      await expect(galeonInstance.setWithdrawFee(0)).to.be.revertedWith("Invalid_fee");
    });

    it("Should not set withdraw fee if fee is greater than maximum", async function () {
      maximum = 200;
      await expect(galeonInstance.setWithdrawFee(maximum + 1)).to.be.revertedWith("Invalid_fee");
    });
  });

  describe("Minting tests", function () {
    it("Should mint tokens correctly", async function () {
      await galeonInstance.setMintPrice(1);
      await galeonInstance.connect(signer1).mint(100, { value: ethers.utils.parseEther("100") });

      expect(await galeonInstance.totalSupply()).to.equal(100);
      expect(await galeonInstance.balanceOf(signer1.address)).to.equal(100);
    });

    it("Should not mint tokens if mint price is not set", async function () {
      await expect(galeonInstance.connect(signer1).mint(100)).to.be.revertedWith("Invalid_mintPrice");
    });

    it("Should not mint tokens if value is insufficient", async function () {
      await galeonInstance.setMintPrice(ethers.utils.parseEther("1"));
      await expect(galeonInstance.connect(signer1).mint(100, { value: ethers.utils.parseEther("50") })).to.be.revertedWith("Insufficient_value");
    });

    it("Should not mint tokens if mint price is not greater than zero", async function () {
      await expect(galeonInstance.setMintPrice(0)).to.be.revertedWith("Invalid_mintPrice");
    });
  });

  describe("Transfer tests", function () {
    it("Should transfer tokens correctly", async function () {
      await galeonInstance.setMintPrice(1);
      await galeonInstance.connect(signer1).mint(100, { value: ethers.utils.parseEther("100") });

      await galeonInstance.connect(signer1).transfer(signer2.address, 50);

      expect(await galeonInstance.balanceOf(signer1.address)).to.equal(50);
      expect(await galeonInstance.balanceOf(signer2.address)).to.equal(50);
    });

    it("Should not transfer tokens if value is zero", async function () {
      await expect(galeonInstance.connect(signer1).transfer(signer2.address, 0)).to.be.revertedWith("Invalid_value");
    });

    it("Should not transfer tokens if balance is insufficient", async function () {
      await galeonInstance.setMintPrice(1);
      await galeonInstance.connect(signer1).mint(100, { value: ethers.utils.parseEther("100") });

      await expect(galeonInstance.connect(signer1).transfer(signer2.address, 101)).to.be.revertedWith("Insufficient_balance");
    });

    it("Should not transfer tokens if recipient is zero address", async function () {
      await expect(galeonInstance.connect(signer1).transfer(ethers.constants.AddressZero, 50)).to.be.revertedWith("Invalid_address");
    });

    it("Should not transfer tokens if recipient is sender", async function () {
      await expect(galeonInstance.connect(signer1).transfer(signer1.address, 50)).to.be.revertedWith("Invalid_recipient");
    });
  });

  describe("Transfer From tests", function () {
    it("Should transfer tokens correctly", async function () {
      await galeonInstance.setMintPrice(1);
      await galeonInstance.connect(signer2).mint(100, { value: ethers.utils.parseEther("100") });
      await galeonInstance.connect(signer2).approve(signer1.address, 50);

      await galeonInstance.connect(signer1).transferFrom(signer2.address, signer3.address, 50);

      expect(await galeonInstance.balanceOf(signer2.address)).to.equal(50);
      expect(await galeonInstance.balanceOf(signer3.address)).to.equal(50);
    });

    it("Should not transfer tokens if value is zero", async function () {
      await expect(galeonInstance.connect(signer1).transferFrom(signer1.address, signer2.address, 0)).to.be.revertedWith("Invalid_value");
    });

    it("Should not transfer tokens if balance is insufficient", async function () {
      await galeonInstance.setMintPrice(1);
      await galeonInstance.connect(signer2).mint(110, { value: ethers.utils.parseEther("110") });
      await galeonInstance.connect(signer2).approve(signer1.address, 100);
      await galeonInstance.connect(signer2).approve(signer3.address, 100);
      await galeonInstance.connect(signer3).transferFrom(signer2.address, signer1.address, 20);

      await expect(galeonInstance.connect(signer1).transferFrom(signer2.address, signer3.address, 100)).to.be.revertedWith("Insufficient_balance");
    });

    it("Should not transfer tokens if recipient is zero address", async function () {
      await expect(galeonInstance.connect(signer1).transferFrom(signer1.address, ethers.constants.AddressZero, 50)).to.be.revertedWith("Invalid_address");
    });

    it("Should not transfer tokens if recipient is sender", async function () {
      await expect(galeonInstance.connect(signer1).transferFrom(signer1.address, signer1.address, 50)).to.be.revertedWith("Invalid_recipient");
    });
  });

  describe("Approve tests", function () {
    it("Should approve tokens correctly", async function () {
      await galeonInstance.setMintPrice(1);
      await galeonInstance.connect(signer1).mint(100, { value: ethers.utils.parseEther("100") });

      await galeonInstance.connect(signer1).approve(signer2.address, 50);

      expect(await galeonInstance.allowance(signer1.address, signer2.address)).to.equal(50);
    });

    it("Should not approve tokens if balance is insufficient", async function () {
      await expect(galeonInstance.connect(signer1).approve(signer2.address, 101)).to.be.revertedWith("Insufficient_balance");
    });

    it("Should not approve tokens if spender is zero address", async function () {
      await expect(galeonInstance.connect(signer1).approve(ethers.constants.AddressZero, 50)).to.be.revertedWith("Invalid_address");
    });
  });

  describe("Redeem tests", function () {
    it("Should redeem tokens correctly", async function () {
      await galeonInstance.setMintPrice(1);
      await galeonInstance.connect(signer1).mint(100, { value: ethers.utils.parseEther("100") });

      await galeonInstance.connect(signer1).redeem(50);

      expect(await galeonInstance.balanceOf(signer1.address)).to.equal(50);
      expect(await galeonInstance.totalSupply()).to.equal(50);
    });

    it("Should not redeem tokens if balance is zero", async function () {
      await expect(galeonInstance.connect(signer1).redeem(50)).to.be.revertedWith("Zero_balance");
    });

    it("Should not redeem tokens if balance is insufficient", async function () {
      await galeonInstance.setMintPrice(1);
      await galeonInstance.connect(signer1).mint(100, { value: ethers.utils.parseEther("100") });

      await expect(galeonInstance.connect(signer1).redeem(101)).to.be.revertedWith("Insufficient_balance");
    });
  });
});
