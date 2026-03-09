const express = require("express");
const { listVendedores, createVendedor } = require("../services/vendedoresService");

const router = express.Router();

router.get("/", async (req, res) => {
  res.json(await listVendedores());
});

router.post("/", async (req, res) => {
  res.status(201).json(await createVendedor(req.body));
});

module.exports = router;
