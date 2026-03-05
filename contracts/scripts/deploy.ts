import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "COTI");

  // Deploy WhisperToken
  console.log("\n--- Deploying WhisperToken ---");
  const WhisperToken = await ethers.getContractFactory("WhisperToken");
  const token = await WhisperToken.deploy({ gasLimit: 12_000_000 });
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("WhisperToken deployed to:", tokenAddress);

  // Deploy WhisperMarket
  console.log("\n--- Deploying WhisperMarket ---");
  const WhisperMarket = await ethers.getContractFactory("WhisperMarket");
  const market = await WhisperMarket.deploy({ gasLimit: 5_000_000 });
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("WhisperMarket deployed to:", marketAddress);

  // Create some initial markets
  console.log("\n--- Creating initial markets ---");

  const markets = [
    {
      question: "Will Bitcoin hit $200K before July 2026?",
      category: "Crypto",
      imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
      endTime: Math.floor(new Date("2026-07-01").getTime() / 1000),
    },
    {
      question: "Will the Iran war end within 4 weeks?",
      category: "Geopolitics",
      imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
      endTime: Math.floor(new Date("2026-04-02").getTime() / 1000),
    },
    {
      question: "Will Ethereum flip Bitcoin's market cap in 2026?",
      category: "Crypto",
      imageUrl: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=80",
      endTime: Math.floor(new Date("2026-12-31").getTime() / 1000),
    },
    {
      question: "Will AI pass the Turing test by end of 2026?",
      category: "Technology",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      endTime: Math.floor(new Date("2026-12-31").getTime() / 1000),
    },
    {
      question: "Will France win the 2026 World Cup?",
      category: "Sports",
      imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
      endTime: Math.floor(new Date("2026-07-19").getTime() / 1000),
    },
    {
      question: "Will Elon Musk step down as CEO of Tesla?",
      category: "Business",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      endTime: Math.floor(new Date("2026-12-31").getTime() / 1000),
    },
    {
      question: "Will a meme coin reach $100B market cap?",
      category: "Crypto",
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
      endTime: Math.floor(new Date("2026-12-31").getTime() / 1000),
    },
    {
      question: "Will there be confirmed alien contact by 2027?",
      category: "Conspiracy",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
      endTime: Math.floor(new Date("2027-01-01").getTime() / 1000),
    },
  ];

  for (let i = 0; i < markets.length; i++) {
    const m = markets[i];
    const tx = await market.createMarket(
      m.question,
      m.category,
      m.imageUrl,
      m.endTime,
      { gasLimit: 2_000_000 }
    );
    await tx.wait();
    console.log(`  Market ${i}: "${m.question.substring(0, 40)}..."`);
  }

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("WhisperToken:", tokenAddress);
  console.log("WhisperMarket:", marketAddress);
  console.log("\nAdd to your .env.local:");
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`NEXT_PUBLIC_MARKET_ADDRESS=${marketAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
