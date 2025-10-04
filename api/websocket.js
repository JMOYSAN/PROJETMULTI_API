// websocket.js
const { WebSocketServer } = require("ws");
const { publisher, subscriber } = require("./redis");

async function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });
    const clients = new Map();

    // Ensure Redis is connected before using it
    await subscriber.connect().catch(() => {});
    await publisher.connect().catch(() => {});

    wss.on("connection", (ws, req) => {
        const params = new URL(req.url, "http://localhost");
        const userId = params.searchParams.get("user") || "anon";
        clients.set(userId, ws);

        ws.on("message", async (msg) => {
            const data = JSON.parse(msg);
            if (data.type === "message") {
                await publisher.publish("chat_messages", JSON.stringify(data));
            }
        });

        ws.on("close", () => clients.delete(userId));
    });

    // Subscribe safely
    subscriber.subscribe("chat_messages", (raw) => {
        const data = JSON.parse(raw);
        for (const ws of clients.values()) {
            if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
        }
    });

    console.log("WebSocket + Redis active");
}

module.exports = setupWebSocket;
