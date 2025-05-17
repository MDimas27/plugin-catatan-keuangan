const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());

let transactions = [];

app.get('/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/transactions', (req, res) => {
  const { type, amount, description } = req.body;
  if (!type || !amount) return res.status(400).json({ error: "Missing fields" });
  const newTrans = { id: Date.now(), type, amount, description };
  transactions.push(newTrans);
  res.status(201).json(newTrans);
});

app.get('/balance', (req, res) => {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') income += t.amount;
    else if (t.type === 'expense') expense += t.amount;
  });
  res.json({ income, expense, balance: income - expense });
});

const ROOT_DIR = path.resolve(__dirname, '..');
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'openapi.yaml'));
});
app.get('/.well-known/ai-plugin.json', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'ai-plugin.json'));
});
app.get('/logo.png', (req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'logo.png')); // optional
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Plugin server running on http://localhost:${PORT}`));
