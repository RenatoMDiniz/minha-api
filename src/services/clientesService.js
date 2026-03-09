const { all, get, run } = require("../database/repository");
const { createHttpError } = require("../errors/httpError");
const { parsePositiveInt } = require("../utils/validation");

async function listClientes() {
  return all("SELECT * FROM clientes");
}

async function getClienteById(rawId) {
  const id = parsePositiveInt(rawId);
  if (!id) throw createHttpError(400, "id inválido");

  const cliente = await get("SELECT * FROM clientes WHERE id = ?", [id]);
  if (!cliente) throw createHttpError(404, "Cliente não encontrado");
  return cliente;
}

async function createCliente(data) {
  const { nome, email } = data;
  if (!nome) throw createHttpError(400, "nome é obrigatório");

  const result = await run("INSERT INTO clientes (nome, email) VALUES (?, ?)", [
    nome,
    email || null,
  ]);

  return get("SELECT * FROM clientes WHERE id = ?", [result.id]);
}

async function updateCliente(rawId, data) {
  const id = parsePositiveInt(rawId);
  if (!id) throw createHttpError(400, "id inválido");

  const atual = await get("SELECT * FROM clientes WHERE id = ?", [id]);
  if (!atual) throw createHttpError(404, "Cliente não encontrado");

  await run(
    "UPDATE clientes SET nome = ?, email = ? WHERE id = ?",
    [data.nome ?? atual.nome, data.email ?? atual.email, id]
  );

  return get("SELECT * FROM clientes WHERE id = ?", [id]);
}

async function deleteCliente(rawId) {
  const id = parsePositiveInt(rawId);
  if (!id) throw createHttpError(400, "id inválido");

  const result = await run("DELETE FROM clientes WHERE id = ?", [id]);
  if (result.changes === 0) throw createHttpError(404, "Cliente não encontrado");
  return { message: "Cliente removido" };
}

module.exports = {
  listClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
};
