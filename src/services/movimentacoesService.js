const { all, get, run } = require("../database/repository");
const { createHttpError } = require("../errors/httpError");
const { parsePositiveInt } = require("../utils/validation");
const { getProdutoById, updateEstoque } = require("./produtosService");

async function createMovimentacao(data) {
  const { produto_id, tipo, quantidade, motivo } = data;
  const produtoId = parsePositiveInt(produto_id);
  const quantidadeInt = parsePositiveInt(quantidade);

  if (!produtoId || !tipo || !quantidadeInt) {
    throw createHttpError(400, "produto_id, tipo e quantidade são obrigatórios");
  }

  if (!["entrada", "saida"].includes(tipo)) {
    throw createHttpError(400, "tipo deve ser 'entrada' ou 'saida'");
  }

  const produto = await getProdutoById(produtoId);
  if (!produto) throw createHttpError(404, "Produto não encontrado");

  if (tipo === "saida" && produto.estoque < quantidadeInt) {
    throw createHttpError(409, "Estoque insuficiente");
  }

  const novoEstoque =
    tipo === "entrada" ? produto.estoque + quantidadeInt : produto.estoque - quantidadeInt;

  await updateEstoque(produtoId, novoEstoque);

  const result = await run(
    "INSERT INTO movimentacoes (produto_id, tipo, quantidade, motivo) VALUES (?, ?, ?, ?)",
    [produtoId, tipo, quantidadeInt, motivo || null]
  );

  const movimentacao = await get("SELECT * FROM movimentacoes WHERE id = ?", [result.id]);
  return { message: "Movimentação registrada com sucesso.", data: movimentacao };
}

async function listMovimentacoes(tipo) {
  if (tipo) {
    return all("SELECT * FROM movimentacoes WHERE tipo = ?", [tipo]);
  }

  return all("SELECT * FROM movimentacoes");
}

async function getMovimentacaoById(rawId) {
  const id = parsePositiveInt(rawId);
  if (!id) throw createHttpError(400, "id inválido");

  const movimentacao = await get("SELECT * FROM movimentacoes WHERE id = ?", [id]);
  if (!movimentacao) throw createHttpError(404, "Movimentação não encontrada");
  return movimentacao;
}

module.exports = {
  createMovimentacao,
  listMovimentacoes,
  getMovimentacaoById,
};
