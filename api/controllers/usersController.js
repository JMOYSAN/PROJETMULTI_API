const db = require("../db");

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

            const [id] = await db("users").insert({
                username,
                password,
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

            const rows = await db("users")
                .where({ id: req.params.id })
                .update({ username, password, theme, status, isadmin });

            if (rows === 0) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }

            res.json({ msg: `Utilisateur ${req.params.id} mis à jour` });
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
    }
};
