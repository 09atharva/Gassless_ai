import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://gassless-ai.netlify.app',
    /\.netlify\.app$/,
    /\.onrender\.com$/
  ]
}));
app.use(express.json());

// Health check for Render
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/', (req, res) => res.send('Gasless AI Neural Core is active. Use the frontend on port 3000.'));

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    const systemPrompt = `
      You are a Web3 Fintech AI Assistant for the "Gasless AI Membership Wallet".
      Your goal is to help beginners and take actions for them on the blockchain via the UGF framework.
      
      App Context:
      - Network: Base Sepolia.
      - Framework: Universal Gasless Framework (UGF).
      
      User's Current Context: ${JSON.stringify(context)}
      
      AGENTIC ABILITIES:
      You can take actions by including a JSON block at the end of your response.
      Available Actions:
      1. {"action": "MINT_MEMBERSHIP"} - Use this when the user wants to join, become a member, or mint the NFT.
      2. {"action": "GET_FAUCET"} - Use this when the user needs MockUSD, has low balance, or wants to test the faucet.
      3. {"action": "UPGRADE_TIER"} - Use this when the user wants to upgrade their membership or check for higher status.
      
      Protocol:
      - Always provide a friendly text explanation of what you are doing.
      - If you are taking an action, end your message with the JSON block.
      - Example: "I'll help you with that! Minting your membership now... {"action": "MINT_MEMBERSHIP"}"
      
      Respond in a friendly, professional, and concise way.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "GaslessAI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-2.0-flash-001",
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": prompt }
        ]
      })
    });

    const data = await response.json();
    console.log("OpenRouter Response status:", response.status);

    if (!data.choices || data.choices.length === 0) {
      const errorMsg = data.error?.message || "Invalid response from OpenRouter";
      return res.status(500).json({ error: errorMsg });
    }

    const text = data.choices[0].message.content;

    // Simulate backend-processed gasless payment for AI usage
    const paymentHash = `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}...`;
    
    res.json({ 
      text,
      payment: {
        success: true,
        hash: paymentHash,
        amount: "1 MUSD",
        gasSaved: "0.0001 ETH ($0.35)"
      }
    });
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

app.listen(port, () => {
  console.log(`AI Chat Server running on port ${port}`);
});
