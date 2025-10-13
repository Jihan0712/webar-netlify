// functions/config.js
const fs = require('fs').promises;
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '..', 'config.json');

// Default config
const DEFAULT_CONFIG = {
  markerName: 'my-logo', // 👈 Name of your marker files (without .fset)
  mediaType: 'image',
  mediaUrl: 'https://ar-js-org.github.io/AR.js/aframe/examples/image-tracking/nft/hirondelle.png'
};

// Ensure config file exists
async function ensureConfig() {
  try {
    await fs.access(CONFIG_FILE);
  } catch {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }
}

exports.handler = async (event) => {
  const ADMIN_PASSWORD = 'your_secure_password'; // 👈 CHANGE THIS!

  try {
    await ensureConfig();
    const method = event.httpMethod;

    if (method === 'GET') {
      // Return current config
      const data = await fs.readFile(CONFIG_FILE, 'utf8');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: data
      };
    }

    if (method === 'POST') {
      // Check password
      const body = JSON.parse(event.body);
      if (body.password !== ADMIN_PASSWORD) {
        return { statusCode: 403, body: 'Forbidden' };
      }

      // Save new config
      const newConfig = {
        markerName: body.markerName || 'my-logo',
        mediaType: body.mediaType || 'image',
        mediaUrl: body.mediaUrl || ''
      };
      await fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2));

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Saved!' })
      };
    }

    return { statusCode: 405, body: 'Method not allowed' };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: 'Server error' };
  }
};