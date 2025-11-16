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

app.set("trust proxy", 1);

app.use(cors({
    origin: ["https://bobberchat.com", "http://localhost:5173"],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

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

const server = http.createServer(app);
setupWebSocket(server);

server.listen(port, "0.0.0.0", () =>
    console.log(`Server + WS running on port ${port}`)
);
