const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 80;

// Configuration CORS - autoriser uniquement votre domaine
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || 'https://ai-agent.goungwamwe.com',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint proxy pour N8N
app.post('/api/webhook', async (req, res) => {
  try {
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN;

    if (!N8N_WEBHOOK_URL) {
      return res.status(500).json({ error: 'N8N webhook URL not configured' });
    }

    // Préparer les headers avec le token sécurisé
    const headers = {
      'Content-Type': 'application/json'
    };

    // Ajouter le token si configuré
    if (WEBHOOK_TOKEN) {
      headers['X-Webhook-Token'] = WEBHOOK_TOKEN;
    }

    // Faire la requête vers N8N
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    // Retourner la réponse de N8N au client
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Error forwarding to N8N:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: error.message
    });
  }
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log('Backend server running on port ' + PORT);
  console.log('Allowed origin: ' + (process.env.ALLOWED_ORIGIN || 'https://ai-agent.goungwamwe.com'));
});
