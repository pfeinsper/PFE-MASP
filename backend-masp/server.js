require("dotenv").config(); 
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
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// Rota de teste: GET "/"
app.get("/", (req, res) => {
  res.send("API do MASP está rodando!");
});

// ---------------------------------------------------------
// 4.1. Listar todas as obras
app.get("/obras", async (req, res) => {
  try {
    const { search } = req.query;

    let query = "SELECT * FROM obras";
    let values = [];

    if (search) {
      // Se tiver parâmetro ?search=..., filtra por título ou id
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

// ---------------------------------------------------------
// 4.2. Listar todos os locais
app.get("/locais", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM locais");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar locais:", error);
    res.status(500).send("Erro no servidor");
  }
});

// ---------------------------------------------------------
// 4.3. Listar todas as movimentações
//     (aqui você optou por mostrar todos os campos da tabela movimentacoes)
app.get("/movimentacoes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM movimentacoes
      ORDER BY data_movimentacao DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    res.status(500).send("Erro no servidor");
  }
});

// ---------------------------------------------------------
// 4.4. Adicionar uma nova movimentação
app.post("/movimentacoes", async (req, res) => {
  try {
    // Pega obra_id, local_id do corpo da requisição (enviado pelo React)
    const { obra_id, local_id } = req.body;

    // Validação básica
    if (!obra_id || !local_id) {
      return res.status(400).json({ error: "Obra e local são obrigatórios." });
    }

    // Faz INSERT, mas usando subconsultas para buscar o nome da obra e local:
    // (SELECT titulo FROM obras WHERE id = $1) -> preenche 'obra_nome'
    // (SELECT nome   FROM locais WHERE id = $2) -> preenche 'local_nome'
    const result = await pool.query(
      `INSERT INTO movimentacoes (obra_id, local_id, obra_nome, local_nome)
       VALUES (
         $1,
         $2,
         (SELECT titulo FROM obras WHERE id = $1),
         (SELECT nome   FROM locais WHERE id = $2)
       )
       RETURNING *;`,
      [obra_id, local_id]
    );

    // Retorna a movimentação recém-criada, incluindo obra_nome e local_nome
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar movimentação:", error);
    return res.status(500).send("Erro no servidor");
  }
});

// ---------------------------------------------------------
// 4.5. Iniciar o servidor
app.listen(port, () => {
  console.log(`✅ Servidor rodando em http://localhost:${port}`);
});
