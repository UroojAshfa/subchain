
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";

// ---- Environment Variables ----
const RPC_URL = process.env.ARC_TESTNET_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!RPC_URL || !CONTRACT_ADDRESS || !ELEVEN_API_KEY) {
  console.error("❌ Missing environment variables in .env file");
  process.exit(1);
}

// ---- Load Contract ABI ----
const ABI_PATH = path.resolve("./SubscriptionManagerABI.json");
const ABI = JSON.parse(fs.readFileSync(ABI_PATH, "utf-8"));
const network = {
  name: "arc-testnet",
  chainId: 5042002, // replace with Arc’s actual chain ID if different
};

// ---- Initialize Providers ----
const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL, network);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// ---- ElevenLabs Setup ----
const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVEN_API_KEY,
});

// ---- Utility: Generate AI Voice ----
async function generateVoiceMessage(subscriber, type) {
  const emotion =
    type === "SubscriptionCreated" ? "happy and welcoming" : "sad but respectful";

  const message =
    type === "SubscriptionCreated"
      ? `Welcome aboard! We're thrilled to have you as a subscriber.`
      : `Goodbye! Your subscription has been cancelled. We hope to see you again soon.`;

  console.log(`🎙 Generating ${emotion} voice for ${subscriber} (${type})...`);

  try {
    const audio = await elevenlabs.textToSpeech.convert({
      voice: "Rachel",
      text: message,
      model_id: "eleven_turbo_v2",
      output_format: "mp3_44100_128",
    });

    const outputDir = "./audios";
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const filename = `${outputDir}/${subscriber}_${type}.mp3`;
    fs.writeFileSync(filename, Buffer.from(await audio.arrayBuffer()));

    console.log(`✅ Voice message saved: ${filename}`);
  } catch (error) {
    console.error(`❌ ElevenLabs voice generation failed:`, error.message);
  }
}

// ---- Core: Watch Blockchain ----
async function watchSubscriptions() {
  console.log(`👀 Watching contract ${CONTRACT_ADDRESS} for subscription activity...`);

  provider.on("block", async (blockNumber) => {
    try {
      const block = await provider.getBlock(blockNumber, true);
      if (!block || !block.transactions) return;

      for (const tx of block.transactions) {
        if (!tx.to) continue;

        if (tx.to.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
          const input = contract.interface.parseTransaction({ data: tx.data });
          if (!input) continue;

          const fnName = input.name;
          const subscriber = tx.from;

          if (fnName === "createSubscription") {
            console.log(`📦 New Subscription Created by: ${subscriber}`);
            await generateVoiceMessage(subscriber, "SubscriptionCreated");
          } else if (fnName === "cancelSubscription") {
            console.log(`🗑 Subscription Cancelled by: ${subscriber}`);
            await generateVoiceMessage(subscriber, "SubscriptionCancelled");
          }
        }
      }
    } catch (err) {
      console.error(`⚠️ Block ${blockNumber} processing error:`, err.message);
    }
  });
}

watchSubscriptions();
