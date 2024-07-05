//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @notice Enumeración de los tipos de wildcards
enum WildcardType {
    /// @dev Esta wildcard realiza la apuesta para el periodo de apuesta siguiente 
    DayBefore,
    /// @dev Esta wildcard acredita 50% más de Galeones al monto de la apuesta
    doubleSpending
}