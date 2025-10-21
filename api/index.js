require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const setupWebSocket = require("./webSocket");

const app = express();
const port = 3000;

app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

const apiRouter = require("./routes/api");
app.use(express.json());

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    message: {
        success: false,
        error: "Trop de requêtes envoyées. Réessayez plus tard."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRouter);
app.use("/search", require("./routes/search"));
app.use("/users", require("./routes/users"));
app.use("/groups", require("./routes/groups"));
app.use("/messages", require("./routes/messages"));
app.use("/groups-users", require("./routes/groupUsers"));

const server = http.createServer(app);

setupWebSocket(server);

server.listen(port, "0.0.0.0", () => {
    console.log(`Server and WebSocket running at http://localhost:${port}`);
});
