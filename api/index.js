require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const setupWebSocket = require("./websocket");
const { verifyAccessToken } = require("./middleware/authMiddleware");
const requestLogger = require("./middleware/requestLogger")
const { logger } = require("./utils/logger");

const app = express();
const port = 3000;

app.set("trust proxy", 1);

app.use(cors({
    origin: ["https://bobberchat.com", "http://localhost:5173"],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "wss://bobberchat.com", "ws://localhost:*"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'"],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    message: { error: "Trop de requêtes. Réessayez plus tard." },
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
});

app.use("/auth", require("./routes/auth"));

app.use(verifyAccessToken);

app.use("/api/search", require("./routes/search"));
app.use("/api/users", require("./routes/users"));
app.use("/api/groups", require("./routes/groups"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/groups-users", require("./routes/groupUsers"));

app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        userId: req.user?.id
    });

    res.status(500).json({ error: "Erreur serveur" });
});

const server = http.createServer(app);
setupWebSocket(server);

server.listen(port, "0.0.0.0", () => {
    logger.info(`Server + WS running on port ${port}`, {
        port,
        environment: process.env.NODE_ENV,
        nodeVersion: process.version
    });
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
});
