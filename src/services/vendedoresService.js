const { all, get, run } = require("../database/repository");
const { createHttpError } = require("../errors/httpError");

async function listVendedores() {
  return all("SELECT * FROM vendedores");
}

async function createVendedor(data) {
  const { nome } = data;
  if (!nome) throw createHttpError(400, "nome é obrigatório");

  const result = await run("INSERT INTO vendedores (nome) VALUES (?)", [nome]);
  return get("SELECT * FROM vendedores WHERE id = ?", [result.id]);
}

module.exports = { listVendedores, createVendedor };
