import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
      
app.use(cors());
// app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist/')));

app.get('/hello', (req, res) => {
  res.send('Hello from our server!'); 
});

// Catch-all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/', 'index.html'));
});

const PORT = process.env.PORT || 8000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});  