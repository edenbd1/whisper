const { ethers } = require("ethers");
require("dotenv").config();

const CUSDC_ARTIFACT = require("../artifacts/contracts/ConfidentialUSDC.sol/ConfidentialUSDC.json");
const MARKET_ARTIFACT = require("../artifacts/contracts/WisprMarket.sol/WisprMarket.json");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://testnet.coti.io/rpc");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deployer:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "COTI\n");

  // Deploy ConfidentialUSDC
  console.log("--- Deploying ConfidentialUSDC ---");
  const cusdcFactory = new ethers.ContractFactory(
    CUSDC_ARTIFACT.abi,
    CUSDC_ARTIFACT.bytecode,
    wallet
  );
  const cusdc = await cusdcFactory.deploy({ gasLimit: 12_000_000 });
  console.log("TX sent:", cusdc.deploymentTransaction().hash);
  await cusdc.waitForDeployment();
  const cusdcAddress = await cusdc.getAddress();
  console.log("ConfidentialUSDC deployed to:", cusdcAddress);

  // Deploy WisprMarket
  console.log("\n--- Deploying WisprMarket ---");
  const marketFactory = new ethers.ContractFactory(
    MARKET_ARTIFACT.abi,
    MARKET_ARTIFACT.bytecode,
    wallet
  );
  const market = await marketFactory.deploy(cusdcAddress, { gasLimit: 5_000_000 });
  console.log("TX sent:", market.deploymentTransaction().hash);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("WisprMarket deployed to:", marketAddress);

  // Create initial markets
  console.log("\n--- Creating initial markets ---");
  const markets = [
    { question: "Will Bitcoin hit $200K before July 2026?", category: "Crypto", imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80", endTime: Math.floor(new Date("2026-07-01").getTime() / 1000) },
    { question: "Will the Iran war end within 4 weeks?", category: "Geopolitics", imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80", endTime: Math.floor(new Date("2026-04-02").getTime() / 1000) },
    { question: "Will Ethereum flip Bitcoin's market cap in 2026?", category: "Crypto", imageUrl: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=80", endTime: Math.floor(new Date("2026-12-31").getTime() / 1000) },
    { question: "Will AI pass the Turing test by end of 2026?", category: "Technology", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80", endTime: Math.floor(new Date("2026-12-31").getTime() / 1000) },
    { question: "Will France win the 2026 World Cup?", category: "Sports", imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80", endTime: Math.floor(new Date("2026-07-19").getTime() / 1000) },
    { question: "Will Elon Musk step down as CEO of Tesla?", category: "Business", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80", endTime: Math.floor(new Date("2026-12-31").getTime() / 1000) },
    { question: "Will a meme coin reach $100B market cap?", category: "Crypto", imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80", endTime: Math.floor(new Date("2026-12-31").getTime() / 1000) },
    { question: "Will there be confirmed alien contact by 2027?", category: "Conspiracy", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80", endTime: Math.floor(new Date("2027-01-01").getTime() / 1000) },
  ];

  for (let i = 0; i < markets.length; i++) {
    const m = markets[i];
    const tx = await market.createMarket(m.question, m.category, m.imageUrl, m.endTime, { gasLimit: 2_000_000 });
    await tx.wait();
    console.log(`  Market ${i}: "${m.question.substring(0, 40)}..."`);
  }

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("ConfidentialUSDC:", cusdcAddress);
  console.log("WisprMarket:", marketAddress);
  console.log("\nUpdate .env.local:");
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${cusdcAddress}`);
  console.log(`NEXT_PUBLIC_MARKET_ADDRESS=${marketAddress}`);

  // Check remaining balance
  const remaining = await provider.getBalance(wallet.address);
  console.log("\nRemaining balance:", ethers.formatEther(remaining), "COTI");
}

main().catch(console.error);
