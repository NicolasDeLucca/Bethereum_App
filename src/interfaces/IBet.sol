//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @dev NFT interface
interface IBet {

    // Structs

    /// @notice Metadata de cada periodo de apuestas
    struct Epoch {
        /// @dev Cantidad total en Galeones
        uint256 bounty;
        /// @dev Cantidad de comisiones en Galeones
        uint256 fee;
        /// @dev Cantidad total en Galeones para cada opción
        mapping(EpochResult _option => uint256 _amount) totalAmount;
        /// @dev Resultado obtenido en el periodo
        EpochResult result;
    }

    /// @notice Metadata de cada apuesta
    struct BetMetadata {
        /// @dev Timestamp de comienzo del periodo de apuesta 
        uint256 epoch;
        /// @dev Monto de la apuesta en Galeones
        uint256 amount;
        /// @dev Opción seleccionada en la apuesta
        EpochResult result;
    }

    /// @notice Estados de los resultdos de apuestas 
    enum EpochResult {
        Pending,
        EqualOrGreater,
        Smaller
    }

}