import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { main } from './main.js';
import { configDotenv } from "dotenv";
import { allStrategiesConfig, run_config_manager } from './config_manager.js';
configDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loginRequest = {
  secretKey: process.env.secretKey,
  appKey: process.env.appKey,
  source: process.env.source
};

main(loginRequest)
run_config_manager();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist/')));

app.post('/get-all-strategy-name', (req, res) => {
  res.status(200).json({ names: [...Object.keys(allStrategiesConfig)] });
});

app.post('/get-strategy-config', (req, res) => {
  const { strategyName } = req.body
  if (!strategyName) {
    return res.status(400).json({ error: 'strategy name is required.' });
  }
  // console.log(strategyName)
  // console.log(allStrategiesConfig)
  res.status(200).json(allStrategiesConfig[strategyName]);
});

app.get('/hello', (req, res) => {
  res.send('Hello from the server!');
});

// Catch-all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/', 'index.html'));
});

const PORT = process.env.PORT || 8000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});  