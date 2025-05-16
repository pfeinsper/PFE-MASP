require("dotenv").config();
process.env.TZ = "America/Sao_Paulo"; 
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { DateTime } = require("luxon"); 

const app = express();
const port = process.env.PORT || 5000;

// Configuração do PostgreSQL via .env
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// ─── força o timezone do pool para São Paulo ─────────────────────────
(async () => {
  const client = await pool.connect();
  try {
    await client.query(`SET TIME ZONE 'America/Sao_Paulo';`);
    console.log("Timezone do Postgre ajustado para America/Sao_Paulo");
  } finally {
    client.release();
  }
})();

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de autenticação
function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.sendStatus(403);
    req.usuario = usuario;
    console.log("Usuário autenticado:", usuario.nome);
    next();
  });
}

// Rota de teste
app.get("/", (req, res) => {
  res.send("API do MASP está rodando!");
});

// Listar obras
app.get("/obras", async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM obras";
    const values = [];

    if (search) {
      query += " WHERE titulo ILIKE $1 OR id::TEXT ILIKE $1 OR autoria ILIKE $1";
      values.push(`%${search}%`);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar obras:", error);
    res.status(500).send("Erro no servidor");
  }
});


// Buscar obra por código
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

// Listar locais
app.get("/locais", async (req, res) => {
  try {
    const { search } = req.query;

    let query = "SELECT * FROM locais";
    const values = [];

    if (search) {
      // Verifica se é um número inteiro positivo
      if (/^\d+$/.test(search)) {
        // Busca por ID exato
        query += " WHERE id = $1";
        values.push(parseInt(search, 10));
      } else {
        // Busca por nome com ILIKE %search%
        query += " WHERE nome ILIKE $1";
        values.push(`%${search}%`);
      }
    }

    query += " ORDER BY nome";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar locais:", error);
    res.status(500).send("Erro no servidor");
  }
});



// Buscar local por código
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

// Listar movimentações
app.get("/movimentacoes", async (req, res) => {
  try {
    const { data_inicio, data_fim, usuario_nome, local_nome, obra_id, local_id, tipo_movimentacao, search } = req.query;

    let query = `
      SELECT 
        m.id, m.obra_id, m.local_id, m.obra_nome, m.local_nome, m.usuario_id, m.usuario_nome, m.tipo_movimentacao, m.data_movimentacao,
        o.autoria
      FROM movimentacoes m
      LEFT JOIN obras o ON o.id = m.obra_id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    // Filtros para data_inicio
    if (data_inicio) {
      query += ` AND data_movimentacao >= $${paramIndex}`;
      values.push(data_inicio);
      paramIndex++;
    }

    // Filtros para data_fim
    if (data_fim) {
      const fimDoDia = DateTime.fromISO(data_fim, { zone: "America/Sao_Paulo" }).endOf('day').toISO();
      query += ` AND data_movimentacao <= $${paramIndex}`;
      values.push(fimDoDia);
      paramIndex++;
    }

    // Filtros para usuario_nome
    if (usuario_nome) {
      query += ` AND usuario_nome ILIKE $${paramIndex}`;
      values.push(`%${usuario_nome}%`);
      paramIndex++;
    }

    // Filtros para local_nome
    if (local_nome) {
      query += ` AND local_nome ILIKE $${paramIndex}`;
      values.push(`%${local_nome}%`);
      paramIndex++;
    }

    // Filtros para obra_id
    if (obra_id) {
      query += ` AND obra_id = $${paramIndex}`;
      values.push(obra_id);
      paramIndex++;
    }

    // Filtros para local_id
    if (local_id) {
      query += ` AND local_id = $${paramIndex}`;
      values.push(local_id);
      paramIndex++;
    }

    // Filtros para tipo_movimentacao
    if (tipo_movimentacao) {
      query += ` AND tipo_movimentacao = $${paramIndex}`;
      values.push(tipo_movimentacao);
      paramIndex++;
    }

    if (search) {
      query += ` AND (obra_nome ILIKE $${paramIndex} OR local_nome ILIKE $${paramIndex} OR usuario_nome ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }


    // Organizando os resultados pela data de movimentação
    query += " ORDER BY data_movimentacao DESC";

    // Log para depuração
    console.log("Query recebida:", req.query); // Parâmetros da URL
    console.log("Query SQL gerada:", query);  // Sua query final
    console.log("Valores dos parâmetros:", values); // Valores usados na query
    console.log("Query params recebidos:", req.query);
    console.log("Query SQL gerada:", query);
    console.log("Valores dos parâmetros:", values);

    // Executando a consulta no banco de dados
    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);
    res.status(500).send("Erro no servidor");
  }
});


// Adicionar movimentação
app.post("/movimentacoes", autenticarToken, async (req, res) => {
  try {
    const { obra_id, local_id, tipo_movimentacao } = req.body;
    const usuario_id = req.usuario.id;

    if (!obra_id || !local_id) {
      return res.status(400).json({ error: "Obra e local são obrigatórios." });
    }
    if (!tipo_movimentacao) {
      return res.status(400).json({ error: "Tipo de movimentação é obrigatório." });
    }

    // ✅ Data correta com fuso de São Paulo
    const dataMovimentacao = DateTime.now()
      .setZone("America/Sao_Paulo")
      .toISO(); // ex: "2025-05-13T15:15:00.000-03:00"

    const query = `
      INSERT INTO movimentacoes
        (obra_id, local_id, obra_nome, local_nome, usuario_id, usuario_nome, tipo_movimentacao, data_movimentacao)
      VALUES (
        $1::varchar,
        $2::integer,
        (SELECT titulo FROM obras WHERE id = $1::varchar),
        (SELECT nome FROM locais WHERE id = $2::integer),
        $3::integer,
        (SELECT nome FROM usuarios WHERE id = $3::integer),
        $4::varchar,
        $5::timestamptz
      )
      RETURNING *;
    `;

    const values = [obra_id, local_id, usuario_id, tipo_movimentacao, dataMovimentacao];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar movimentação:", error);
    res.status(500).send("Erro no servidor");
  }
});

// Listar usuários
app.get("/usuarios", async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM usuarios";
    const values = [];

    if (search) {
      query += " WHERE nome ILIKE $1";
      values.push(`%${search}%`);
    }

    query += " ORDER BY nome";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).send("Erro no servidor");
  }
});


// Histórico de movimentações de uma obra
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

// Login com JWT
app.post("/login", async (req, res) => {
  const { nome, senha } = req.body;
  if (!nome || !senha) {
    return res.status(400).json({ error: "Nome e senha são obrigatórios" });
  }

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE nome = $1", [nome]);
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

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});