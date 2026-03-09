const { app } = require("./app");

function startServer(port = 3000) {
  return app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
