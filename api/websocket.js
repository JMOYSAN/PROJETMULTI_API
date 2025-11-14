// websocket.js
const { WebSocketServer } = require("ws");
const { publisher, subscriber } = require("./redis");

async function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });
    const clients = new Map(); // Map<userId, WebSocket>

    await subscriber.connect().catch(() => {});
    await publisher.connect().catch(() => {});

    wss.on("connection", (ws, req) => {
        const params = new URL(`http://server${req.url}`);
        const userId = params.searchParams.get("user") || "anon";

        console.log("[WS] connection from user:", userId);

        clients.set(userId, ws);

        ws.on("message", async (msg) => {
            try {
                const data = JSON.parse(msg);
                if (data.type === "message") {
                    await publisher.publish("chat_messages", JSON.stringify(data));
                }
            } catch (err) {
                console.error("[WS] message parse error:", err);
            }
        });

        ws.on("close", () => {
            console.log("[WS] closed for user:", userId);
            clients.delete(userId);
        });
    });

    await subscriber.subscribe("chat_messages", (raw) => {
        console.log("[Redis] received:", raw);
        const data = JSON.parse(raw);
        for (const ws of clients.values()) {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(data));
            }
        }
    });

    console.log("WebSocket + Redis active");
}

module.exports = setupWebSocket;
