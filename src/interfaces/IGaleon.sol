//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./IEvents.sol";

/// @dev ERC20 interface
interface IGaleon is IEvents {

    /// @notice Devuelve el nombre del token
    function name() external view returns (string memory _name);
    /// @notice Devuelve el símbolo del token
    function symbol() external view returns (string memory _symbol);
    /// @notice Devuelve los decimales del token
    function decimals() external view returns (uint256 _decimals);
    /// @notice Devuelve el suministro total del token
    function totalSupply() external view returns (uint256);
    /// @notice Devuelve la cantidad de tokens que posee cada cuenta
    function balanceOf(address _owner) external view returns (uint256);
    /// @notice Devuelve la cantidad de tokens que un propietario permitió a un autorizado gastar
    function allowance(address _owner, address _spender) external view returns (uint256 _amount);
    /// @dev Devuelve el precio actual de acuñación
    function mintPrice() external view returns(uint256 _mintPrice);
    /// @dev Devuelve el porcentaje actual de la tarifa de retiro
    function withdrawFee() external view returns(uint256 _withdrawFee);
    /// @dev Devuelve el monto total acumulado de la comision cobrado al redeemir tokens
    /// @dev Cada vez que un token es redeemido se debe cobrar una comision en base al `withrawFee` que se acumula en este monto
    /// @dev En cada operacion de redeem compute el monto de la comision a cobrar de la siguiente manera y sumelo al monto acumulado:
    /// (_amount * withrawFee) / ONE_HUNDRED_PERCENT 
    function withdrawFeesAmount() external view returns(uint256 _withdrawFeesAmount);
    /// @notice Transfiere la cantidad `_value` de tokens a la dirección `_to`
    /// @dev En caso de éxito debe activar el evento `Transfer`.
    /// @dev Revertir si `_to` es la dirección cero. Mensaje: "Invalid_address"
    /// @dev Revertir si `_value` es cero. Mensaje: "Invalid_value"
    /// @dev Revertir si `_to` es la misma address que la dirección del remitente. Mensaje: "Invalid_recipient"
    /// @dev Revertir si la dirección del remitente tiene un saldo insuficiente. Mensaje: "Insufficient_balance"
    /// @param _to Es la dirección del destinatario de la transferencia de tokens.
    /// @param _value Es la cantidad de tokens a transferir
    function transfer(address _to, uint256 _value) external;
    /// @notice Transfiere la cantidad `_value` de tokens desde la dirección `_from` a la dirección `_to`
    /// @dev En caso de éxito debe activar el evento `Transfer`.
    /// @dev Revertir si `_from` es la dirección cero. Mensaje: "Invalid_address"
    /// @dev Revertir si `_to` es la dirección cero. Mensaje: "Invalid_address"
    /// @dev Revertir si `_to` es la misma address que la dirección del remitente. Mensaje: "Invalid_recipient"
    /// @dev Revertir si `_value` es cero. Mensaje: "Invalid_value"
    /// @dev Revertir si la dirección del remitente tiene un saldo insuficiente. Mensaje: "Insufficient_balance"
    /// @dev Revertir si `msg.sender` no es el propietario actual o una dirección autorizada con permiso para gastar
    /// el saldo de la cuenta '_from' Mensaje: "Insufficient_allowance"
    /// @param _from Es la dirección que transferirá los tokens
    /// @param _to Es la dirección a la que se transferirán los tokens
    /// @param _value Es la cantidad a transferir
    function transferFrom(address _from, address _to, uint256 _value) external;
    /// @notice Autoriza a `_spender` a retirar varias veces del saldo del remitente, hasta la cantidad `_value`
    /// @dev Si esta función se llama varias veces, sobrescribe la asignación actual con `_value`
    /// @dev En caso de éxito debe activar el evento `Approval`.
    /// @dev Revertir si `_spender` es la dirección cero. Mensaje: "Invalid_address"
    /// @dev Revertir si `_value` excede el saldo del remitente. Mensaje: "Insufficient_balance"
    /// @param _spender Es la dirección de la cuenta autorizada
    /// @param _value Es la cantidad de asignación.
    function approve(address _spender, uint256 _value) external;
    /// @notice Emite una nueva cantidad de Galeones a cambio de una cantidad de ethers segun mintPrice
    /// @dev Revertir si msg.value no es suficiente para pagar la cantidad solicitada de tokens. Mensaje: "Insufficient_value"
    /// @dev Emitir el evento `Transfer` con el parámetro `_from` establecido como la dirección cero.
    /// @dev Si msg.value excede el monto a pagar, devuelve la diferencia al remitente.
    /// @dev Revertir si el mintPrice aún es cero. Mensaje: "Invalid_mint_price"
    /// @param _amount Es la cantidad de Galeones (tokens) a acuñar
    function mint(uint256 _amount) external payable;
    /// @notice Canjear una cantidad específica de tokens a cambio de una cantidad equivalente de ethers que son entregados al usuario
    /// @dev Revertir si el remitente no tiene saldo de Galeones. Mensaje: "Zero_balance"
    /// @dev Revertir si la dirección del remitente tiene un saldo insuficiente. Mensaje: "Insufficient_balance"
    /// @dev Si `_amount` es cero, canjear todo el saldo.
    /// @dev Emitir el evento `Transfer` con el parámetro `_to` establecido como la dirección cero.
    /// @dev Los Galeones canjeados deben ser quemados.
    /// @dev Debe cobrar las comisiones correspondientes al canjear tokens.
    /// @param _amount Es la cantidad de tokens a canjear
    function redeem(uint256 _amount) external;
    /// @dev Establece el precio de acuñación
    /// @dev Este método debe poder ser llamado solo por alguno de los propietarios del protocolo, de lo contrario revertir con el mensaje 
    /// "Not_authorized"
    /// @dev Revertir si `_mintPrice` es cero. Mensaje: "Invalid_mint_price"
    /// @param _mintPrice Es el nuevo precio de acuñación
    function setMintPrice(uint256 _mintPrice) external;
    /// @dev Establece el porcentaje de comision cobrado al redeemir tokens
    /// @dev Este método debe poder ser llamado solo por alguno de los propietarios del protocolo, de lo contrario revertir con el mensaje 
    /// "Not_authorized"
    /// @dev Revertir si `_fee` es cero o superior al maximo porcentaje de comision posible. Mensaje: "Invalid_fee"
    /// @dev El maximo porcentaje de comision posible debe ser definido en una constante con el nombre `MAX_WITHDRAW_FEE` y con el valor
    /// 200. Se sugiere definir tambien una constante llamada `ONE_HUNDRED_PERCENT` con el valor `10_000` que representa el 100%.
    /// @param _fee Es la nueva comision de retiro
    function setWithdrawFee(uint256 _fee) external;
    /// @notice Permite a los propietarios del protocolo retirar la comision acumulada por el cobro de comisiones al redeemir tokens
    /// @dev Este método debe poder ser llamado solo por `OwnersContract`. En caso contrario revertir con el mensaje "Not_authorized"
    /// @dev Revertir si el monto acumulado de comisiones es cero. Mensaje: "No_fees_to_withdraw"
    /// @dev Revertir si el contrato no tiene el balance suficiente para entregar el monto  acumulado de comisiones. Mensaje: "Insufficient_balance"
    /// @dev La funcion debe transferir el monto acumulado de comisiones a la direccion `OwnersContract`.
    /// @return _feeAmount Es el monto efectivamente transferido a `OwnersContract`.
    function withdrawFeeAmount() external returns(uint256 _feeAmount);
}