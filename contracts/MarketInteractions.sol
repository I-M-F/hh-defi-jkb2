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

contract MarketInteractions is Ownable {
    //address payable owner;

    IPoolAddressesProvider public immutable aaveAddressProvider;
    IPool public immutable aavePool;

    address private immutable daiAddress =
        0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;
    IERC20 private dai;

    uint256 private constant MAX_INT =
        115792089237316195423570985008687907853269984665640564039457584007913129639935;

    event Borrow_Asset(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint256 referralCode,
        address onBehalfOf
    );
    event Supplied_Liquidity(
        address suppliedToken,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    );

    constructor(address _addressProvider) {
        aaveAddressProvider = IPoolAddressesProvider(_addressProvider);
        aavePool = IPool(aaveAddressProvider.getPool());
        // owner = payable(msg.sender);
        dai = IERC20(daiAddress);
    }

    function supplyLiquidity(address _tokenAddress, uint256 _amount) external {
        address asset = _tokenAddress;
        uint256 amount = _amount;
        address onBehalfOf = address(this);
        uint16 referralCode = 0;
        IERC20(_tokenAddress).approve(address(aavePool), MAX_INT);

        aavePool.deposit(asset, amount, onBehalfOf, referralCode);
        emit Supplied_Liquidity(
            _tokenAddress,
            amount,
            onBehalfOf,
            referralCode
        );
    }

    function borrow(uint256 _amount, address _asset) public {
        address asset = _asset;
        uint256 amount = _amount;
        address onBehalfOf = address(this);
        uint16 referralCode = 0;
        uint256 interestRateMode = 0;

        aavePool.borrow(
            asset,
            amount,
            interestRateMode,
            referralCode,
            onBehalfOf
        );
        emit Borrow_Asset(
            asset,
            amount,
            interestRateMode,
            referralCode,
            onBehalfOf
        );
    }

    function getTokenAddress() public view returns (address) {
        return address(dai);
    }
}
