//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC721 {
    
    /// @notice Devuelve el nombre de la colección NFT
    function name() external view returns (string memory _name);
    /// @notice Devuelve el símbolo de la colección NFT
    function symbol() external view returns (string memory _symbol);
    /// @notice Devuelve el tokenURI de la colección NFT
    function tokenURI() external view returns (string memory _tokenURI);
    /// @notice Devuelve el suministro total de la colección NFT
    function totalSupply() external view returns (uint256);
    /// @notice Devuelve la cantidad de NFT que posee cada cuenta
    function balanceOf(address _owner) external view returns (uint256);
    /// @notice Devuelve la dirección del propietario para cada índice de token
    function ownerOf(uint256 _tokenId) external view returns (address);
    /// @notice Devuelve la dirección autorizada para gestionar en nombre de un propietario de NFT el token de índice indicado
    function allowance(uint256 _tokenId) external view returns (address);
    /// @notice Devuelve si la dirección indicada es un operador del propietario indicado
    function operator(address _owner, address _operator) external view returns (bool);
    /// @notice Devuelve la dirección del contrato de apuestas
    /// @dev Esta dirección debe establecerse en el constructor del contrato
    function bettingContract() external view returns (address);
    /// @notice Transfiere la propiedad de un NFT desde la dirección del remitente a la dirección '_to'
    /// @dev Revertir si `_tokenId` no es un identificador de NFT válido con "Invalid_tokenId".
    /// @dev Revertir si `_to` es la dirección cero con "Invalid_address".
    /// @dev Revertir si el remitente no es el propietario actual con el mensaje "Not_the_owner".
    /// @dev Cuando la transferencia se completa, esta función verifica si `_to` es un contrato inteligente (tamaño de código > 0),
    /// si es así, llama a `onERC721Received` en `_to` y Revertir si el valor de retorno no es
    /// `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`, mensaje: "Invalid_contract".
    /// @dev Emitir el evento "Transfer" con los parámetros correspondientes.
    /// @param _to La dirección del nuevo propietario
    /// @param _tokenId El identificador de NFT a transferir
    function safeTransfer(address _to, uint256 _tokenId) external;
    /// @notice Transfiere la propiedad de un NFT desde la dirección '_from' a la dirección '_to'
    /// @dev Revertir si `_tokenId` no es un identificador de NFT válido con "Invalid_tokenId".
    /// @dev Revertir si `_to` es la dirección cero con "Invalid_address".
    /// @dev Revertir si `_from` no es el propietario actual con el mensaje "Not_the_owner".
    /// @dev Revertir a menos que el remitente sea el propietario actual o una dirección autorizada para el NFT, con el mensaje
    /// "Not_authorized".
    /// @dev Cuando la transferencia se completa, esta función verifica si `_to` es un contrato inteligente (tamaño de código > 0),
    /// si es así, llama a `onERC721Received` en `_to` y Revertir si el valor de retorno no es
    /// `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`, mensaje: "Invalid_contract".
    /// @dev Emitir el evento "Transfer" con los parámetros correspondientes.
    /// @param _from El propietario actual del NFT
    /// @param _to La dirección del nuevo propietario
    /// @param _tokenId El identificador de NFT a transferir
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
    /// @notice Cambia o reafirma la dirección aprobada para administrar un NFT
    /// @dev La dirección cero indica que no hay dirección aprobada.
    /// @dev Revertir si `_tokenId` no es un identificador de NFT válido. Mensaje: "Invalid_tokenId".
    /// @dev Revertir a menos que `msg.sender` sea el propietario actual de NFT o una dirección autorizada del NFT.
    /// Mensaje "Not_authorized".
    /// @dev Emitir el evento "Approval" con los parámetros correspondientes.
    /// @param _approved El nuevo administrador de NFT
    /// @param _tokenId El identificador de NFT a transferir
    function approve(address _approved, uint256 _tokenId) external;
    /// @notice Agrega un address como operador de todos los NFT del propietario
    /// @dev Revertir si `_operator` es la dirección cero. Mensaje: "Invalid_Operator"
    /// @param _operator La dirección del operador
    /// @param _approved True si el operador está aprobado, false en caso contrario
    function setApprovalForAll(address _operator, bool _approved) external;
    /// @dev Devuelve el índice del último token acuñado
    function currentTokenID() external view returns (uint256 _currentTokenID);
}
