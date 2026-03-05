const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite");

// Cria as tabelas se não existirem
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vendedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      estoque INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS movimentacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      produto_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('entrada','saida')),
      quantidade INTEGER NOT NULL CHECK(quantidade > 0),
      motivo TEXT,
      data_movimentacao TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(produto_id) REFERENCES produtos(id)
    )
  `);
});

module.exports = db;