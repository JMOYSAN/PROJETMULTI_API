const db = require("../db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

module.exports = {
    index: async (req, res) => {
        try {
            const users = await db("users").select("*").limit(25);
            res.json(users);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },
    store: async (req, res) => {
        try {
            const { username, password, theme, status, isadmin } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: "Username et password obligatoires" });
            }

            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            const [id] = await db("users").insert({
                username,
                password: hashedPassword,
                theme: theme || "default",
                status: status || "offline",
                isadmin: isadmin || 0
            });

            res.status(201).json({ id, username, theme, status, isadmin });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    show: async (req, res) => {
        try {
            const user = await db("users").where({ id: req.params.id }).first();

            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }

            res.json(user);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    update: async (req, res) => {
        try {
            const { username, password, theme, status, isadmin } = req.body;

            const updateData = { username, theme, status, isadmin };

            if (password) {
                updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
            }

            const rows = await db("users")
                .where({ id: req.params.id })
                .update(updateData);

            if (rows === 0) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }
            const updatedUser = await db("users")
                .where({ id: req.params.id })
                .first();
            res.json(updatedUser);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    destroy: async (req, res) => {
        try {
            const rows = await db("users").where({ id: req.params.id }).del();

            if (rows === 0) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }

            res.json({ msg: `Utilisateur ${req.params.id} supprimé` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },
    nextUsers: async (req, res) => {
        const startId = parseInt(req.params.id, 10);

        if (isNaN(startId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        try {
            const users = await db("users")
                .where("id", ">", startId)
                .orderBy("id", "asc")
                .limit(5);

            res.json(users);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },
    login: async (req, res) => {
        try {
            console.log('Req: ', req);
            console.log('Body reçu :', req.body);
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: "username et password requis" });
            }

            const user = await db("users")
                .where({ username })
                .first();

            console.log('Utilisateur trouvé :', user);

            if (!user) {
                return res.status(401).json({ error: "Identifiants incorrects" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: "Identifiants incorrects" });
            }

            await db("users")
                .where({ id: user.id })
                .update({ online_status: 'online' });

            res.json({
                id: user.id,
                username: user.username,
                online_status: 'online',
                theme: user.theme,
                role: user.role
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },
    register: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: "Username et password obligatoires" });
            }

            const existingUser = await db("users").where({ username }).first();
            if (existingUser) {
                return res.status(409).json({ error: "Nom d'utilisateur déjà pris" });
            }

            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            const [id] = await db("users").insert({
                username,
                password: hashedPassword,
                theme: "dark",
                online_status: "online",
            });

            const newUser = await db("users").where({ id }).first();

            res.status(201).json({
                id: newUser.id,
                username: newUser.username,
                theme: "dark",
                online_status: "online",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }
};