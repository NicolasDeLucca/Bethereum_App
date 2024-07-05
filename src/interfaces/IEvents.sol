//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IEvents {
    /// Events

    /// @notice Define un evento llamado "Transfer" que se activará cuando los tokens sean transferidos
    /// @dev En la creación de nuevos tokens, se activa con la dirección `from` establecida como dirección cero
    /// @dev En la destruccion de tokens, se activa con la dirección `to` establecida como dirección cero
    /// @param _from La dirección del remitente. Este campo debe estar indexado.
    /// @param _to La dirección del destinatario. Este campo debe estar indexado.
    /// @param _value La cantidad de tokens transferidos
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /// @notice Define un evento llamado "Approval" que se activará en cualquier llamada exitosa al método `approve`
    /// @param _owner La dirección del propietario. Este campo debe estar indexado.
    /// @param _spender La dirección del autorizado. Este campo debe estar indexado.
    /// @param _value La cantidad de tokens aprobados
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

}