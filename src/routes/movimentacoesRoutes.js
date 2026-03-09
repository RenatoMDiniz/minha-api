const express = require("express");
const {
  createMovimentacao,
  listMovimentacoes,
  getMovimentacaoById,
} = require("../services/movimentacoesService");

const router = express.Router();

router.post("/", async (req, res) => {
  res.status(201).json(await createMovimentacao(req.body));
});

router.get("/", async (req, res) => {
  res.json(await listMovimentacoes(req.query.tipo));
});

router.get("/:id", async (req, res) => {
  res.json(await getMovimentacaoById(req.params.id));
});

module.exports = router;
