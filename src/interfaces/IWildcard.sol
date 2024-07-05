//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./IERC721.sol";
import "./IWildcardType.sol";
import "./IEvents.sol";

interface IWildcard is IERC721, IEvents {

    /// @notice Metadata del Wildcard
    struct WildcardMetadata {
        /// @dev Identificador de la apuesta vinculada al Wildcard
        uint256 betId;
        /// @dev Tipo de Wildcard
        WildcardType wildcardType;
    }

    /// @notice Devuelve los metadatos del Wildcard (WildcardMetadata) para cada índice de token
    function getMetadata(uint256 _tokenId) external view returns (WildcardMetadata memory);
    /// @notice Devuelve el precio de un Wildcard
    function mintPrice(WildcardType _WildcardType) external view returns (uint256);
    /// @notice Establece el precio de un Wildcard
    /// @dev Revertir si el remitente no es `BettingContract`. Mensaje: "Only_Betting_Contract"
    /// @dev Revertir si _WildcardType es invalido con "Invalid_WildcardType"
    /// @dev Revertir si _mintprice es cero con "Invalid_mintprice"
    /// @param _WildcardType Tipo de Wildcard
    /// @param _mintprice Precio de acuñación
    function setMintPrice(WildcardType _WildcardType, uint256 _mintprice) external;
    /// @notice Acuña un nuevo NFT Wildcard
    /// @dev Revertir si `_to` es la dirección cero. Mensaje: "Invalid_to"
    /// @dev Revertir si `_amount` es cero. Mensaje: "Invalid_amount"
    /// @dev Revertir si el remitente no es `BettingContract`. Mensaje: "Only_Betting_Contract"
    /// @dev Revertir si el periodo de apuesta al que pertenece el certificado aun no tiene un resultado. Mensaje "Bet_not_resolved"
    /// @dev Cuando la acuñación se completa, esta función verifica si `_to` es un contrato inteligente (tamaño de código > 0),
    /// si es así, llama a `onERC721Received` en `_to` y Revertir si el valor de retorno no es
    /// `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`, mensaje: "Invalid_contract".
    /// @dev Emitir el evento "Transfer" con from en cero.
    /// @param _to La dirección del nuevo propietario
    /// @param _betId Identificador de la apuesta vinculada al Wildcard
    /// @param _wildcardType Tipo de Wildcard
    function mint(address _to, uint256 _betId, WildcardType _wildcardType) external;
    /// @notice Quema el Wildcard indicado
    /// @dev Revertir si el remitente no es `BettingContract`. Mensaje: "Only_Betting_Contract"
    /// @dev Revertir si `_tokenId` no es un identificador de NFT válido con "Invalid_tokenId".
    /// @dev Revertir si el certificado de apuesta aún no tiene resultado con "Bet_not_resolved".
    /// @dev Emitir el evento "Transfer" con los parámetros correspondientes.
    /// @dev Al finalizar no deben quedar metadatos del certificado en el contrato
    /// @param _tokenId El identificador de NFT
    function burn(uint256 _tokenId) external;
}