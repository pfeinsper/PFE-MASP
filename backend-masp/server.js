
require("dotenv").config(); // Carrega variáveis de ambiente do arquivo .env
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

// Configuração do PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "masp_db",
  password: process.env.DB_PASSWORD || "admin",
  port: process.env.DB_PORT || 5432,
});

// Middlewares
app.use(cors()); // Permite requisições do frontend
app.use(express.json()); // Habilita o uso de JSON nas requisições

// 🚀 **Rota de teste**
app.get("/", (req, res) => {
  res.send("API do MASP está rodando!");
});

// ✅ **Listar todas as obras**
app.get("/obras", async (req, res) => {
    try {
        const { search } = req.query; // Obtém o termo de busca da URL

        let query = "SELECT * FROM obras";
        let values = [];

        if (search) {
            query += " WHERE titulo ILIKE $1 OR id::TEXT ILIKE $1";
            values.push(`%${search}%`);
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar obras:", error);
        res.status(500).send("Erro no servidor");
    }
});


// ✅ **Listar todos os locais**
app.get("/locais", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM locais");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar locais:", error);
    res.status(500).send("Erro no servidor");
  }
});

// ✅ **Listar todas as movimentações (com nomes das obras e locais)**
app.get("/movimentacoes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, o.titulo AS obra_nome, l.nome AS local_nome, m.data_movimentacao 
      FROM movimentacoes m
      JOIN obras o ON m.obra_id = o.id
      JOIN locais l ON m.local_id = l.id
      ORDER BY m.data_movimentacao DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    res.status(500).send("Erro no servidor");
  }
});

// ✅ **Adicionar uma nova movimentação**
app.post("/movimentacoes", async (req, res) => {
    try {
        const { obra_id, local_id } = req.body;

        if (!obra_id || !local_id) {
            return res.status(400).json({ error: "Obra e local são obrigatórios." });
        }

        // Inserindo no banco
        const result = await pool.query(
            "INSERT INTO movimentacoes (obra_id, local_id) VALUES ($1, $2) RETURNING *",
            [obra_id, local_id]
        );

        res.status(201).json(result.rows[0]); // Retorna a movimentação inserida
    } catch (error) {
        console.error("Erro ao adicionar movimentação:", error);
        res.status(500).send("Erro no servidor");
    }
});

// ✅ **Iniciar o servidor**
app.listen(port, () => {
  console.log(`✅ Servidor rodando em http://localhost:${port}`);
});
