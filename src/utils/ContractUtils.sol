// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

library ContractUtils {
    function isContract(address account) external view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
}
