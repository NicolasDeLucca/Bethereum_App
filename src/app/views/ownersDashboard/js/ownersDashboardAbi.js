export { abi }

let abi = `[
  {
    "inputs": [],
    "name": "ownersCount",
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
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "getOwner",
    "outputs": [
        {
            "components": [
                {
                    "name": "isOwner",
                    "type": "bool"
                },
                {
                    "name": "ownerIndex",
                    "type": "uint256"
                },
                {
                    "name": "galeonsToClaim",
                    "type": "uint256"
                },
                {
                    "name": "ethToClaim",
                    "type": "uint256"
                }
            ],
            "name": "",
            "type": "tuple"
        }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "addOwner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "removeOwner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`;