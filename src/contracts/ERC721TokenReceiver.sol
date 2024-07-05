// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../interfaces/IERC721TokenReceiver.sol";

contract ERC721TokenReceiver is IERC721TokenReceiver {
    bytes4 private constant ERC721_RECEIVED = 0x150b7a02;

    event TokenReceived(address _operator, address _from, uint256 _tokenId, bytes _data);

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public override returns (bytes4) {
        emit TokenReceived(operator, from, tokenId, data);
        return ERC721_RECEIVED;
    }
}







