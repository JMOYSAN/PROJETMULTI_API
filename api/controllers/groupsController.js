const db = require("../db");

module.exports = {
    index: async (req, res) => {
        try {
            const groups = await db("groups").select("*").limit(100);
            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    privateGroupsIndex: async (req, res) => {
        try {
            const { userId } = req.params;
            const groups = await db("groups")
                .join("groups_users", "groups.id", "groups_users.group_id")
                .where("groups.is_private", 1)
                .andWhere("groups_users.user_id", userId)
                .select("groups.*")
                .limit(20);

            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    publicGroupsIndex: async (req, res) => {
        try {
            const groups = await db("groups")
                .where("is_private", 0)
                .limit(20);

            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    // Lazy loading (20 par batch)
    nextGroups: async (req, res) => {
        const lastId = parseInt(req.params.lastId, 10);
        const type = req.params.type;

        if (isNaN(lastId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        try {
            let query;
            if (type === "private") {
                query = db("groups").where("id", ">", lastId).orderBy("id", "asc").where("is_private", 1).limit(20);
            } else if (type === "public") {
                query = db("groups").where("id", ">", lastId).orderBy("id", "asc").where("is_private", 0).limit(20);
            }

            const groups = await query;
            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },
    
    show: async (req, res) => {
        try {
            const group = await db("groups").where({ id: req.params.id }).first();

            if (!group) {
                return res.status(404).json({ error: "Groupe non trouvé" });
            }

            res.json(group);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    // Crée un groupe
    store: async (req, res) => {
        try {
            const { name, is_private } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Le champ name est requis" });
            }

            const existing = await db("groups").where({ name }).first();
            if (existing) {
                return res.status(409).json({ error: "Ce nom de groupe existe déjà" });
            }

            const [id] = await db("groups").insert({
                name,
                is_private: !!is_private,
            });

            const group = await db("groups").where({ id }).first();
            res.status(201).json(group);
        } catch (err) {
            console.error("Erreur création groupe:", err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },


    // Met à jour un groupe
    update: async (req, res) => {
        try {
            const { name, description, is_private } = req.body;

            const rows = await db("groups")
                .where({ id: req.params.id })
                .update({ name, description, is_private});

            if (rows === 0) {
                return res.status(404).json({ error: "Groupe non trouvé" });
            }

            res.json({ msg: `Groupe ${req.params.id} mis à jour` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    // Supprime un groupe
    destroy: async (req, res) => {
        try {
            const rows = await db("groups").where({ id: req.params.id }).del();

            if (rows === 0) {
                return res.status(404).json({ error: "Groupe non trouvé" });
            }

            res.json({ msg: `Groupe ${req.params.id} supprimé` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },
};
