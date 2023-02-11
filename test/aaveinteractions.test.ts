import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, network } from "hardhat";
import { AaveV3Interactions } from "../typechain-types";


const AAVE_POOL_ADDRESSES_PROVIDERV3: string = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb"; //polygon
const DAI: string = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
const aDAI: string = "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE";
const DAI_WHALE: string = "0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8";
const AMOUNT_SUPPLY = ethers.utils.parseEther("0.01");//1000n * 10n ** 6n; 

describe("MarketInteractions Contract", () => {
  let accounts: SignerWithAddress[];
  let dai: Contract;
  let aDAI: Contract;
  let daiWhale: SignerWithAddress;
  let aaveV3Interactions: AaveV3Interactions;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE]
    });

    dai = await ethers.getContractAt("IERC20", DAI);
    aDAI = await ethers.getContractAt("IERC20", aDAI);
    daiWhale = await ethers.getSigner(DAI_WHALE);

    await dai.connect(daiWhale).borrow(accounts[0].address, AMOUNT_SUPPLY);

    const aaveV3InteractionsFactory = await ethers.getContractFactory("AaveV3Interactions");
    aaveV3Interactions = await aaveV3InteractionsFactory.deploy(DAI, AAVE_POOL_ADDRESSES_PROVIDERV3);
    await aaveV3Interactions.deployed();
  });

  it("Contract should be set up to work with DAI", async () => {
    expect(await aaveV3Interactions.getTokenAddress()).to.equal(DAI);
  });

  it("Should have a valid address provider", async () => {
    const addressProvider = await aaveV3Interactions.aaveAddressProvider();
    expect(addressProvider).to.equal(AAVE_POOL_ADDRESSES_PROVIDERV3);
  });

it("Should be able to borrow an asset", async () => {
  const assetAddress = "0x0000000000000000000000000000000000000001";
  await aaveV3Interactions.borrow(AMOUNT_SUPPLY, assetAddress);
  const borrowedAsset = await aaveV3Interactions.aavePool.borrowedAssets(assetAddress, accounts[0].address);
  expect(borrowedAsset).to.equal(AMOUNT_SUPPLY);
});
});



