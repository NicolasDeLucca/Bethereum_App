export { bettingContractAbi, galeonAbi, ownersContractAbi }

let bettingContractAbi = `[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_galeonContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_betCertificateContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_wildcardContract",
        "type": "address"
      }
    ],
    "name": "setTokenContracts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_commissionFee",
        "type": "uint256"
      }
    ],
    "name": "setCommissionFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_minBetAmount",
        "type": "uint256"
      }
    ],
    "name": "setMinBetAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint8",
              "name": "",
              "type": "uint8"
          },
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "setMintPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  }
]`;

let galeonAbi = `[
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "setMintPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "setWithdrawFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`;

let ownersContractAbi = `[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_galeonContractAddress",
        "type": "address"
      }
    ],
    "name": "setGaleonContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_bettingContractAddress",
        "type": "address"
      }
    ],
    "name": "setBettingContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`;