//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;
 
interface IOwnersContract {
    
    struct Owner {
        bool isOwner;
        uint256 ownerIndex;
        uint256 galeonsToClaim;
        uint256 ethToClaim;
    }

    /// @dev Devuelve la dirección del contrato de apuestas.
    function bettingContract() external view returns(address);
    /// @dev Devuelve la dirección del contrato de Galeon.
    function galeonContract() external view returns(address);
    /// @dev Devuelve la cantidad de propietarios de protocolo activos.
    /// @dev Este valor debe aumentar al agregar nuevos owners y disminuir en caso contrario.
    function ownersCount() external view returns(uint256);
    /// @dev Devuelve la dirección del propietario de un protocolo para el _ownerIndex recibido como parámetro. Othersie devuelve cero dirección
    function ownersList(uint256 _ownerIndex) external view returns(address _ownerAddress);
    /// @dev Devuelve los metadatos de un propietario de protocolo para el _propietario recibido como parámetro. Othersie devuelve metadatos vacíos
    function getOwner(address _owner) external view returns(Owner memory _ownerMetadata);
    /// @dev Devuelve si la dirección indicada es un propietario de protocolo.
    function isOwner(address _owner) external view returns (bool);
    /// @notice Agrega un nuevo owner al protocolo
    /// @dev Solo un owner actual puede llamar a esta función, de lo contrario revertir con "Not_an_owner"
    /// @dev Revertir si _owner ya es un owner, con "Already_an_owner"
    /// @dev Agregue la direccion del nuevo owner en las dos listas dispuestas en el state del contrato
    /// @dev Actualizar los saldos de Galeones y ETH a retirar de todos los owners antes de agregar al owner
    /// @param _owner La dirección del nuevo owner
    function addOwner(address _owner) external;
    /// @notice Permite elimina un owner del protocolo
    /// @dev Solo un owner actual puede llamar a esta función, de lo contrario revertir con "Not_an_owner"
    /// @dev Revertir si _owner no es un owner, con "Not_an_owner"
    /// @dev Si _owner tiene saldo de Galeones o ETH pendientes de retiro, solo marque al owner como no owner
    /// @dev Si _owner no tiene saldo de Galeones o ETH pendientes de retiro, elimine al owner de las dos listas dispuestas en el state del contrato
    /// @dev Actualizar los saldos de Galeones y ETH a retirar de todos los owners antes de eliminar al owner
    /// @param _owner La dirección del owner a eliminar
    function removeOwner(address _owner) external;
    /// @notice Establece el address del contrato de apuestas
    /// @dev Solo un owner actual puede llamar a esta función, de lo contrario revertir con "Not_an_owner"
    /// @dev Revertir si la dirección _bettingContract es cero, con "Invalid_address"
    /// @dev Revertir si la dirección _bettingContract no es un contrato, con "Invalid_contract"
    /// @param _bettingContract La dirección del contrato de apuestas
    function setBettingContract(address _bettingContract) external;
    /// @notice Establece el address del contrato Galeon
    /// @dev Solo un owner actual puede llamar a esta función, de lo contrario revertir con "Not_an_owner"
    /// @dev Revertir si la dirección _galeonContract es cero, con "Invalid_address"
    /// @dev Revertir si la dirección _galeonContract no es un contrato, con "Invalid_contract"
    /// @param _galeonContract La dirección del contrato de apuestas
    function setGaleonContract(address _galeonContract) external;
    /// @notice Permite a los owners reclamar los Galeones que se han acumulado en el contrato de apuestas
    /// @dev Solo un owner actual puede llamar a esta función, de lo contrario revertir con "Not_an_owner"
    /// @dev Revertir si el contrato de apuestas no ha sido establecido, con "Betting_contract_not_set"
    /// @dev Revertir si el contrato de Galeon no ha sido establecido, con "Galeon_contract_not_set"
    /// @dev Controlar que el balance de Galeones del contrato despues de recibir los tokens sea igual
    /// al saldo antes de la transferencia mas los tokens recibidos, de lo contrario revertir con "Invalid_balance_after_claim"
    /// @dev Una vez recibida la transferencia de Galeones, dividir el monto entre los owners y sumar el monto particular de cada uno
    function claimGaleons() external;
    /// @notice Permite a los owners reclamar los ETH que se han acumulado en el contrato Galeon al redimir tokens
    /// @dev Solo un owner actual puede llamar a esta función, de lo contrario revertir con "Not_an_owner"
    /// @dev Revertir si el contrato Galeon no ha sido establecido, con "Galeon_contract_not_set"
    /// @dev Controlar que el balance de ETH del contrato despues de recibir los tokens sea igual
    /// al saldo antes de la transferencia mas los ETH recibidos, de lo contrario revertir con "Invalid_balance_after_claim"
    /// @dev Una vez recibida la transferencia de ETH, dividir el monto entre los owners y sumar el monto particular de cada uno
    function claimEth() external;
    /// @notice Permite a cada owner retirar los Galeones acumulados en su cuenta
    /// @dev Solo un owner actual puede llamar a esta función, de lo contrario revertir con "Not_an_owner"
    /// @dev Revertir si el owner no tiene suficientes Galeones para retirar, con "Insufficient_balance"
    /// @param _amount La cantidad de Galeones a retirar
    function withdrawGaleons(uint256 _amount) external;
    /// @notice Permite a cada owner retirar los ETH acumulados en su cuenta
    /// @dev Solo un owner actual puede llamar a esta función, de lo contrario revertir con "Not_an_owner"
    /// @dev Revertir si el owner no tiene suficientes ETH para retirar, con "Insufficient_balance"
    /// @param _amount La cantidad de ETH a retirar
    function withdrawEth(uint256 _amount) external; 
}