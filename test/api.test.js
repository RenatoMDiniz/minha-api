const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const dbFile = path.join(os.tmpdir(), `minha-api-test-${Date.now()}.sqlite`);
process.env.DB_PATH = dbFile;

const db = require("../src/db");
const { startServer } = require("../src/server");

let server;
let baseUrl;

test.before(async () => {
  server = startServer(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });

  await new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });

  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
});

test("deve criar e listar cliente", async () => {
  const createdResponse = await fetch(`${baseUrl}/clientes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nome: "Renato", email: "renato@test.com" }),
  });

  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json();
  assert.equal(created.nome, "Renato");
  assert.equal(created.email, "renato@test.com");

  const listResponse = await fetch(`${baseUrl}/clientes`);
  assert.equal(listResponse.status, 200);
  const list = await listResponse.json();
  assert.ok(Array.isArray(list));
  assert.equal(list.length, 1);
});

test("deve validar id inválido em clientes", async () => {
  const response = await fetch(`${baseUrl}/clientes/abc`);
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.message, "id inválido");
});

test("deve movimentar estoque corretamente", async () => {
  const productResponse = await fetch(`${baseUrl}/produtos`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nome: "Notebook", estoque: 10 }),
  });
  assert.equal(productResponse.status, 201);
  const product = await productResponse.json();

  const moveResponse = await fetch(`${baseUrl}/movimentacoes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      produto_id: product.id,
      tipo: "saida",
      quantidade: 4,
      motivo: "Venda",
    }),
  });
  assert.equal(moveResponse.status, 201);

  const productListResponse = await fetch(`${baseUrl}/produtos`);
  assert.equal(productListResponse.status, 200);
  const products = await productListResponse.json();
  const updatedProduct = products.find((item) => item.id === product.id);
  assert.equal(updatedProduct.estoque, 6);
});

test("deve bloquear saída com estoque insuficiente", async () => {
  const productResponse = await fetch(`${baseUrl}/produtos`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nome: "Mouse", estoque: 1 }),
  });
  const product = await productResponse.json();

  const moveResponse = await fetch(`${baseUrl}/movimentacoes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      produto_id: product.id,
      tipo: "saida",
      quantidade: 2,
    }),
  });

  assert.equal(moveResponse.status, 409);
  const body = await moveResponse.json();
  assert.equal(body.message, "Estoque insuficiente");
});
