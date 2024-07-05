// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../interfaces/IERC721TokenReceiver.sol";
import "./ContractUtils.sol";

library ERC721Utils {
    using ContractUtils for address;
    
    function isERC721TokenReceiver(address account) external returns (bool) {
        if (ContractUtils.isContract(account)) {
            try IERC721TokenReceiver(account).onERC721Received(msg.sender, msg.sender, 0, "") returns (bytes4 retval) {
                return retval == IERC721TokenReceiver.onERC721Received.selector;
            } catch {
                return false;
            }
        }
        return true;
    }
    
}