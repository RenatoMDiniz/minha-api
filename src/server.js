const express = require("express");
const db = require("./db");

const app = express();
app.use(express.json());

// Helpers simples
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function parsePositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

/* =======================
   CRUD CLIENTES
======================= */
app.get("/clientes", async (req, res) => {
  const rows = await all("SELECT * FROM clientes");
  res.json(rows);
});

app.get("/clientes/:id", async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return res.status(400).json({ message: "id inválido" });

  const row = await get("SELECT * FROM clientes WHERE id = ?", [id]);
  if (!row) return res.status(404).json({ message: "Cliente não encontrado" });
  res.json(row);
});

app.post("/clientes", async (req, res) => {
  const { nome, email } = req.body;
  if (!nome) return res.status(400).json({ message: "nome é obrigatório" });

  const result = await run("INSERT INTO clientes (nome, email) VALUES (?, ?)", [
    nome,
    email || null,
  ]);

  const novo = await get("SELECT * FROM clientes WHERE id = ?", [result.id]);
  res.status(201).json(novo);
});

app.put("/clientes/:id", async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return res.status(400).json({ message: "id inválido" });

  const { nome, email } = req.body;
  const atual = await get("SELECT * FROM clientes WHERE id = ?", [id]);
  if (!atual) return res.status(404).json({ message: "Cliente não encontrado" });

  await run(
    "UPDATE clientes SET nome = ?, email = ? WHERE id = ?",
    [nome ?? atual.nome, email ?? atual.email, id]
  );

  const atualizado = await get("SELECT * FROM clientes WHERE id = ?", [id]);
  res.json(atualizado);
});

app.delete("/clientes/:id", async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return res.status(400).json({ message: "id inválido" });

  const result = await run("DELETE FROM clientes WHERE id = ?", [id]);
  if (result.changes === 0) return res.status(404).json({ message: "Cliente não encontrado" });
  res.json({ message: "Cliente removido" });
});

/* =======================
   CRUD VENDEDORES
======================= */
app.get("/vendedores", async (req, res) => res.json(await all("SELECT * FROM vendedores")));

app.post("/vendedores", async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ message: "nome é obrigatório" });
  const result = await run("INSERT INTO vendedores (nome) VALUES (?)", [nome]);
  res.status(201).json(await get("SELECT * FROM vendedores WHERE id = ?", [result.id]));
});

/* =======================
   CRUD PRODUTOS
======================= */
app.get("/produtos", async (req, res) => res.json(await all("SELECT * FROM produtos")));

app.post("/produtos", async (req, res) => {
  const { nome, estoque } = req.body;
  if (!nome) return res.status(400).json({ message: "nome é obrigatório" });

  const result = await run("INSERT INTO produtos (nome, estoque) VALUES (?, ?)", [
    nome,
    Number.isInteger(estoque) ? estoque : 0,
  ]);

  res.status(201).json(await get("SELECT * FROM produtos WHERE id = ?", [result.id]));
});

/* =======================
   MOVIMENTAÇÕES (entrada/saida)
======================= */
app.post("/movimentacoes", async (req, res) => {
  const { produto_id, tipo, quantidade, motivo } = req.body;
  const produtoId = parsePositiveInt(produto_id);
  const quantidadeInt = parsePositiveInt(quantidade);

  if (!produtoId || !tipo || !quantidadeInt) {
    return res.status(400).json({ message: "produto_id, tipo e quantidade são obrigatórios" });
  }
  if (!["entrada", "saida"].includes(tipo)) {
    return res.status(400).json({ message: "tipo deve ser 'entrada' ou 'saida'" });
  }

  const produto = await get("SELECT * FROM produtos WHERE id = ?", [produtoId]);
  if (!produto) return res.status(404).json({ message: "Produto não encontrado" });

  // Regra do estoque
  if (tipo === "saida" && produto.estoque < quantidadeInt) {
    return res.status(409).json({ message: "Estoque insuficiente" });
  }

  const novoEstoque = tipo === "entrada"
    ? produto.estoque + quantidadeInt
    : produto.estoque - quantidadeInt;

  await run("UPDATE produtos SET estoque = ? WHERE id = ?", [novoEstoque, produtoId]);

  const result = await run(
    "INSERT INTO movimentacoes (produto_id, tipo, quantidade, motivo) VALUES (?, ?, ?, ?)",
    [produtoId, tipo, quantidadeInt, motivo || null]
  );

  const mov = await get("SELECT * FROM movimentacoes WHERE id = ?", [result.id]);
  res.status(201).json({ message: "Movimentação registrada com sucesso.", data: mov });
});

app.get("/movimentacoes", async (req, res) => {
  const { tipo } = req.query;

  if (tipo) {
    const rows = await all("SELECT * FROM movimentacoes WHERE tipo = ?", [tipo]);
    return res.json(rows);
  }

  res.json(await all("SELECT * FROM movimentacoes"));
});

app.get("/movimentacoes/:id", async (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return res.status(400).json({ message: "id inválido" });

  const row = await get("SELECT * FROM movimentacoes WHERE id = ?", [id]);
  if (!row) return res.status(404).json({ message: "Movimentação não encontrada" });
  res.json(row);
});

app.use((err, req, res, next) => {
  const isSqliteConstraint = err && err.code === "SQLITE_CONSTRAINT";
  if (isSqliteConstraint) {
    return res.status(400).json({ message: "Dados inválidos para persistência" });
  }

  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor" });
});

function startServer(port = 3000) {
  return app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
