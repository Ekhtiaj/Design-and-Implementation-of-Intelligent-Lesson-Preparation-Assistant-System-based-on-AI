const express = require('express');
const path = require('path');
const fs = require('fs');

// Load .env file - try multiple methods
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
console.log('.env exists:', fs.existsSync(envPath));

// Method 1: Try dotenv
require('dotenv').config({ path: envPath });

// Method 2: Always manually parse to ensure it works
if (fs.existsSync(envPath)) {
  console.log('Parsing .env file...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const equalIndex = trimmed.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      process.env[key] = cleanValue;
      console.log(`  Loaded: ${key}`);
    }
  }
} else {
  console.error('ERROR: .env file not found at:', envPath);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Generate config.js file from .env on server start
const generateConfigJS = () => {
  const escapeForJS = (str) => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')  // Escape backslashes
      .replace(/'/g, "\\'")     // Escape single quotes
      .replace(/"/g, '\\"')     // Escape double quotes
      .replace(/\n/g, '\\n')    // Escape newlines
      .replace(/\r/g, '\\r');   // Escape carriage returns
  };

  const apiKey = escapeForJS(process.env.API_KEY || '');
  const youtubeKey = escapeForJS(process.env.YOUTUBE_API_KEY || '');
  const apiUrl = escapeForJS(process.env.API_URL || 'https://openrouter.ai/api/v1/chat/completions');
  const model = escapeForJS(process.env.MODEL || 'deepseek/deepseek-r1-distill-llama-70b:free');

  const configContent = `const API_KEY = '${apiKey}';
const API_URL = "${apiUrl}";
const MODEL = "${model}";
const apiKey = '${youtubeKey}';`;

  const configPath = path.join(__dirname, 'js', 'config.js');
  
  // Ensure js directory exists
  const jsDir = path.dirname(configPath);
  if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log('Config.js file generated successfully at:', configPath);
  console.log('API_KEY loaded:', process.env.API_KEY ? 'YES (length: ' + process.env.API_KEY.length + ')' : 'NO');
  console.log('YOUTUBE_API_KEY loaded:', process.env.YOUTUBE_API_KEY ? 'YES (length: ' + process.env.YOUTUBE_API_KEY.length + ')' : 'NO');
  
  // Debug: Show actual values (masked)
  if (process.env.API_KEY) {
    console.log('API_KEY value:', '***' + process.env.API_KEY.slice(-10));
  }
  if (process.env.YOUTUBE_API_KEY) {
    console.log('YOUTUBE_API_KEY value:', '***' + process.env.YOUTUBE_API_KEY.slice(-10));
  }
};

// Generate config.js on server start
generateConfigJS();

// Serve static files
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
