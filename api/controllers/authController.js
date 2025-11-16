const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = "15m"; // durée courte
const REFRESH_TOKEN_EXPIRY = "7d"; // durée longue

// Store refresh tokens valid in DB (simplified)
const generateAccessToken = (user) =>
    jwt.sign({ id: user.id, username: user.username }, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });

const generateRefreshToken = (user) =>
    jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });

module.exports = {
    register: async (req, res) => {
        try {
            console.log("BODY RECU:", req.body);

            const { username, password } = req.body;
            if (!username || !password)
                return res.status(400).json({ error: "Champs requis" });

            const existing = await db("users").where({ username }).first();
            if (existing) return res.status(409).json({ error: "Déjà pris" });

            const hashedPassword = await bcrypt.hash(password, 10);
            const [id] = await db("users").insert({ username, password: hashedPassword });

            res.status(201).json({ id, username });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;


            const user = await db("users").where({ username }).first();
            if (!user) return res.status(401).json({ error: "Identifiants invalides" });

            const match = await bcrypt.compare(password, user.password);

            if (!match) return res.status(401).json({ error: "Mot de passe incorrect" });

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            await db("refresh_tokens").insert({
                user_id: user.id,
                token: refreshToken,
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                path: "/",
            });

            const { password: _, ...userWithoutPassword } = user;
            res.json({
                accessToken,
                user: userWithoutPassword
            });
        } catch (err) {
            console.error("ERREUR DÉTAILLÉE:", err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    refresh: async (req, res) => {
        const oldToken = req.cookies.refreshToken;
        if (!oldToken) return res.status(401).json({ error: "Non autorisé" });

        try {
            const payload = jwt.verify(oldToken, REFRESH_TOKEN_SECRET);
            const stored = await db("refresh_tokens")
                .where({ user_id: payload.id, token: oldToken })
                .first();

            if (!stored) {
                return res.status(401).json({ error: "Token invalide" });
            }

            await db("refresh_tokens")
                .where({ user_id: payload.id, token: oldToken })
                .del();

            const newAccessToken = generateAccessToken(payload);
            const newRefreshToken = generateRefreshToken(payload);
            await db("refresh_tokens").insert({
                user_id: payload.id,
                token: newRefreshToken,
            });

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/",
            });

            res.json({ accessToken: newAccessToken });
        } catch (err) {
            await db("revoked_tokens").insert({ token: oldToken });
            res.status(403).json({ error: "Token expiré ou invalide" });
        }
    },

    logout: async (req, res) => {
        const oldToken = req.cookies.refreshToken;
        if (!oldToken) return res.status(400).json({ error: "Aucun token" });

        await db("refresh_tokens").where({ token: oldToken }).del();
        await db("revoked_tokens").insert({ token: oldToken });
        res.clearCookie("refreshToken");
        res.json({ message: "Déconnexion réussie" });
    },
};
