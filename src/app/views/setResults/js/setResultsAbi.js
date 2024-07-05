export { abi }

let abi = `[
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_epoch",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "_result",
        "type": "uint8"
      }
    ],
    "name": "setEpochResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBetEpoch",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }       
    ],
    "stateMutability": "view",
    "type": "function"
  }
]`;