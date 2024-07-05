export { abi }
let abi = `[
  {
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_betId",
            "type": "uint256"
        }
    ],
    "name": "redeemWinBetCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_betId",
            "type": "uint256"
        },
        {
            "internalType": "uint8",
            "name": "_wildcardType",
            "type": "uint8"
        }
    ],
    "name": "redeemLostBetCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`;