const express = require("express");
const { listProdutos, createProduto } = require("../services/produtosService");

const router = express.Router();

router.get("/", async (req, res) => {
  res.json(await listProdutos());
});

router.post("/", async (req, res) => {
  res.status(201).json(await createProduto(req.body));
});

module.exports = router;
