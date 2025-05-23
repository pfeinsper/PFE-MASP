require("dotenv").config();
process.env.TZ = "America/Sao_Paulo";

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { DateTime } = require("luxon");

const app = express();
const port = process.env.PORT || 5000;

// Detecta se ambiente é produção
const isProduction = process.env.NODE_ENV === "production";

// Conexão com o PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Garante timezone para cada nova conexão do pool
pool.on("connect", async (client) => {
  try {
    await client.query("SET TIME ZONE 'America/Sao_Paulo'");
    console.log("✅ Timezone configurado para America/Sao_Paulo");
  } catch (err) {
    console.error("❌ Erro ao configurar timezone:", err);
  }
});

// Middlewares
const corsOptions = {
  origin: [
    "https://pfe-masp.onrender.com",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));

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

//
// ======== Endpoints de Obras usando API do MASP ========
//

// Listar obras (com filtro por número de tombo via filtro5)
app.get("/obras", async (req, res) => {
  try {
    const { search } = req.query;
    const params = new URLSearchParams({
      nPaginas: "1",
      registosPagina: process.env.MASP_API_PAGE_SIZE,
      sLang: process.env.MASP_API_LANG,
    });
    if (search) params.append("filtro5", search);

    const url = `${process.env.MASP_API_BASE_URL}/Objeto?${params.toString()}`;
    const response = await axios.get(url);
    const lista = response.data.Objeto || [];

    const obras = lista.map(item => ({
      id: item.inventory_number,
      titulo: item.title,
      autoria: item.artist_name,
      imageUrl: item.image?.[0]?.["image.Url"] || null
    }));


    res.json(obras);
  } catch (error) {
    console.error("Erro consumindo MASP /Objeto:", error);
    res.status(500).send("Erro no servidor");
  }
});

// Buscar obra por código ou tombo (usando filtro5 e retornando o primeiro resultado)
app.get("/obras/codigo/:codigo", async (req, res) => {
  try {
    const { codigo } = req.params;
    const params = new URLSearchParams({
      nPaginas: "1",
      registosPagina: "1",
      sLang: process.env.MASP_API_LANG,
      filtro5: codigo
    });

    const url = `${process.env.MASP_API_BASE_URL}/Objeto?${params.toString()}`;
    const response = await axios.get(url);
    const item = (response.data.Objeto || [])[0];

    if (!item) {
      return res.status(404).json({ error: "Obra não encontrada" });
    }

    res.json({
      id: item.inventory_number,
      titulo: item.title,
      autoria: item.artist_name,
      imageUrl: item.image?.[0]?.["image.Url"] || null
    });

  } catch (error) {
    console.error("Erro consumindo MASP /Objeto?filtro5:", error);
    res.status(500).send("Erro no servidor");
  }
});

//
// ======== Fim dos Endpoints de Obras ========
//


