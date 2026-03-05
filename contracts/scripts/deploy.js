const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const RPC_URL = "https://testnet.coti.io/rpc";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Deploying with:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "COTI\n");

  // --- Deploy WhisperToken ---
  console.log("=== Deploying WhisperToken ===");
  const tokenArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/WhisperToken.sol/WhisperToken.json"),
      "utf8"
    )
  );

  const tokenFactory = new ethers.ContractFactory(
    tokenArtifact.abi,
    tokenArtifact.bytecode,
    wallet
  );

  const token = await tokenFactory.deploy({ gasLimit: 12_000_000 });
  console.log("Tx hash:", token.deploymentTransaction().hash);
  console.log("Waiting for confirmation...");
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("WhisperToken deployed to:", tokenAddress);
  console.log("Explorer:", `https://testnet.cotiscan.io/address/${tokenAddress}\n`);

  // --- Deploy WhisperMarket ---
  console.log("=== Deploying WhisperMarket ===");
  const marketArtifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../artifacts/contracts/WhisperMarket.sol/WhisperMarket.json"),
      "utf8"
    )
  );

  const marketFactory = new ethers.ContractFactory(
    marketArtifact.abi,
    marketArtifact.bytecode,
    wallet
  );

  const market = await marketFactory.deploy({ gasLimit: 5_000_000 });
  console.log("Tx hash:", market.deploymentTransaction().hash);
  console.log("Waiting for confirmation...");
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("WhisperMarket deployed to:", marketAddress);
  console.log("Explorer:", `https://testnet.cotiscan.io/address/${marketAddress}\n`);

  // --- Create initial markets ---
  console.log("=== Creating initial markets ===");
  const marketContract = new ethers.Contract(marketAddress, marketArtifact.abi, wallet);

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
    const tx = await marketContract.createMarket(
      m.question,
      m.category,
      m.imageUrl,
      m.endTime,
      { gasLimit: 2_000_000 }
    );
    await tx.wait();
    console.log(`  Market ${i}: "${m.question.substring(0, 50)}..."`);
  }

  // --- Summary ---
  const finalBalance = await provider.getBalance(wallet.address);
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("WhisperToken:", tokenAddress);
  console.log("WhisperMarket:", marketAddress);
  console.log("Remaining balance:", ethers.formatEther(finalBalance), "COTI");
  console.log("\nUpdate .env.local with:");
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`NEXT_PUBLIC_MARKET_ADDRESS=${marketAddress}`);
}

main().catch((err) => {
  console.error("DEPLOY ERROR:", err);
  process.exit(1);
});
