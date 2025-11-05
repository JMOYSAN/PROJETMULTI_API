require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const setupWebSocket = require("./websocket");
const { verifyAccessToken } = require("./middleware/authMiddleware");

const app = express();
const port = 3000;

const allowedOrigins = [
    "http://localhost:5173",
    "https://bobberchat.com"
];
app.use(cookieParser())

app.use(cors({
    origin: ["http://localhost:5173", "https://bobberchat.com"],
    credentials: true,
}))

app.use(express.json())

const apiRouter = require("./routes/api");
app.use(express.json());

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100000,
    message: {
        success: false,
        error: "Trop de requêtes envoyées. Réessayez plus tard."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
})

app.use("/auth", require("./routes/auth"));     // stays at /auth/*
app.use(verifyAccessToken);                     // everything below requires JWT
app.use("/api", apiRouter);                     // keep
app.use("/api/search", require("./routes/search"));
app.use("/api/users", require("./routes/users"));
app.use("/api/groups", require("./routes/groups"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/groups-users", require("./routes/groupUsers"));

const server = http.createServer(app);

setupWebSocket(server);

server.listen(port, "0.0.0.0", () => {
    console.log(`Server and WebSocket running at http://localhost:${port}`);
});
