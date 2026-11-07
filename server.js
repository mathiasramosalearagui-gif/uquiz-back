require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB via Mongoose
if (!MONGO_URI) {
  console.error('❌ MONGODB_URI não foi configurada nas variáveis de ambiente!');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('🔥 Conectado ao MongoDB com sucesso via Mongoose!'))
    .catch(err => console.error('❌ Erro na conexão com o MongoDB:', err));
}

// Schema e Model do Mongoose
// Schema e Model do Mongoose
const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  score: { type: Number, required: true },
  level: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'user' }); // <-- Adicionado aqui!

const Score = mongoose.model('Score', scoreSchema);
// ROTAS DA API

// GET /api/ranking - Retorna os Top 10 jogadores ordenados por pontuação
app.get('/api/ranking', async (req, res) => {
  try {
    const topScores = await Score.find()
      .sort({ score: -1, createdAt: 1 })
      .limit(10);
    return res.status(200).json(topScores);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar o ranking.' });
  }
});

// POST /api/ranking - Cadastra uma nova pontuação
app.post('/api/ranking', async (req, res) => {
  try {
    const { name, score, level } = req.body;

    if (!name || score === undefined || !level) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios (name, score, level).' });
    }

    const newScore = new Score({
      name,
      score: Number(score),
      level
    });

    await newScore.save();
    return res.status(201).json({ message: 'Pontuação cadastrada com sucesso!', data: newScore });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao salvar a pontuação.' });
  }
});

// Rota de Healthcheck
app.get('/', (req, res) => {
  res.send('🚀 API do UQuiz rodando normalmente!');
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});