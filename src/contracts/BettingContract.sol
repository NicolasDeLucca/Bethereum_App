//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../interfaces/IBettingContract.sol";
import "../utils/ContractUtils.sol";

contract BettingContract is IBettingContract {
    using ContractUtils for address;

    uint256 constant public MAX_COMISSION_FEE = 700;
    uint256 constant public ONE_HUNDRED_PERCENT = 10_000;

    uint256 public override minBetAmount;
    uint256 public override totalFee;
    uint256 public override bountyToCollect;
    uint256 public override commissionFee;

    IGaleon public override galeonContract;
    IWildcard public override wildcardContract;
    IBetCertificate public override betCertificateContract;
    IOwnersContract public override ownersContract;

    mapping(uint256 _epochStartTimeStamp => Epoch _epochMetadata) public epoch;

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid_address");
        _;
    }

    constructor(uint256 _commissionFee, address _ownersContract) {
        require(ContractUtils.isContract(_ownersContract), "Not_a_contract");
        require(
            _commissionFee > 0 && _commissionFee <= MAX_COMISSION_FEE,
            "Invalid_commissionFee"
        );

        commissionFee = _commissionFee;
        ownersContract = IOwnersContract(_ownersContract);
        totalFee = 0;
        bountyToCollect = 0;
    }

    function getBetEpoch() external view override returns (uint256) {
        return ((block.timestamp / 1 days) * 1 days) + 2 days;
    }

    function bet(uint256 _amount, EpochResult _betResult) external override {
        require(_amount >= minBetAmount, "Invalid_amount");
        require(galeonContract.balanceOf(msg.sender) >= _amount, "Insufficient_balance");
        require(galeonContract.allowance(msg.sender,address(this)) >= _amount, "Insufficient_allowance");

        galeonContract.transferFrom(msg.sender,address(this),_amount);
        
        uint256 _betId = betCertificateContract.mint(msg.sender, _amount, this.getBetEpoch(), _betResult);
        uint256 fee = _amount * commissionFee / ONE_HUNDRED_PERCENT;
        totalFee += fee;
        epoch[this.getBetEpoch()].bounty += _amount - fee;
        epoch[this.getBetEpoch()].fee += fee;
        epoch[this.getBetEpoch()].totalAmount[_betResult] += _amount - fee;
        
        emit NewBet(_betId, msg.sender, _amount);
    }

    function betWithWildcard(
        uint256 _amount,
        EpochResult _betResult,
        uint256 _wildcardId
    ) external override {
        require(_amount >= minBetAmount, "Invalid_amount");
        require(
            galeonContract.balanceOf(msg.sender) >= _amount,
            "Insufficient_balance"
        );
        require(
            galeonContract.allowance(msg.sender, address(this)) >= _amount,
            "Insufficient_allowance"
        );
        require(
            _wildcardId <= wildcardContract.currentTokenID(),
            "Invalid_wildcardId"
        );
        require(
            wildcardContract.ownerOf(_wildcardId) == msg.sender,
            "Not_the_owner_of_the_wildcard"
        );

        galeonContract.transferFrom(msg.sender, address(this), _amount);

        uint256 _betId;

        if (wildcardContract.getMetadata(_wildcardId).wildcardType == WildcardType.DayBefore) {
            _betId = betCertificateContract.mint(msg.sender, _amount, this.getBetEpoch() - 1 days, _betResult);
            uint256 fee = _amount * commissionFee / ONE_HUNDRED_PERCENT;
            totalFee += fee;
            epoch[this.getBetEpoch() - 1 days].bounty += _amount - fee;
            epoch[this.getBetEpoch() - 1 days].fee += fee;
            epoch[this.getBetEpoch() - 1 days].totalAmount[_betResult] += _amount - fee;

            emit NewBet(_betId, msg.sender, _amount);
        } else {
            _betId = betCertificateContract.mint(msg.sender, _amount * 2, this.getBetEpoch(), _betResult);
            uint256 fee = _amount * commissionFee / ONE_HUNDRED_PERCENT;
            totalFee += fee;
            epoch[this.getBetEpoch()].bounty += _amount * 2 - fee;
            epoch[this.getBetEpoch()].fee += fee;
            epoch[this.getBetEpoch()].totalAmount[_betResult] += _amount * 2 - fee;

            emit NewBet(_betId, msg.sender, (_amount * 2));
        }

        wildcardContract.burn(_wildcardId);
    }

    function redeemWinBetCertificate(uint256 _betId) external override {
        BetMetadata memory _betMetadata = betCertificateContract.getBetMetadata(_betId);
        require(betCertificateContract.ownerOf(_betId) == msg.sender, "Not_the_owner");
        require(_betMetadata.epoch == (this.getBetEpoch() - 2 days), "Bet_not_resolved");
        require(epoch[_betMetadata.epoch].result == _betMetadata.result, "Your_bet_is_not_a_winner");
        require(galeonContract.balanceOf(address(this)) >= (_betMetadata.amount), "Insufficient_balance");

        uint256 proportion = _betMetadata.amount / epoch[_betMetadata.epoch].totalAmount[_betMetadata.result] * 100;
        uint256 amount = epoch[_betMetadata.epoch].bounty * proportion;
        
        galeonContract.transfer(msg.sender,amount);
        bountyToCollect = bountyToCollect - amount;
        betCertificateContract.burn(_betId);
    }

    function redeemLostBetCertificate(
        uint256 _betId,
        WildcardType _wildcardType
    ) external override {
        require(
            betCertificateContract.ownerOf(_betId) == msg.sender,
            "Not_the_owner"
        );
        require(
            betCertificateContract.getBetMetadata(_betId).epoch <=
                ((block.timestamp / 1 days) * 1 days),
            "Bet_not_resolved"
        );
        require(
            epoch[betCertificateContract.getBetMetadata(_betId).epoch].result !=
                betCertificateContract.getBetMetadata(_betId).result,
            "Your_bet_is_not_a_loser"
        );
        require(
            galeonContract.balanceOf(msg.sender) >=
                wildcardContract.mintPrice(_wildcardType),
            "Insufficient_balance_to_pay_wildcard"
        );
        require(
            galeonContract.allowance(msg.sender, address(this)) >=
                wildcardContract.mintPrice(_wildcardType),
            "Insufficient_allowance"
        );

        galeonContract.transferFrom(
            msg.sender,
            address(this),
            wildcardContract.mintPrice(_wildcardType)
        );
        wildcardContract.mint(msg.sender, _betId, _wildcardType);
        betCertificateContract.burn(_betId);
    }

    function setTokenContracts(
        address _galeonContract,
        address _betCertificateContract,
        address _wildcardContract
    )
        external
        override
        validAddress(_galeonContract)
        validAddress(_betCertificateContract)
        validAddress(_wildcardContract)
    {
        require(
            ContractUtils.isContract(_galeonContract),
            "Invalid_galeonContract"
        );
        require(
            ContractUtils.isContract(_betCertificateContract),
            "Invalid_betCertificateContract"
        );
        require(
            ContractUtils.isContract(_wildcardContract),
            "Invalid_wildcardContract"
        );

        galeonContract = IGaleon(_galeonContract);
        betCertificateContract = IBetCertificate(_betCertificateContract);
        wildcardContract = IWildcard(_wildcardContract);
    }

    function setMinBetAmount(uint256 _minBetAmount) external override {
        require(_minBetAmount > 0, "Invalid_minBetAmount");

        minBetAmount = _minBetAmount;
    }

    function setEpochResult(
        uint256 _epoch,
        EpochResult _result
    ) external override {
        require(_epoch < this.getBetEpoch(), "Invalid_betEpoch");
        require(
            epoch[_epoch].result == EpochResult.Pending,
            "Result_already_set"
        );

        epoch[_epoch].result = _result;
        totalFee = epoch[_epoch].fee;
        bountyToCollect = epoch[_epoch].bounty;
    }

    function setMintPrice(
        WildcardType _WildcardType,
        uint256 _mintprice
    ) external override {
        require(
            _WildcardType == WildcardType.DayBefore ||
                _WildcardType == WildcardType.doubleSpending,
            "Invalid_WildcardType"
        );
        require(_mintprice > 0, "Invalid_mintprice");

        wildcardContract.setMintPrice(_WildcardType, _mintprice);
    }

    function setCommissionFee(uint256 _commissionFee) external override {
        require(
            _commissionFee > 0 && _commissionFee <= MAX_COMISSION_FEE,
            "Invalid_commissionFee"
        );

        commissionFee = _commissionFee;
    }

    function claimGaleons() external override returns (uint256) {
        require(msg.sender == address(ownersContract), "Not_authorized");
        require(totalFee > 0, "No_fees_to_claim");

        galeonContract.transferFrom(address(this), msg.sender, totalFee);
        uint256 retorno = totalFee;
        totalFee = 0;
        return retorno;
    }
}
