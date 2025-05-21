// ▶️ Como executar
// 1. Navegue até a pasta do backend:
// cd backend-masp

// 2. Execute o script:
// node atualizarSenhas.js

const bcrypt = require("bcrypt");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: true, // ou true se estiver na Render com SSL forçado
});

async function atualizarSenhas() {
  try {
    const result = await pool.query(
      "SELECT id, senha FROM usuarios WHERE senha IS NOT NULL AND senha_hash IS NULL"
    );
    const usuarios = result.rows;

    for (const user of usuarios) {
      const hash = await bcrypt.hash(user.senha, 10);
      await pool.query(
        "UPDATE usuarios SET senha_hash = $1, senha = NULL WHERE id = $2",
        [hash, user.id]
      );
      console.log(`🔐 Atualizado ID ${user.id}`);
    }

    console.log("✅ Todas as senhas foram atualizadas com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao atualizar senhas:", err);
  } finally {
    await pool.end();
  }
}

atualizarSenhas();