// Listar locais
app.get("/locais", async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM locais";
    const values = [];

    if (search) {
      if (/^\d+$/.test(search)) {
        query += " WHERE id = $1";
        values.push(parseInt(search, 10));
      } else {
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
      "SELECT * FROM locais WHERE codigo = $1 OR CAST(id AS TEXT) = $1",
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
    const {
      data_inicio, data_fim,
      usuario_nome, local_nome,
      obra_id: obra_tombo,  // recebemos o tombo aqui
      local_id,
      tipo_movimentacao, search
    } = req.query;

    // selecionamos obra_tombo em vez de obra_id e removemos o join em obras
    let query = `
      SELECT 
        m.id,
        m.obra_tombo,
        m.local_id,
        m.obra_nome,
        m.local_nome,
        m.usuario_id,
        m.usuario_nome,
        m.tipo_movimentacao,
        m.data_movimentacao,
        m.notas_adicionais
      FROM movimentacoes m
      WHERE 1=1
    `;
    const values = [];
    let idx = 1;

    if (data_inicio) {
      query += ` AND data_movimentacao >= $${idx++}`;
      values.push(data_inicio);
    }
    if (data_fim) {
      const fimDoDia = DateTime.fromISO(data_fim, { zone: "America/Sao_Paulo" })
                             .endOf("day").toISO();
      query += ` AND data_movimentacao <= $${idx++}`;
      values.push(fimDoDia);
    }
    if (usuario_nome) {
      query += ` AND usuario_nome ILIKE $${idx++}`;
      values.push(`%${usuario_nome}%`);
    }
    if (local_nome) {
      query += ` AND local_nome ILIKE $${idx++}`;
      values.push(`%${local_nome}%`);
    }
    if (obra_tombo) {
      query += ` AND obra_tombo = $${idx++}`;
      values.push(obra_tombo);
    }
    if (local_id) {
      query += ` AND local_id = $${idx++}`;
      values.push(local_id);
    }
    if (tipo_movimentacao) {
      query += ` AND tipo_movimentacao = $${idx++}`;
      values.push(tipo_movimentacao);
    }
    if (search) {
      query += ` AND (
        obra_nome ILIKE $${idx} OR
        local_nome ILIKE $${idx} OR
        usuario_nome ILIKE $${idx}
      )`;
      values.push(`%${search}%`);
    }

    query += " ORDER BY data_movimentacao DESC";
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
    const { obra_id, local_id, tipo_movimentacao, notas_adicionais } = req.body;
    const usuario_id   = req.usuario.id;  
    const usuario_nome = req.usuario.nome;

    console.log("✔️ notas_adicionais recebido:", notas_adicionais);

    if (!obra_id || !local_id || !tipo_movimentacao) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    // 1) pega dados da obra na API (obra_id é o tombo)
    const maspParams = new URLSearchParams({
      nPaginas:       "1",
      registosPagina: "1",
      sLang:          process.env.MASP_API_LANG,
      filtro5:        obra_id
    });
    const maspUrl = `${process.env.MASP_API_BASE_URL}/Objeto?${maspParams}`;
    const maspRes = await axios.get(maspUrl);
    const obraItem = maspRes.data.Objeto?.[0];
    if (!obraItem) {
      return res.status(400).json({ error: "Obra não encontrada na API do MASP" });
    }
    const obra_tombo = obraItem.inventory_number;  // é este valor que vai para a coluna obra_tombo
    const obra_nome  = obraItem.title;

    // console.log("QUERY:", insertQuery);
    // console.log("VALORES:", insertValues);
    // 2) busca nome do local como antes
    const locRes = await pool.query(
      "SELECT nome FROM locais WHERE id = $1",
      [local_id]
    );
    if (locRes.rows.length === 0) {
      return res.status(400).json({ error: "Local não encontrado." });
    }
    const local_nome = locRes.rows[0].nome;

    // 3) monta timestamp
    const dataMov = DateTime.now()
      .setZone("America/Sao_Paulo")
      .toISO();

    // 4) insere em obra_tombo em vez de obra_id
    const insertQuery = `
      INSERT INTO movimentacoes
        (obra_tombo, local_id, obra_nome, local_nome, usuario_id, usuario_nome, tipo_movimentacao, data_movimentacao, notas_adicionais)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;
    const insertValues = [
      obra_tombo,
      local_id,
      obra_nome,
      local_nome,
      usuario_id,
      usuario_nome,
      tipo_movimentacao,
      dataMov,
      notas_adicionais || null,
    ];

    console.log("✔️ notas_adicionais recebido:", notas_adicionais);
    console.log("QUERY:", insertQuery);
    console.log("VALORES:", insertValues);

    const insertRes = await pool.query(insertQuery, insertValues);
    res.status(201).json(insertRes.rows[0]);

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
      SELECT tipo_movimentacao, data_movimentacao AS data, local_nome, usuario_nome
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
    
    if (!user) {
      return res.status(401).json({ error: "Usuário inválido" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: "Senha inválida" });
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

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
