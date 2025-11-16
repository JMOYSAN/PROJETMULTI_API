const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");
const { logger } = require("../utils/logger");
const { logSensitiveAccess, logFailedAuth, sanitizeData } = require("../middleware/securityLogger");

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

            const { username, password } = req.body;
            if (!username || !password) {
                logger.warn('Registration attempt with missing fields', {
                    ip: req.ip,
                    hasUsername: !!username,
                    hasPassword: !!password
                });
                return res.status(400).json({ error: "Champs requis" });
            }


            const existing = await db("users").where({ username }).first();
            if (existing) {
                logger.warn('Registration attempt with existing username', {
                    username,
                    ip: req.ip,
                    userAgent: req.get('user-agent')
                });
                return res.status(409).json({ error: "Nom d'utilisateur déjà utilisé" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const [id] = await db("users").insert({ username, password: hashedPassword });

            logger.info('User registered successfully', {
                userId: id,
                username,
                ip: req.ip
            });

            res.status(201).json({ id, username });
        } catch (err) {
            logger.error('Registration error', {
                error: err.message,
                stack: err.stack,
                body: sanitizeData(req.body),
                ip: req.ip
            });
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;


            const user = await db("users").where({ username }).first();
            if (!user){
                logFailedAuth(req, username, 'User not found');
                return res.status(401).json({ error: "Identifiants invalides" });
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                logFailedAuth(req, username, 'Invalid password');
                return res.status(401).json({ error: "Identifiants invalides" });
            }

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

            logger.info('User logged in successfully', {
                userId: user.id,
                username: user.username,
                ip: req.ip,
                userAgent: req.get('user-agent')
            });

            const { password: _, ...userWithoutPassword } = user;
            res.json({
                accessToken,
                user: userWithoutPassword
            });
        } catch (err) {
            logger.error('Login error', {
                error: err.message,
                stack: err.stack,
                username: req.body?.username,
                ip: req.ip
            });
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    refresh: async (req, res) => {
        const oldToken = req.cookies.refreshToken;
        if (!oldToken) {
            logger.warn('Refresh attempt without token', {
                ip: req.ip,
                userAgent: req.get('user-agent')
            });
            return res.status(401).json({ error: "Non autorisé" });
        }

        try {
            const payload = jwt.verify(oldToken, REFRESH_TOKEN_SECRET);
            const stored = await db("refresh_tokens")
                .where({ user_id: payload.id, token: oldToken })
                .first();

            if (!stored) {
                logger.warn('Refresh attempt with invalid token', {
                    userId: payload.id,
                    ip: req.ip
                });

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

            logger.info('Token refreshed successfully', {
                ip: req.ip
            });

            res.json({ accessToken: newAccessToken });
        } catch (err) {
            logger.warn('Token refresh failed', {
                error: err.message,
                ip: req.ip
            });
            try {
                await db("revoked_tokens").insert({
                    token: oldToken,
                    revoked_at: new Date(),
                    reason: 'Refresh error: ' + err.message
                });
            } catch (revokeErr) {
                logger.error('Failed to revoke token', {
                    error: revokeErr.message
                });
            }
            res.status(403).json({ error: "Token expiré ou invalide" });
        }
    },

    logout: async (req, res) => {
        const oldToken = req.cookies.refreshToken;
        if (!oldToken) {
            logger.warn('Logout attempt without token', {
                ip: req.ip
            });
            return res.status(400).json({ error: "Aucun token" });
        }

        await db("refresh_tokens").where({ token: oldToken }).del();
        await db("revoked_tokens").insert({ token: oldToken });
        res.clearCookie("refreshToken");
        res.json({ message: "Déconnexion réussie" });
    },
};
