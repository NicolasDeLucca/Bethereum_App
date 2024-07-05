// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../interfaces/IGaleon.sol";
import "../interfaces/IBettingContract.sol";
import "../interfaces/IOwnersContract.sol";
import "../utils/ContractUtils.sol";

contract OwnersContract is IOwnersContract {
    using ContractUtils for address;

    address public override bettingContract;
    address public override galeonContract;
    uint256 public override ownersCount;

    mapping(uint256 => address) private _owners;
    mapping(address => Owner) private _ownersMetadata;

    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid_address");
        _;
    }

    modifier contractAddress(address _address) {
        require(_address.isContract(), "Invalid_contract");
        _;
    }

    modifier validTokenId(uint256 _tokenId) {
        require(_tokenId > 0, "Invalid_tokenId");
        _;
    }

    modifier onlyBettingContract() {
        require(msg.sender == bettingContract, "Not_authorized");
        _;
    }

    constructor() {
        ownersCount = 1;
        _owners[0] = msg.sender;
        _ownersMetadata[msg.sender] = Owner(true, 0, 0, 0);
    }

    receive() external payable {}

    function ownersList(
        uint256 _ownerIndex
    ) external view override returns (address _ownerAddress) {
        _ownerAddress = _owners[_ownerIndex];
    }

    function getOwner(
        address _owner
    ) external view override returns (Owner memory _ownerMetadata) {
        _ownerMetadata = _ownersMetadata[_owner];
    }

    function isOwner(address _owner) external view override returns (bool) {
        return _ownersMetadata[_owner].isOwner;
    }

    function addOwner(address _owner) external validAddress(_owner) {
        require(_ownersMetadata[msg.sender].isOwner, "Not_an_owner");
        require(!_ownersMetadata[_owner].isOwner, "Already_an_owner");

        for (uint256 i = 0; i < ownersCount; i++) {
            _ownersMetadata[_owners[i]].galeonsToClaim +=
                _ownersMetadata[_owners[i]].galeonsToClaim /
                ownersCount;
            _ownersMetadata[_owners[i]].ethToClaim +=
                _ownersMetadata[_owners[i]].ethToClaim /
                ownersCount;
        }

        _owners[ownersCount] = _owner;
        _ownersMetadata[_owner] = Owner(true, ownersCount, 0, 0);
        ownersCount++;
    }

    function removeOwner(address _owner) external validAddress(_owner) {
        require(
            _ownersMetadata[msg.sender].isOwner &&
                _ownersMetadata[_owner].isOwner,
            "Not_an_owner"
        );

        // Actualizar los saldos de Galeones y ETH a retirar de todos los owners antes de eliminar al owner
        for (uint256 i = 0; i < ownersCount; i++) {
            _ownersMetadata[_owners[i]].galeonsToClaim +=
                _ownersMetadata[_owners[i]].galeonsToClaim /
                ownersCount;
            _ownersMetadata[_owners[i]].ethToClaim +=
                _ownersMetadata[_owners[i]].ethToClaim /
                ownersCount;
        }

        if (
            _ownersMetadata[_owner].galeonsToClaim > 0 ||
            _ownersMetadata[_owner].ethToClaim > 0
        ) {
            _ownersMetadata[_owner].isOwner = false;
        } else {
            delete _owners[_ownersMetadata[_owner].ownerIndex];
            delete _ownersMetadata[_owner];
            ownersCount--;
        }
    }

    function setBettingContract(
        address _bettingContractAddress
    )
        external
        override
        validAddress(_bettingContractAddress)
        contractAddress(_bettingContractAddress)
    {
        require(_ownersMetadata[msg.sender].isOwner, "Not_an_owner");
        bettingContract = _bettingContractAddress;
    }

    function setGaleonContract(
        address _galeonContractAddress
    )
        external
        override
        validAddress(_galeonContractAddress)
        contractAddress(_galeonContractAddress)
    {
        require(_ownersMetadata[msg.sender].isOwner, "Not_an_owner");
        galeonContract = _galeonContractAddress;
    }

    function claimGaleons() external override {
        require(_ownersMetadata[msg.sender].isOwner, "Not_an_owner");
        require(bettingContract != address(0), "Betting_contract_not_set");
        require(galeonContract != address(0), "Galeon_contract_not_set");

        uint256 balanceBefore = IGaleon(galeonContract).balanceOf(
            address(this)
        );
        uint256 claimedFees = IBettingContract(bettingContract).claimGaleons();
        uint256 balanceAfter = IGaleon(galeonContract).balanceOf(address(this));

        require(
            balanceAfter == balanceBefore + claimedFees,
            "Invalid_balance_after_claim"
        );

        for (uint256 i = 0; i < ownersCount; i++) {
            _ownersMetadata[_owners[i]].galeonsToClaim +=
                claimedFees /
                ownersCount;
        }
    }

    function claimEth() external override {
        require(_ownersMetadata[msg.sender].isOwner, "Not_an_owner");
        require(galeonContract != address(0), "Galeon_contract_not_set");

        uint256 balanceBefore = address(this).balance;
        uint256 withdrawnFees = IGaleon(galeonContract).withdrawFeeAmount();
        uint256 balanceAfter = address(this).balance;

        require(
            balanceAfter == balanceBefore + withdrawnFees,
            "Invalid_balance_after_claim"
        );

        for (uint256 i = 0; i < ownersCount; i++) {
            _ownersMetadata[_owners[i]].ethToClaim +=
                withdrawnFees /
                ownersCount;
        }
    }

    function withdrawGaleons(
        uint256 _amount
    ) external override validTokenId(_amount) {
        require(_ownersMetadata[msg.sender].isOwner, "Not_an_owner");
        require(
            _ownersMetadata[msg.sender].galeonsToClaim >= _amount,
            "Insufficient_balance"
        );

        IGaleon(galeonContract).transfer(msg.sender, _amount);
        _ownersMetadata[msg.sender].galeonsToClaim -= _amount;
    }

    function withdrawEth(
        uint256 _amount
    ) external override validTokenId(_amount) {
        require(_ownersMetadata[msg.sender].isOwner, "Not_an_owner");
        require(
            _ownersMetadata[msg.sender].ethToClaim >= _amount,
            "Insufficient_balance"
        );

        payable(msg.sender).transfer(_amount);
        _ownersMetadata[msg.sender].ethToClaim -= _amount;
    }
}
