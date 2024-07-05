//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./IERC721.sol";
import "./IBet.sol";
import "./IEvents.sol";

interface IBetCertificate is IBet, IERC721, IEvents {
    
    /// @notice Devuelve los metadatos de apuesta para el índice de token indicado
    function getBetMetadata(uint256 _tokenId) external view returns (BetMetadata memory _betMetadata);
    /// @notice Acuña un nuevo certificado de apuesta
    /// @dev Revertir si `_to` es la dirección cero. Mensaje: "Invalid_to"
    /// @dev Revertir si `_amount` es cero. Mensaje: "Invalid_amount"
    /// @dev Revertir si el remitente no es `BettingContract`. Mensaje: "Only_Betting_Contract"
    /// @dev Revertir si el periodo de apuesta al que pertenece el certificado aun no tiene un resultado. Mensaje "Bet_not_resolved"
    /// @dev Cuando la acuñación se completa, esta función verifica si `_to` es un contrato inteligente (tamaño de código > 0),
    /// si es así, llama a `onERC721Received` en `_to` y Revertir si el valor de retorno no es
    /// `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`, mensaje: "Invalid_contract".
    /// @dev Emitir el evento "Transfer" con from en cero.
    /// @param _to La dirección del nuevo propietario
    /// @param _amount El monto de la apuesta
    /// @param _betEpoch El timestamp de inicio  del periodo de apuesta vinculado al certificado
    /// @param _betResult El resultado de la apuesta
    /// @return _betId El identificador del certificado de apuesta recien creado
    function mint(address _to, uint256 _amount, uint256 _betEpoch, EpochResult _betResult) external returns(uint256 _betId);
    /// @notice Quema el certificado de apuesta indicado
    /// @dev Revertir si el remitente no es `BettingContract`. Mensaje: "Only_Betting_Contract"
    /// @dev Revertir si `_tokenId` no es un identificador de NFT válido con "Invalid_tokenId".
    /// @dev Revertir si el certificado de apuesta aún no tiene resultado con "Bet_not_resolved".
    /// @dev Emitir el evento "Transfer" con los parámetros correspondientes.
    /// @dev Al finalizar no deben quedar metadatos del certificado en el contrato
    /// @param _tokenId El identificador de NFT
    function burn(uint256 _tokenId) external;
}
