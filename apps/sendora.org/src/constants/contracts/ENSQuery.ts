export default {
    "released": true,
    "contractName": "ENSQuery",
    "version": "untitled",
    "deployments": {
        "canonical": {
            "address": "0x9cbc881c6184a40f1a5ae2074b40bbd1df3304a3",
            "bytecode": "0x608060405234801561000f575f80fd5b506102758061001d5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063fbec16e31461002d575b5f80fd5b61004061003b3660046101f3565b61005c565b6040516001600160a01b03909116815260200160405180910390f35b604051630178b8bf60e01b8152600481018290525f90839082906001600160a01b03831690630178b8bf90602401602060405180830381865afa1580156100a5573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906100c9919061021d565b90506001600160a01b03811661011b5760405162461bcd60e51b815260206004820152601260248201527114995cdbdb1d995c881b9bdd08199bdd5b9960721b60448201526064015b60405180910390fd5b604051631d9dabef60e11b81526004810185905281905f906001600160a01b03831690633b3b57de90602401602060405180830381865afa158015610162573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190610186919061021d565b90506001600160a01b0381166101d25760405162461bcd60e51b81526020600482015260116024820152701059191c995cdcc81b9bdd08199bdd5b99607a1b6044820152606401610112565b9695505050505050565b6001600160a01b03811681146101f0575f80fd5b50565b5f8060408385031215610204575f80fd5b823561020f816101dc565b946020939093013593505050565b5f6020828403121561022d575f80fd5b8151610238816101dc565b939250505056fea2646970667358221220ff1eb0db77c240c565076d8c49436c9b2209c5f3e7f017f18d48e9567d34b9cc64736f6c63430008170033"
        }
    },
    "settings": {
        "compiler": {
            "version": "0.8.23+commit.f704f362"
        },
        "optimizer": {
            "enabled": true,
            "runs": 200
        },
        "evmVersion": "shanghai",
        "license": "MIT"
    },
    "args": {
        "from": "0x4e59b44847b379578588920ca78fbf26c0b4956c",
        "salt": "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
        "constructorArgs": ""
    },
    "networkAddresses": {
        "1": "canonical",
        "56": "canonical",
        "8453": "canonical",
        "42161": "canonical",
    },
    "abi": [
        {
            "type": "function",
            "name": "getAddressFromENS",
            "inputs": [
                {
                    "name": "ensRegistry",
                    "type": "address",
                    "internalType": "address"
                },
                {
                    "name": "node",
                    "type": "bytes32",
                    "internalType": "bytes32"
                }
            ],
            "outputs": [
                {
                    "name": "",
                    "type": "address",
                    "internalType": "address"
                }
            ],
            "stateMutability": "view"
        }
    ]
}
