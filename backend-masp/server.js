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
// 4.1.B. Buscar obra via QR/código
app.get("/obras/codigo/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;

    // obras.id = character varying
    // $1 sem cast explícito, pois "id" é varchar
    const result = await pool.query(
      "SELECT * FROM obras WHERE id = $1",
      [codigo]
    );

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
// 4.2.B. Buscar local via QR/código
app.get("/locais/codigo/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;

    // locais.id = integer
    // Forçando cast ::integer
    const result = await pool.query(
      "SELECT * FROM locais WHERE id = $1::integer",
      [codigo]
    );

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
      return res
        .status(400)
        .json({ error: "Obra e local são obrigatórios." });
    }
    if (!usuario_id) {
      return res
        .status(400)
        .json({ error: "Usuário é obrigatório." });
    }
    if (!tipo_movimentacao) {
      return res
        .status(400)
        .json({ error: "Tipo de movimentação é obrigatório." });
    }

    // Ajuste de cast:
    // - obra_id ::varchar (ex.: 'MASP.00690')
    // - local_id ::integer (ex.: 3009)
    // - usuario_id ::integer
    // - tipo_movimentacao ::varchar
    // subconsultas idem
    const query = `
      INSERT INTO movimentacoes
        (obra_id, local_id, obra_nome, local_nome, usuario_id, usuario_nome, tipo_movimentacao)
      VALUES (
        $1::varchar,
        $2::integer,
        (SELECT titulo FROM obras WHERE id = $1::varchar),
        (SELECT nome   FROM locais WHERE id = $2::integer),
        $3::integer,
        (SELECT nome   FROM usuarios WHERE id = $3::integer),
        $4::varchar
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
