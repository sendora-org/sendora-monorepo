// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IENSRegistry {
    function resolver(bytes32 node) external view returns (address);
}

interface IResolver {
    function addr(bytes32 node) external view returns (address);
}

contract ENSQuery {
    function getAddressFromENS(
        address ensRegistry,
        bytes32 node
    ) public view returns (address) {
        IENSRegistry registry = IENSRegistry(ensRegistry);
        address resolverAddress = registry.resolver(node);
        require(resolverAddress != address(0), "Resolver not found");

        IResolver resolver = IResolver(resolverAddress);
        address resolvedAddress = resolver.addr(node);
        require(resolvedAddress != address(0), "Address not found");

        return resolvedAddress;
    }
}
