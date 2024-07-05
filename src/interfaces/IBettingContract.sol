//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./IBet.sol";
import "./IGaleon.sol";
import "./IWildcard.sol";
import "./IBetCertificate.sol";
import "./IOwnersContract.sol";

// Contrato de apuestas
interface IBettingContract is IBet {

    /// @notice Definir un evento llamado "NewBet" que se activa cuando se realiza una nueva apuesta.
    /// @param _betId El identificador de la apuesta. Campo indexado.
    /// @param _bettor La dirección del apostador. Campo indexado.
    /// @param _amount La cantidad apostada.
    event NewBet(uint256 indexed _betId, address indexed _bettor, uint256 _amount);

    /// @notice Devuelve la dirección del contrato Galeon
    function galeonContract() external view returns(IGaleon);
    /// @notice Devuelve la dirección del contrato Wildcard
    function wildcardContract() external view returns(IWildcard);
    /// @notice Devuelve la dirección del contrato BetCertificate
    function betCertificateContract() external view returns(IBetCertificate);
    /// @notice Devuelve la dirección del contrato OwnersContract
    function ownersContract() external view returns(IOwnersContract);
    /// @notice Devuelve la cantidad mínima de apuesta
    function minBetAmount() external view returns(uint256);
    /// @notice Devuelve el monto total acumulado de comisiones para los dueños expresado en Galeones
    function totalFee() external view returns(uint256);
    /// @notice Devuelve el monto total acumulado de premios para los ganadores
    /// Incluye los bounties de todos los epochs con resultado menos sus fees.
    /// @dev Se resta de esta cantidad cuando los ganadores retiran su premio.
    function bountyToCollect() external view returns(uint256);
    /// @notice Devuelve el porcentaje de comisiones cobradas sobre el bounty total de cada periodo de apuesta (epoch)
    /// Utilicelo de la siguiente manera: _bounty * commissionFee / ONE_HUNDRED_PERCENT
    function commissionFee() external view returns(uint256);
    /// @notice Devuelve el timestamp de inicio del periodo de apuestas actual
    /// @dev Las apuestas sin comodines siempre se realizan para dos días después de la fecha actual
    /// @dev Calculelo de la siguiente manera: (block.timestamp / 1 days * 1 days) + 2 days
    function getBetEpoch() external view returns(uint256);
    /// @notice Permite a un poseedor de Galeones realizar una apuesta
    /// @dev Revertir si `_amount` es menor a `minBetAmount` con el mensaje "Invalid_amount"
    /// @dev Revertir si el balance de Galeones del apostador es menor a `_amount` con el mensaje "Insufficient_balance"    
    /// @dev Revertir si la apobacion de Galeones del apostador al contrato es menor a `_amount` con el mensaje "Insufficient_allowance"
    /// @dev El contrato debe apoderarse de los Galeones indicados en `_amount`
    /// @dev Genere el certificado de apuesta (BetCertificate) correspondiente a nombre del apostador
    /// @dev Guarde la informacion de la apuesta en las variables de estado definidas para tal fin
    /// @dev Emita un evento `NewBet` correspondiente
    /// @param _amount La cantidad de Galeones a apostar
    /// @param _betResult El resultado esperado de la apuesta
    function bet(uint256 _amount, EpochResult _betResult) external;
    /// @notice Permite a un poseedor de Galeones realizar una apuesta utilizando un Wildcard
    /// @dev Revertir si `_amount` es menor a `minBetAmount` con el mensaje "Invalid_amount"
    /// @dev Revertir si el balance de Galeones del apostador es menor a `_amount` con el mensaje "Insufficient_balance"    
    /// @dev Revertir si la apobacion de Galeones del apostador al contrato es menor a `_amount` con el mensaje "Insufficient_allowance"
    /// @dev Revertir si el wildcardId no es valido con el mensaje "Invalid_wildcardId"
    /// @dev Revertir si el apostador no es el propietario del wildcard con el mensaje "Not_the_owner_of_the_wildcard"
    /// @dev El contrato debe apoderarse de los Galeones indicados en `_amount`
    /// @dev Aplique el wildcard correspondiente a la apuesta
    /// @dev Queme el wildcard utilizado
    /// @dev Genere el certificado de apuesta (BetCertificate) correspondiente a nombre del apostador
    /// @dev Guarde la informacion de la apuesta en las variables de estado definidas para tal fin
    /// @dev Emita un evento `NewBet` correspondiente
    /// @param _amount La cantidad de Galeones a apostar
    /// @param _betResult El resultado esperado de la apuesta
    /// @param _wildcardId El identificador del wildcard a utilizar
    function betWithWildcard(uint256 _amount, EpochResult _betResult, uint256 _wildcardId) external;
    /// @notice Permite a un poseedor de un certificado de apuesta ganador redimir su premio
    /// @dev Revertir si el remitente no es el propietario del certificado de apuesta con "Not_the_owner"
    /// @dev Revertir si el periodo de apuesta al que pertenece el certificado aun no tiene un resultado con "Bet_not_resolved"
    /// @dev Revertir si el resultado del certificado de apuesta no es ganador con "Your_bet_is_not_a_winner"
    /// @dev Revertir si el balance de Galeones del contrato es menor al monto a pagar con "Insufficient_balance
    /// @dev Transfiera al dueño del certificado de apuesta el monto correspondiente a su premio en Galeones. 
    /// El monto ganado debe ser calculado sobre el total de apuestas y proporcional al monto apostado sobre las apuestas de la opción ganadora
    /// @dev No olvide descontar el monto de la comision
    /// @dev Queme el certificado de apuesta
    /// @param _betId El identificador del certificado de apuesta
    function redeemWinBetCertificate(uint256 _betId) external;
    /// @notice Permite a un poseedor de un certificado de apuesta perdedora redimirlo por un wildcard a cambio de una cantidad de Galeones
    /// @dev Revertir si el remitente no es el propietario del certificado de apuesta con "Not_the_owner"
    /// @dev Revertir si el periodo de apuesta al que pertenece el certificado aun no tiene un resultado con "Bet_not_resolved"
    /// @dev Revertir si el resultado del certificado de apuesta no es perdedor con "Your_bet_is_not_a_loser"
    /// @dev Revertir si el balance de Galeones del dueño del certificado de apuesta es menor al precio de minar un nuevo wildcard con
    /// el mensaje "Insufficient_balance_to_pay_wildcard"
    /// @dev Revertir si la apobacion de Galeones del dueño del certificado de apuesta al contrato es menor al precio de minar un nuevo wildcard con
    /// el mensaje "Insufficient_allowance"
    /// @dev El contrato debe apoderarse de la cantidad de Galeones equivalente al precio de minar un nuevo wildcard
    /// @dev Genere un nuevo wildcard y transfieralo al dueño del certificado de apuesta
    /// @dev Queme el certificado de apuesta utilizado
    /// @param _betId El identificador del certificado de apuesta
    /// @param _wildcardType El tipo de wildcard a generar
    function redeemLostBetCertificate(uint256 _betId, WildcardType _wildcardType) external;
    /// @notice Permite a los dueños del protocolo establecer los contratos de los tokens a utilizar
    /// @dev Revertir si `_galeonContract` no es un contrato con "Invalid_galeonContract"
    /// @dev Revertir si `_betCertificateContract` no es un contrato con "Invalid_betCertificateContract"
    /// @dev Revertir si `_wildcardContract`  no es un contrato con "Invalid_wildcardContract"
    /// @param _galeonContract La dirección del contrato de Galeones
    /// @param _betCertificateContract La dirección del contrato de certificados de apuestas
    /// @param _wildcardContract La dirección del contrato de Wildcards
    function setTokenContracts(address _galeonContract, address _betCertificateContract, address _wildcardContract) external;
    /// @notice Permite a los dueños del protocolo establecer el monto minimo de apuestas
    /// @dev Revertir si `_minBetAmount` es cero con "Invalid_minBetAmount"
    /// @param _minBetAmount El monto minimo de apuestas
    function setMinBetAmount(uint256 _minBetAmount) external;
    /// @notice Permite a los dueños del protocolo establecer el resultado de un periodo de apuestas
    /// @dev Revertir si aun no han pasado 24 horas desde el inicio del periodo de apuesta para el cual se desea establecer
    /// el resultado. Mensaje "Invalid_betEpoch"
    /// @dev Revertir si el resultado ya ha sido establecido. Mensaje "Result_already_set"
    /// @dev Calcule el monto de la comision y actualice las variables de estado correspondientes. Utilice la siguiente
    /// formula: _bounty * commissionFee / ONE_HUNDRED_PERCENT
    function setEpochResult(uint256 _epoch, EpochResult _result) external;
    /// @notice Permite a los dueños del protocolo establecer el precio de un Wildcard en el contrato Wildcard
    /// @dev Revertir si _WildcardType es invalido con "Invalid_WildcardType"
    /// @dev Revertir si _mintprice es cero con "Invalid_mintprice"
    /// @param _WildcardType Tipo de Wildcard
    /// @param _mintprice Precio de acuñación
    function setMintPrice(WildcardType _WildcardType, uint256 _mintprice) external;
    /// @notice Permite a los dueños del protocolo establecer el porcentaje de comision a cobrar
    /// sobre el bounty total de cada periodo de apuesta (epoch)
    /// @dev Revertir si `_commissionFee` es cero o mayor a `MAX_COMISSION_FEE` con "Invalid_commissionFee"
    /// Cree una constante llamada `MAX_COMISSION_FEE` con el valor 700
    function setCommissionFee(uint256 _commissionFee) external;
    /// @notice Permite retirar las comisiones acumuladas para los dueños del protocolo
    /// @dev Este método debe poder ser llamado solo por `OwnersContract`. En caso contrario revertir con el mensaje "Not_authorized"
    /// @dev Revertir si no hay comisiones para reclamar con "No_fees_to_claim"
    /// @dev Transferir las comisiones acumuladas al contrato `OwnersContract`
    /// @return La cantidad de comisiones reclamadas
    function claimGaleons() external returns (uint256);    
}