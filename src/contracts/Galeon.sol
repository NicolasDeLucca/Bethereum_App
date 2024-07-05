//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../interfaces/IGaleon.sol";
import "../interfaces/IOwnersContract.sol";
import "../utils/ContractUtils.sol";

contract Galeon is IGaleon {
    using ContractUtils for address;

    uint256 public constant MAX_WITHDRAW_FEE = 200;
    uint256 public constant ONE_HUNDRED_PERCENT = 10_000;

    uint256 private _decimals = 18;
    uint256 private _totalSupply;
    uint256 private _mintPrice;
    uint256 private _withdrawFee;
    uint256 private _withdrawFeesAmount;

    string private _name;
    string private _symbol;
    address private _ownersContract;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    modifier onlyCallableByOwnersContract() {
        require(msg.sender == _ownersContract, "Not_authorized");
        _;
    }

    modifier onlyOwnersAllowed(address owner) {
        IOwnersContract ownersContract = IOwnersContract(_ownersContract);
        require(ownersContract.isOwner(owner), "Not_authorized");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid_address");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        address ownersContract_
    ) {
        require(ownersContract_ != address(0), "Invalid_address");
        require(ownersContract_.isContract(), "Not_a_contract");

        require(bytes(name_).length > 0, "Invalid_parameter_name");
        require(bytes(symbol_).length > 0, "Invalid_parameter_symbol");
        require(bytes(symbol_).length == 3, "Invalid_symbol");

        _name = name_;
        _symbol = symbol_;
        _ownersContract = ownersContract_;
    }

    function name() external view override returns (string memory) {
        return _name;
    }

    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    function decimals() external view override returns (uint256) {
        return _decimals;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) external view override returns (uint256) {
        return _balances[owner];
    }

    function allowance(
        address owner,
        address spender
    ) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function mintPrice() external view override returns (uint256) {
        return _mintPrice;
    }

    function withdrawFee() external view override returns (uint256) {
        return _withdrawFee;
    }

    function withdrawFeesAmount() external view override returns (uint256) {
        return _withdrawFeesAmount;
    }

    function transfer(
        address to,
        uint256 value
    ) external override validAddress(to) {
        require(to != msg.sender, "Invalid_recipient");
        require(value > 0, "Invalid_value");
        require(_balances[msg.sender] >= value, "Insufficient_balance");

        _balances[msg.sender] -= value;
        _balances[to] += value;

        emit Transfer(msg.sender, to, value);
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external override validAddress(from) validAddress(to) {
        require(to != from, "Invalid_recipient");
        require(value > 0, "Invalid_value");
        require(
            from == msg.sender || _allowances[from][msg.sender] >= value,
            "Insufficient_allowance"
        );
        require(_balances[from] >= value, "Insufficient_balance");

        _balances[from] -= value;
        _balances[to] += value;
        if (from != msg.sender) {
            _allowances[from][msg.sender] -= value;
        }

        emit Transfer(from, to, value);
    }

    function approve(
        address spender,
        uint256 value
    ) external override validAddress(spender) {
        require(_balances[msg.sender] >= value, "Insufficient_balance");

        _allowances[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
    }

    function mint(uint256 amount) external payable override {
        require(_mintPrice > 0, "Invalid_mintPrice");
        uint256 cost = _mintPrice * amount;
        require(msg.value >= cost, "Insufficient_value");

        _totalSupply += amount;
        _balances[msg.sender] += amount;

        emit Transfer(address(0), msg.sender, amount);

        uint256 refund = msg.value - cost;
        if (refund > 0) {
            bool success = sendEthers(msg.sender, refund);
            require(success, "Refund_failed");
        }
    }

    function redeem(uint256 amount) external override {
        uint256 balance = _balances[msg.sender];
        require(balance > 0, "Zero_balance");
        require(balance >= amount, "Insufficient_balance");

        uint256 redeemAmount = amount > 0 ? amount : balance;
        uint256 fee = (redeemAmount * _withdrawFee) / ONE_HUNDRED_PERCENT;

        _balances[msg.sender] -= redeemAmount;
        _totalSupply -= redeemAmount;
        _withdrawFeesAmount += fee * _mintPrice;

        uint256 redeemNetAmount = redeemAmount - fee;
        emit Transfer(msg.sender, address(0), redeemNetAmount);

        uint256 ethersToReedem = redeemNetAmount * _mintPrice;
        bool success = sendEthers(msg.sender, ethersToReedem);
        require(success, "Reedem_failed");
    }

    function setMintPrice(
        uint256 mintPrice_
    ) external override onlyOwnersAllowed(msg.sender) {
        require(mintPrice_ > 0, "Invalid_mintPrice");
        _mintPrice = mintPrice_;
    }

    function setWithdrawFee(
        uint256 fee
    ) external override onlyOwnersAllowed(msg.sender) {
        require(fee > 0 && fee <= MAX_WITHDRAW_FEE, "Invalid_fee");
        _withdrawFee = fee;
    }

    function withdrawFeeAmount()
        external
        override
        onlyCallableByOwnersContract
        returns (uint256 feeAmount)
    {
        require(_withdrawFeesAmount > 0, "No_fees_to_withdraw");
        require(
            address(this).balance >= _withdrawFeesAmount,
            "Insufficient_balance"
        );

        feeAmount = _withdrawFeesAmount;
        _withdrawFeesAmount = 0;

        bool success = sendEthers(_ownersContract, feeAmount);
        require(success, "Withdraw_failed");
    }

    function sendEthers(
        address to,
        uint256 ethersAmount
    ) private returns (bool success) {
        (success, ) = payable(to).call{value: ethersAmount}("");
    }
}
