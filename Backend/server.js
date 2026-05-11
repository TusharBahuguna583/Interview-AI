require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");
const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = process.env.PORT || 3000;

connectToDB().then(() => {
    app.listen(PORT, () => {
    });
}).catch(err => {
});