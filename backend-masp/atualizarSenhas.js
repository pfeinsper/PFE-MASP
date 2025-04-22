const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "masp_db",
  password: "admin",
  port: 5432,
});

async function atualizarSenhas() {
  const res = await pool.query("SELECT id, senha FROM usuarios");
  for (const usuario of res.rows) {
    const hash = await bcrypt.hash(usuario.senha, 10);
    await pool.query("UPDATE usuarios SET senha_hash = $1 WHERE id = $2", [hash, usuario.id]);
  }
  console.log("Senhas atualizadas com sucesso!");
  process.exit();
}

atualizarSenhas();
