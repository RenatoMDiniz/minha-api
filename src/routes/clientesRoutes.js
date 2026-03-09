const express = require("express");
const {
  listClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} = require("../services/clientesService");

const router = express.Router();

router.get("/", async (req, res) => {
  res.json(await listClientes());
});

router.get("/:id", async (req, res) => {
  res.json(await getClienteById(req.params.id));
});

router.post("/", async (req, res) => {
  res.status(201).json(await createCliente(req.body));
});

router.put("/:id", async (req, res) => {
  res.json(await updateCliente(req.params.id, req.body));
});

router.delete("/:id", async (req, res) => {
  res.json(await deleteCliente(req.params.id));
});

module.exports = router;
