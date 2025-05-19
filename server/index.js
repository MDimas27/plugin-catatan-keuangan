const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET || "pluginRahasia123";

const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());
app.use(express.json());

let transactions = [];

app.get('/transactions', verifyToken, (req, res) => {
  res.json(transactions);
});

app.post('/transactions', verifyToken, (req, res) => {
  const { type, amount, description } = req.body;
  if (!type || !amount) return res.status(400).json({ error: "Missing fields" });
  const newTrans = { id: Date.now(), type, amount, description };
  transactions.push(newTrans);
  res.status(201).json(newTrans);
});

app.get('/balance', verifyToken, (req, res) => {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') income += t.amount;
    else if (t.type === 'expense') expense += t.amount;
  });
  res.json({ income, expense, balance: income - expense });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    const token = jwt.sign({ user: "admin "}, SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing "});
  }

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch(err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.get('/export/pdf', verifyToken, (req, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=laporan.pdf');
  doc.pipe(res);

  doc.fontSize(18).text('Laporan Transaksi Keuangan', { align: 'center' });
  doc.moveDown();

  transactions.forEach((t, i) => {
    doc.fontSize(12).text(`${i + 1}. [${t.type}] Rp${t.amount} - ${t.description}`);
  });

  doc.end();
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
