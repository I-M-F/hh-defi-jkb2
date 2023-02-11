// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
//import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

contract MarketInteractions is Ownable{
    //address payable owner;

    IPoolAddressesProvider public immutable aaveAddressProvider;
    IPool public immutable aavePool;

    address private immutable linkAddress =
        0x07C725d58437504CA5f814AE406e70E21C5e8e9e;
    IERC20 private link;

    event Borrow_Asset(address asset,uint256 amount, uint256 interestRateMode, uint256 referralCode, address onBehalfOf);

    constructor( address _addressProvider) {
        aaveAddressProvider = IPoolAddressesProvider(_addressProvider);
        aavePool = IPool(aaveAddressProvider.getPool());
       // owner = payable(msg.sender);
        link = IERC20(linkAddress);
        
    }
 
    function borrow(uint256 _amount, address _asset) public {
        address asset = _asset;
        uint256 amount = _amount;
        address onBehalfOf = address(this);
        uint16 referralCode = 0;
        uint256 interestRateMode = 0;

        aavePool.borrow(asset, amount, interestRateMode, referralCode, onBehalfOf);
        emit Borrow_Asset(asset, amount, interestRateMode, referralCode, onBehalfOf);

    }




}
