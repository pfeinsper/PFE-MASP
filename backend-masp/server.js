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

app.use(cors()); // Permite requisições do frontend
app.use(express.json()); // Habilita o uso de JSON nas requisições

// Rota de teste
app.get("/", (req, res) => {
  res.send("API do MASP está rodando!");
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Listar as obras
app.get("/obras", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM obras");
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar obras:", error);
      res.status(500).send("Erro no servidor");
    }
  });
  
// Listar os locais
app.get("/locais", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM locais");
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar locais:", error);
      res.status(500).send("Erro no servidor");
    }
  });
  
// Listar as movimentações
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

// Adicionar uma movimentação
app.post("/movimentacoes", async (req, res) => {
    try {
      const { obra_id, local_id } = req.body;
      
      if (!obra_id || !local_id) {
        return res.status(400).json({ error: "Obra e local são obrigatórios." });
      }
  
      const result = await pool.query(
        "INSERT INTO movimentacoes (obra_id, local_id) VALUES ($1, $2) RETURNING *",
        [obra_id, local_id]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao adicionar movimentação:", error);
      res.status(500).send("Erro no servidor");
    }
  });
  