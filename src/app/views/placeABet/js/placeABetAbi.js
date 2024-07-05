export { abi }
let abi = `[
  {
    "inputs": [],
    "name": "minBetAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "commissionFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }   
    ],
    "stateMutability": "view",
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
  },
  {
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
        },
        {
            "internalType": "uint8",
            "name": "_betResult",
            "type": "uint8"
        }
    ],
    "name": "bet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
        },
        {
            "internalType": "uint8",
            "name": "_betResult",
            "type": "uint8"
        },
        {
            "internalType": "uint256",
            "name": "_wildcardId",
            "type": "uint256"
        }
    ],
    "name": "betWithWildcard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`;