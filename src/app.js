const express = require("express");
const clientesRoutes = require("./routes/clientesRoutes");
const vendedoresRoutes = require("./routes/vendedoresRoutes");
const produtosRoutes = require("./routes/produtosRoutes");
const movimentacoesRoutes = require("./routes/movimentacoesRoutes");

const app = express();

app.use(express.json());
app.use("/clientes", clientesRoutes);
app.use("/vendedores", vendedoresRoutes);
app.use("/produtos", produtosRoutes);
app.use("/movimentacoes", movimentacoesRoutes);

app.use((err, req, res, next) => {
  const isSqliteConstraint = err && err.code === "SQLITE_CONSTRAINT";
  if (isSqliteConstraint) {
    return res.status(400).json({ message: "Dados inválidos para persistência" });
  }

  if (err && err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor" });
});

module.exports = { app };
