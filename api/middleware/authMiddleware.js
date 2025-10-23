const jwt = require("jsonwebtoken");
const db = require("../db");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Token d'accès manquant" });

    jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token d'accès invalide" });

        const revoked = await db("revoked_tokens").where({ token }).first();
        if (revoked) {
            return res.status(401).json({ error: "Token d'accès révoqué" });
        }

        req.user = decoded;
        next();
    });
};

const checkRevokedRefreshToken = async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken)
        return res.status(401).json({ error: "Refresh token manquant" });

    try {
        const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        const validEntry = await db("refresh_tokens")
            .where({ user_id: payload.id, token: refreshToken })
            .first();
        if (!validEntry)
            return res.status(403).json({ error: "Refresh token non reconnu" });

        const revoked = await db("revoked_tokens").where({ token: refreshToken }).first();
        if (revoked)
            return res.status(401).json({ error: "Refresh token révoqué ou expiré" });

        req.user = payload;
        next();
    } catch (err) {
        console.error("Erreur refresh check:", err);
        return res.status(401).json({ error: "Refresh token invalide" });
    }
};

module.exports = { verifyAccessToken, checkRevokedRefreshToken };
