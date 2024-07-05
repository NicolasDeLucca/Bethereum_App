// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../interfaces/IWildcard.sol";
import "../interfaces/IWildcardType.sol";
import "../interfaces/IERC721TokenReceiver.sol";
import "../interfaces/IBettingContract.sol";
import "../utils/ContractUtils.sol";

contract Wildcard is IWildcard {
    using ContractUtils for address;

    string public name;
    string public symbol;
    string public tokenURI;
    uint256 public totalSupply;
    address public bettingContract;
    uint256 public currentTokenID;
    
    mapping(uint256 => WildcardMetadata) public metadata;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => address) public allowance;
    mapping(address => mapping(address => bool)) public operator;
    mapping(WildcardType => uint256) public mintPrice;
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid_address");
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        require(tokenId > 0 && tokenId <= currentTokenID, "Invalid_tokenId");
        _;
    }

    modifier onlyOwnerOrApproved(uint256 tokenId) {
        require(
            msg.sender == ownerOf[tokenId] || msg.sender == allowance[tokenId],
            "Not_the_owner"
        );
        _;
    }

    modifier onlyBettingContract() {
        require(msg.sender == bettingContract, "Only_Betting_Contract");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _tokenURI,
        address _bettingContract
    ) {
        require(bytes(_name).length > 0, "Invalid_parameter_name");
        require(bytes(_symbol).length == 3, "Invalid_symbol");
        require(bytes(_tokenURI).length > 0, "Invalid_parameter_tokenURI");
        require(_bettingContract != address(0), "Invalid_address");

        name = _name;
        symbol = _symbol;
        tokenURI = _tokenURI;
        bettingContract = _bettingContract;
    }

    function getMetadata(uint256 _tokenId) external view override returns (WildcardMetadata memory) {
        return metadata[_tokenId];
    }

    function setMintPrice(WildcardType _WildcardType, uint256 _mintprice) external override 
        onlyBettingContract {
            require(_WildcardType == WildcardType.DayBefore || _WildcardType == WildcardType.doubleSpending, "Invalid_WildcardType");
            require(_mintprice > 0, "Invalid_mintPrice");

            mintPrice[_WildcardType] = _mintprice;
    }

    function safeTransfer(address _to, uint256 _tokenId) external override 
        validAddress(_to) {
            _safeTransfer(msg.sender, _to, _tokenId, "");
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external override 
        validAddress(_to) {
            _safeTransferFrom(_from, _to, _tokenId, "");
    }

    function approve(address _approved, uint256 _tokenId) external override {
        require(_tokenId <= currentTokenID, "Invalid_tokenId");
        require(msg.sender == ownerOf[_tokenId] || allowance[_tokenId] == msg.sender, "Not_authorized");

        allowance[_tokenId] = _approved;

        emit Approval(msg.sender, _approved, _tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved) external override {
        require(_operator != address(0), "Invalid_Operator");

        operator[msg.sender][_operator] = _approved;
    }

    function mint(address _to, uint256 _betId, WildcardType _wildcardType) external override 
        onlyBettingContract {
            require(_to != address(0), "Invalid_to");
            require(_betId > 0, "Invalid_betId");
            require(_wildcardType == WildcardType.DayBefore || _wildcardType == WildcardType.doubleSpending, "Invalid_WildcardType");
            require(IBettingContract(bettingContract).betCertificateContract().getBetMetadata(_betId).epoch <= (block.timestamp / 1 days * 1 days), "Bet_not_resolved");

            WildcardMetadata memory wm = WildcardMetadata({
                betId: _betId,
                wildcardType: _wildcardType
            });

            totalSupply++;
            currentTokenID++;
            metadata[currentTokenID] = wm;
            ownerOf[currentTokenID] = _to;
            balanceOf[_to]++;

            emit Transfer(address(0), _to, currentTokenID);
    }

    function burn(uint256 _tokenId) external override 
        onlyBettingContract 
        validTokenId(_tokenId) {
            require(IBettingContract(bettingContract).betCertificateContract().getBetMetadata(metadata[_tokenId].betId).epoch <= (block.timestamp / 1 days * 1 days), "Bet_not_resolved");

            delete metadata[_tokenId];
            balanceOf[ownerOf[_tokenId]]--;
            ownerOf[_tokenId] = address(0);
            totalSupply--;

            emit Transfer(msg.sender, address(0), _tokenId);
    }

    function _safeTransfer(address _from, address _to, uint256 _tokenId, bytes memory _data) internal 
        validAddress(_to) validTokenId(_tokenId) {
            require(_from == ownerOf[_tokenId], "Not_the_owner");

            _transfer(_from, _to, _tokenId);

            if (_to.isContract()) {
                bytes4 retval = IERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data);
                require(retval == IERC721TokenReceiver(_to).onERC721Received.selector, "Invalid_contract");
            }

            emit Transfer(_from, _to, _tokenId);
    }

    function _safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory _data) internal 
        validAddress(_to){
            require(ownerOf[_tokenId] == _from, "Not_the_owner");

            _transfer(_from, _to, _tokenId);

            if (_to.isContract()) {
                bytes4 retval = IERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data);
                require(retval == IERC721TokenReceiver(_to).onERC721Received.selector, "Invalid_contract");
            }

            emit Transfer(_from, _to, _tokenId);
    }

    function _transfer(address _from, address _to, uint256 _tokenId) private {
        ownerOf[_tokenId] = _to;
        balanceOf[_from]--;
        balanceOf[_to]++;
    }
}
