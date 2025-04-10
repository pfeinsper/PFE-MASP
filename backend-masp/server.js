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
// 4.1. Listar todas as obras (para quem ainda quiser usar autocomplete, se necessário)
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
// 4.1.B. Buscar obra via QR/código (ex: ID da obra) -> /obras/codigo/:codigo
app.get("/obras/codigo/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;
    // Exemplo: se a coluna 'id' já guarda algo como "MASP.00610"
    const result = await pool.query("SELECT * FROM obras WHERE id = $1", [codigo]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Obra não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar obra pelo código:", error);
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
// 4.2.B. Buscar local via QR/código -> /locais/codigo/:codigo
app.get("/locais/codigo/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;
    // Se o 'id' da tabela locais for INT ou TEXT, use do mesmo jeito:
    const result = await pool.query("SELECT * FROM locais WHERE id = $1", [codigo]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Local não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar local pelo código:", error);
    res.status(500).send("Erro no servidor");
  }
});

// ---------------------------------------------------------
// 4.3. Listar todas as movimentações
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
    const { obra_id, local_id, usuario_id, tipo_movimentacao } = req.body;

    // Validações
    if (!obra_id || !local_id) {
      return res.status(400).json({ error: "Obra e local são obrigatórios." });
    }
    if (!usuario_id) {
      return res.status(400).json({ error: "Usuário é obrigatório." });
    }
    if (!tipo_movimentacao) {
      return res.status(400).json({ error: "Tipo de movimentação é obrigatório." });
    }

    // Faz INSERT, incluindo 'usuario_id' e subconsulta para usuario_nome
    const query = `
      INSERT INTO movimentacoes 
        (obra_id, local_id, obra_nome, local_nome, usuario_id, usuario_nome, tipo_movimentacao)
      VALUES (
        $1, 
        $2,
        (SELECT titulo FROM obras    WHERE id = $1),
        (SELECT nome   FROM locais   WHERE id = $2),
        $3,
        (SELECT nome   FROM usuarios WHERE id = $3),
        $4
      )
      RETURNING *;
    `;
    const values = [obra_id, local_id, usuario_id, tipo_movimentacao];

    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar movimentação:", error);
    return res.status(500).send("Erro no servidor");
  }
});

// ---------------------------------------------------------
// 4.5. Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// 4.6. Listar todos os usuários
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios ORDER BY nome");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).send("Erro no servidor");
  }
});
