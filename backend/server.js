import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*", // 🔒 TODO: restrict to your frontend in production
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// === 🌍 Environment Variables ===
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const AIML_API_KEY = process.env.AIML_API_KEY;

// === ⚙️ Validation ===
if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID)
  console.warn("⚠️ Missing ElevenLabs API credentials. Voice generation disabled.");

if (!AIML_API_KEY)
  console.warn("⚠️ Missing AIML API key. AI Assistant replies disabled.");

// === 🧩 Utility: Generate human-friendly messages ===
function generateMessage(action, address) {
  const user = address ? address.slice(0, 6) : "User";
  switch (action) {
    case "wallet_connected":
      return `🎉 Wallet connected: ${user}! You can now manage your subscriptions.`;
    case "wallet_connection_failed":
      return `⚠️ Wallet connection failed! Please check your wallet and try again.`;
    case "subscribed":
      return `🎉 Subscription confirmed on-chain, ${user}! Welcome aboard Dreamster.`;
    case "unsubscribed":
      return `Your subscription has been cancelled, ${user}. You can rejoin anytime.`;
    case "renewed":
      return `👏 Subscription renewed successfully, ${user}. You’re all set for another month!`;
    case "reminder_due":
      return `⏰ Hey ${user}, your subscription payment is due soon. Make sure you have enough USDC.`;
    default:
      return `Hello ${user}, your subscription activity has been recorded.`;
  }
}

// === 🧠 AI Assistant (Chat) Endpoint ===
app.post("/ask-ai", async (req, res) => {
  try {
    const { query } = req.body;

    if (!AIML_API_KEY)
      return res.status(503).json({ reply: "⚠️ AIML API key not configured." });

    if (!query?.trim())
      return res.status(400).json({ reply: "⚠️ Please enter a valid question." });

    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIML_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are Dreamster’s subscription assistant. Respond conversationally and helpfully about user subscriptions, payments, and renewals.",
          },
          { role: "user", content: query },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ AIML API Error:", text);
      return res.status(500).json({ reply: "⚠️ AIML API request failed." });
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "⚠️ Sorry, I couldn’t generate a response.";

    console.log("🧠 AI Reply:", reply);
    res.json({ reply });
  } catch (err) {
    console.error("⚠️ AIML /ask-ai error:", err);
    res.status(500).json({ reply: "⚠️ Assistant unavailable right now." });
  }
});


// === 🗣️ Text-to-Speech Endpoint ===
app.post("/speak", async (req, res) => {
  try {
    const { text, action, address } = req.body;
    const message = text || generateMessage(action, address);

    if (!message) return res.status(400).send("Missing text to speak");

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID)
      return res.status(503).json({ error: "Voice API not configured" });

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.3,
            similarity_boost: 0.85,
            style: 0.65,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("❌ ElevenLabs API Error:", errorText);
      return res.status(500).json({ error: "Voice generation failed" });
    }

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": "inline; filename=response.mp3",
    });

    ttsResponse.body.pipe(res);
  } catch (err) {
    console.error("⚠️ TTS Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === 💳 Subscriptions Endpoint (Demo) ===
const mockSubscriptions = {
  "0x123abc": [
    { name: "Dreamster Music", status: "active", renews: "2025-12-01" },
    { name: "Dreamster Wallet Pro", status: "trial", renews: "2025-11-10" },
  ],
  "0x999xyz": [
    { name: "Dreamster Market Premium", status: "expired", renews: null },
  ],
};

app.get("/subscriptions/:address", (req, res) => {
  const { address } = req.params;
  const subs = mockSubscriptions[address.toLowerCase()] || [];
  res.json({ address, subscriptions: subs });
});

// === 🧭 Health Check ===
app.get("/", (req, res) => {
  res.send("✅ Dreamster AI + Voice Server is running");
});

// === 🚀 Start Server ===
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🎙️ Dreamster server running on http://localhost:${PORT}`)
);
