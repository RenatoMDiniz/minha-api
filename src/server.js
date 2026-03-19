const { app } = require("./app");

function startServer(port = 3000) {
  return app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

// produtos não possui rota PUT nem DELETE
// vendedores não possui rota PUT nem DELETE
// movimentacoes não possui rota PUT nem DELETE


// response codes e verificações de erro estão boas, parabéns