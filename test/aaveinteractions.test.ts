import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { Contract } from "ethers"
import { ethers, network } from "hardhat"
import { MarketInteractions } from "../typechain-types"

const AAVE_POOL_ADDRESSES_PROVIDERV3 =
    "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb" //polygon
const DAI_ADDRESS = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
const A_DAI_ADDRESS = "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE"
const DAI_WHALE_ADDRESS = "0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8"
const AMOUNT_BORROW = ethers.utils.parseEther("10") // 1000n * 10n ** 6n;
const AMOUNT_SUPPLY = ethers.utils.parseEther("100")

describe("MarketInteractions", () => {
    let aaveMarketInteractions: MarketInteractions
    let accounts: SignerWithAddress[]
    let dai: Contract
    let aDai: Contract
    let daiWhale: SignerWithAddress

    beforeEach(async () => {
        accounts = await ethers.getSigners()

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_WHALE_ADDRESS],
        })

        dai = await ethers.getContractAt("IERC20", DAI_ADDRESS)
        aDai = await ethers.getContractAt("IERC20", A_DAI_ADDRESS)
        daiWhale = await ethers.getSigner(DAI_WHALE_ADDRESS)

        await dai.connect(daiWhale).transfer(accounts[0].address, AMOUNT_SUPPLY)
        //console.log(await dai.connect(daiWhale).transfer(accounts[0].address, AMOUNT_SUPPLY));
        // Deploy the contract
        const marketInteractionsFactory = await ethers.getContractFactory(
            "MarketInteractions"
        )
        aaveMarketInteractions = await marketInteractionsFactory.deploy(
            AAVE_POOL_ADDRESSES_PROVIDERV3
        )
        await aaveMarketInteractions.deployed()

        console.log(aaveMarketInteractions.address)
    })

    it("Contract should be set up to work with DAI", async () => {
        expect(await aaveMarketInteractions.getTokenAddress()).to.equal(
            DAI_ADDRESS
        )
    })

    it("Should supply liquidity to Aave", async () => {
        await dai
            .connect(accounts[0])
            .approve(
                aaveMarketInteractions.address,
                ethers.constants.MaxUint256
            )
        const balanceBefore = await dai.balanceOf(accounts[0].address)
        console.log(
            "Liquidity Supplied Before",
            ethers.utils.formatEther(balanceBefore)
        )
        await aaveMarketInteractions
            .connect(accounts[0])
            .supplyLiquidity(DAI_ADDRESS, AMOUNT_SUPPLY)
        const balanceAfter = await dai.balanceOf(accounts[0].address)
        console.log(
            "Liquidity Supplied After",
            ethers.utils.formatEther(balanceAfter)
        )
        const aDaiBalance = await aDai.balanceOf(aaveMarketInteractions.address)
        console.log("aDaiBalance ", ethers.utils.formatEther(aDaiBalance))
        
        expect(aDaiBalance).to.equal(AMOUNT_SUPPLY)
        expect(balanceAfter).to.equal(balanceBefore.sub(AMOUNT_SUPPLY))
    })

    it("Should borrow from Aave", async () => {
        await dai
            .connect(accounts[0])
            .approve(
                aaveMarketInteractions.address,
                ethers.constants.MaxUint256
            )
        await aaveMarketInteractions
            .connect(accounts[0])
            .supplyLiquidity(DAI_ADDRESS, AMOUNT_SUPPLY)
        await aaveMarketInteractions
            .connect(accounts[0])
            .borrow(AMOUNT_BORROW, DAI_ADDRESS)
        const daiBalance = await dai.balanceOf(aaveMarketInteractions.address)
        expect(daiBalance).to.equal(AMOUNT_BORROW)
    })
})
