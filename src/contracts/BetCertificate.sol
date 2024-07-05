// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../interfaces/IBetCertificate.sol";
import "../interfaces/IERC721TokenReceiver.sol";
import "../utils/ERC721Utils.sol";
import "../utils/ContractUtils.sol";

contract BetCertificate is IBetCertificate {
    using ERC721Utils for address;
    using ContractUtils for address;

    string private _name;
    string private _symbol;
    string private _tokenURI;
    address private _bettingContract;
    uint256 private _totalSupply;
    uint256 private _currentTokenID;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    mapping(uint256 => BetMetadata) private _betMetadata;

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid_address");
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        require(tokenId > 0 && tokenId <= _currentTokenID, "Invalid_tokenId");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        string memory tokenURI_,
        address bettingContract_
    ) {
        require(bytes(name_).length > 0, "Invalid_parameter_name");
        require(bytes(symbol_).length == 3, "Invalid_symbol");
        require(bytes(tokenURI_).length > 0, "Invalid_parameter_tokenURI");
        require(bettingContract_ != address(0), "Invalid_address");
        require(bettingContract_.isContract(), "Not_a_contract");

        _name = name_;
        _symbol = symbol_;
        _tokenURI = tokenURI_;
        _bettingContract = bettingContract_;
    }

    function name() external view override returns (string memory) {
        return _name;
    }

    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    function tokenURI() external view override returns (string memory) {
        return _tokenURI;
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address owner) external view override 
        validAddress(owner) returns (uint256) {
            return _balances[owner];
    }

    function ownerOf(uint256 tokenId) external view override 
        validTokenId(tokenId) returns (address) {
            address owner = _owners[tokenId];
            require(owner != address(0), "Invalid_tokenId");
            return owner;
    }

    function allowance(uint256 tokenId) external view override 
        validTokenId(tokenId) returns (address) {
            return _tokenApprovals[tokenId];
    }

    function operator(address _owner, address _operator) external view override 
        validAddress(_owner) validAddress(_operator) returns (bool) {
            return _operatorApprovals[_owner][_operator];
    }

    function getBetMetadata(uint256 tokenId) external view override 
        validTokenId(tokenId) returns (BetMetadata memory) {
            return _betMetadata[tokenId];
    }

    function bettingContract() external view override returns (address) {
        return _bettingContract;
    }

    function safeTransfer(address to, uint256 tokenId) external override 
        validAddress(to) validTokenId(tokenId){
            require(_owners[tokenId] == msg.sender, "Not_the_owner");
            _safeTransfer(msg.sender, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external override 
        validAddress(from) validAddress(to) validTokenId(tokenId){
            require(
                msg.sender == from || _tokenApprovals[tokenId] == msg.sender || 
                _operatorApprovals[from][msg.sender],
                "Not_the_owner"
            );
            _safeTransfer(from, to, tokenId, "");
    }

    function approve(address approved, uint256 tokenId) external override 
        validAddress(approved) validTokenId(tokenId){
            address owner = _owners[tokenId];
            require(msg.sender == owner || _operatorApprovals[owner][msg.sender], "Not_the_owner");
            _tokenApprovals[tokenId] = approved;
            emit Approval(owner, approved, tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved) external override {
        require(_operator != address(0), "Invalid_Operator");

        _operatorApprovals[msg.sender][_operator] = _approved;
    }

    function mint(
        address to,
        uint256 amount,
        uint256 betEpoch,
        EpochResult betResult
    ) external override validAddress(to) returns (uint256) {
        require(msg.sender == _bettingContract, "Not_the_owner");
        require(amount > 0, "Invalid_mintPrice");
        require(ERC721Utils.isERC721TokenReceiver(to), "Invalid_contract");

        _currentTokenID++;
        uint256 newTokenID = _currentTokenID;
        _totalSupply++;

        _balances[to]++;
        _owners[newTokenID] = to;
        _betMetadata[newTokenID].amount = amount;
        _betMetadata[newTokenID].epoch = betEpoch;
        _betMetadata[newTokenID].result = betResult;
        
        emit Transfer(address(0), to, newTokenID);

        return newTokenID;
    }

    function burn(uint256 tokenId) external override 
        validTokenId(tokenId){
            require(msg.sender == _bettingContract, "Not_the_owner");
            address owner = _owners[tokenId];
            require(owner != address(0), "Invalid_tokenId");

            _totalSupply--;
            _balances[owner]--;
            delete _owners[tokenId];
            delete _betMetadata[tokenId];

            emit Transfer(owner, address(0), tokenId);
    }

    function currentTokenID() external view override returns (uint256) {
        return _currentTokenID;
    }

    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory _data) internal {
        _transfer(from, to, tokenId);
        if (to.isContract()) {
            require(to.isERC721TokenReceiver(), "Invalid_contract");
            bytes4 retval = IERC721TokenReceiver(to).onERC721Received(msg.sender, from, tokenId, _data);
            require(retval == IERC721TokenReceiver.onERC721Received.selector, "Invalid_contract");
        }
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(_owners[tokenId] == from, "Not_the_owner");
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }
}
