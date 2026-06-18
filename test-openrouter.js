const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const API_KEY = process.env.OPENROUTER_API_KEY;
  console.log("Key:", API_KEY ? "Loaded" : "Missing");
  
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [{ role: 'user', content: 'test' }]
    })
  });
  
  const data = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

test();
