// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Configuração do PostgreSQL via .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middlewares
app.use(cors());
app.use(express.json());

/* ---------------------- 🔐 Middleware de autenticação ---------------------- */
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;         // "Bearer <token>"
  const token = authHeader?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.sendStatus(403);
    req.usuario = usuario;       // { id, nome }
    console.log("Usuário autenticado:", usuario.nome);
    next();
  });
}

// ---------------------------------------------------------
// Rota de teste
app.get("/", (req, res) => {
  res.send("API do MASP está rodando!");
});

// ---------------------------------------------------------
// 4.1. Listar todas as obras
app.get("/obras", async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM obras";
    const values = [];

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
// 4.4. Adicionar uma nova movimentação (protegida)
app.post("/movimentacoes", autenticarToken, async (req, res) => {
  try {
    const { obra_id, local_id, tipo_movimentacao } = req.body;
    const usuario_id = req.usuario.id;

    // Validações básicas
    if (!obra_id || !local_id) {
      return res.status(400).json({ error: "Obra e local são obrigatórios." });
    }
    if (!tipo_movimentacao) {
      return res.status(400).json({ error: "Tipo de movimentação é obrigatório." });
    }

    // Inserção com subconsultas para nomes
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

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar movimentação:", error);
    res.status(500).send("Erro no servidor");
  }
});

// ---------------------------------------------------------
// 4.5. Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// ---------------------------------------------------------
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

// ---------------------------------------------------------
// 4.7. Histórico de movimentações de uma obra
app.get("/movimentacoes/obra/:obra_id", async (req, res) => {
  try {
    const { obra_id } = req.params;
    const result = await pool.query(`
      SELECT 
        tipo_movimentacao,
        data_movimentacao AS data,
        local_nome,
        usuario_nome
      FROM movimentacoes
      WHERE obra_id = $1
      ORDER BY data_movimentacao DESC
      LIMIT 10
    `, [obra_id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar movimentações da obra:", error);
    res.status(500).send("Erro no servidor");
  }
});

// ---------------------------------------------------------
// 5.1 Login de usuários com verificação de senha e JWT
app.post("/login", async (req, res) => {
  const { nome, senha } = req.body;
  if (!nome || !senha) {
    return res.status(400).json({ error: "Nome e senha são obrigatórios" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE nome = $1",
      [nome]
    );
    const user = result.rows[0];
    if (!user || senha !== user.senha) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).send("Erro no servidor");
  }
});
