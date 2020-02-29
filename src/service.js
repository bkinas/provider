const { server, importData } = require("./provider.js");
const PORT = 8081;

importData();

server.listen(PORT, () => {
    console.log(`User Service listening on http://localhost:${PORT}`)
});
