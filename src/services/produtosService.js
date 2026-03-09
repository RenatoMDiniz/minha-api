const { all, get, run } = require("../database/repository");
const { createHttpError } = require("../errors/httpError");

async function listProdutos() {
  return all("SELECT * FROM produtos");
}

async function getProdutoById(id) {
  return get("SELECT * FROM produtos WHERE id = ?", [id]);
}

async function createProduto(data) {
  const { nome, estoque } = data;
  if (!nome) throw createHttpError(400, "nome é obrigatório");

  const result = await run("INSERT INTO produtos (nome, estoque) VALUES (?, ?)", [
    nome,
    Number.isInteger(estoque) ? estoque : 0,
  ]);

  return get("SELECT * FROM produtos WHERE id = ?", [result.id]);
}

async function updateEstoque(id, estoque) {
  await run("UPDATE produtos SET estoque = ? WHERE id = ?", [estoque, id]);
}

module.exports = {
  listProdutos,
  getProdutoById,
  createProduto,
  updateEstoque,
};
