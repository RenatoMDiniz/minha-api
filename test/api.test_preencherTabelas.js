const db = require("../src/db");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

async function preencherTabelas() {
  await run(
    "INSERT INTO clientes (nome, email) VALUES (?, ?)",
    ["Renato", "renato@email.com"]
  );
  await run(
    "INSERT INTO clientes (nome, email) VALUES (?, ?)",
    ["Ana", "ana@email.com"]
  );

  await run("INSERT INTO vendedores (nome) VALUES (?)", ["Carlos"]);
  await run("INSERT INTO vendedores (nome) VALUES (?)", ["Julia"]);

  const notebook = await run(
    "INSERT INTO produtos (nome, estoque) VALUES (?, ?)",
    ["Notebook", 15]
  );
  const mouse = await run(
    "INSERT INTO produtos (nome, estoque) VALUES (?, ?)",
    ["Mouse", 30]
  );

  await run(
    "INSERT INTO movimentacoes (produto_id, tipo, quantidade, motivo) VALUES (?, ?, ?, ?)",
    [notebook.lastID, "saida", 2, "Venda balcão"]
  );
  await run(
    "INSERT INTO movimentacoes (produto_id, tipo, quantidade, motivo) VALUES (?, ?, ?, ?)",
    [mouse.lastID, "entrada", 10, "Reposição"]
  );
}

preencherTabelas()
  .then(() => {
    console.log("Tabelas preenchidas com dados de exemplo.");
    db.close();
  })
  .catch((error) => {
    console.error("Erro ao preencher tabelas:", error.message);
    db.close();
    process.exitCode = 1;
  });
