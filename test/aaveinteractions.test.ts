import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers, network } from "hardhat";
import { MarketInteractions } from "../typechain-types";


const AAVE_POOL_ADDRESSES_PROVIDERV3: string = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb"; //polygon
const DAI: string = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
const aDAI_ADDRESS: string = "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE";
const DAI_WHALE: string = "0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8";
const AMOUNT_SUPPLY = ethers.utils.parseEther("0.01");//1000n * 10n ** 6n; 
const amount = ethers.utils.parseEther("10");


describe("MarketInteractions", () => {
    let aaveMarketInteractions: MarketInteractions;
    let accounts: SignerWithAddress[];
    let dai: Contract;
    let aDAI: Contract;
    let daiWhale: SignerWithAddress;


  

    beforeEach(async () => {
          
        accounts = await ethers.getSigners();

         await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_WHALE]
         });
        
        dai = await ethers.getContractAt("IERC20", DAI);
        aDAI = await ethers.getContractAt("IERC20", aDAI_ADDRESS)
        daiWhale = await ethers.getSigner(DAI_WHALE);

        await dai.connect(daiWhale).transfer(accounts[0].address, AMOUNT_SUPPLY);
        // Deploy the contract
        const MarketInteractionsFactory = await ethers.getContractFactory("MarketInteractions");
            aaveMarketInteractions = await MarketInteractionsFactory.deploy(AAVE_POOL_ADDRESSES_PROVIDERV3);
        await aaveMarketInteractions.deployed()
        //console.log(accounts.address);
        

        });
    
        it("Contract should be set up to work with dai", async () => {
        // await aaveMarketInteractions.deployed()
            expect(await aaveMarketInteractions.getTokenAddress()).to.eq(DAI);
        });
    
        it("Should have a valid address provider", async () => {
            const addressProvider = await aaveMarketInteractions.aaveAddressProvider();
            expect(addressProvider).to.equal(AAVE_POOL_ADDRESSES_PROVIDERV3);
        });

        it("Should be able to borrow an asset", async () => {
             
            
           
            await aaveMarketInteractions.borrow(amount, DAI);

            // Check if the borrow event is emitted with the correct parameters
            const borrowEvent = await aaveMarketInteractions.filters.Borrow_Asset();
            const eventArgs = await aaveMarketInteractions.queryFilter(borrowEvent);

            expect(eventArgs.length).to.equal(1);
            expect(eventArgs[0].args.asset).to.equal(DAI);
            expect(eventArgs[0].args.amount).to.equal(amount);

            // Check if the contract has borrowed the correct amount of tokens
            const token = await ethers.getContractAt("ERC20", DAI);
            const contractTokenBalance = await token.balanceOf(aaveMarketInteractions.address);
            expect(contractTokenBalance).to.equal(amount);

            // Check if the AavePool contract has received the borrowed tokens
            const aavePoolTokenBalance = await token.balanceOf(AAVE_POOL_ADDRESSES_PROVIDERV3);
            expect(aavePoolTokenBalance).to.equal(amount);

      
        });
    
    
    
        

})