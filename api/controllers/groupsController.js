const db = require("../db");

module.exports = {
    index: async (req, res) => {
        try {
            const groups = await db("groups").select("*").limit(40);
            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    store: async (req, res) => {
        try {
            const { name, is_private } = req.body;
            if (!name) return res.status(400).json({ error: "Le nom du groupe est obligatoire" });

            const existingGroup = await db("groups").where({ name }).first();
            if (existingGroup) return res.status(409).json({ error: "Nom de groupe déjà utilisé" });

            const [id] = await db("groups").insert({ name, is_private: is_private || false });
            const newGroup = await db("groups").where({ id }).first();
            res.status(201).json(newGroup);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    show: async (req, res) => {
        try {
            const group = await db("groups").where({ id: req.params.id }).first();
            if (!group) return res.status(404).json({ error: "Groupe non trouvé" });
            res.json(group);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    update: async (req, res) => {
        try {
            const { name, is_private } = req.body;
            const rows = await db("groups").where({ id: req.params.id }).update({ name, is_private });
            if (rows === 0) return res.status(404).json({ error: "Groupe non trouvé" });
            const updatedGroup = await db("groups").where({ id: req.params.id }).first();
            res.json(updatedGroup);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    destroy: async (req, res) => {
        try {
            const rows = await db("groups").where({ id: req.params.id }).del();
            if (rows === 0) return res.status(404).json({ error: "Groupe non trouvé" });
            res.json({ msg: `Groupe ${req.params.id} supprimé` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    userGroupsIndex: async (req, res) => {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) return res.status(400).json({ error: "User ID invalide" });

        try {
            const groups = await db("groups")
                .join("user_groups", "groups.id", "user_groups.group_id")
                .where("user_groups.user_id", userId)
                .select("groups.*")
                .limit(20);
            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    publicGroupsIndex: async (req, res) => {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) return res.status(400).json({ error: "User ID invalide" });

        try {
            const groups = await db("groups")
                .where("is_private", false)
                .andWhereNotIn("id", function() {
                    this.select("group_id").from("user_groups").where("user_id", userId);
                })
                .limit(20);
            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    userGroupsLazy: async (req, res) => {
        const userId = parseInt(req.params.userId, 10);
        const startId = parseInt(req.query.startId, 10) || 0;
        if (isNaN(userId)) return res.status(400).json({ error: "User ID invalide" });

        try {
            const groups = await db("groups")
                .join("user_groups", "groups.id", "user_groups.group_id")
                .where("user_groups.user_id", userId)
                .andWhere("groups.id", ">", startId)
                .orderBy("groups.id", "asc")
                .limit(20)
                .select("groups.*");
            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    publicGroupsLazy: async (req, res) => {
        const userId = parseInt(req.params.userId, 10);
        const startId = parseInt(req.query.startId, 10) || 0;
        if (isNaN(userId)) return res.status(400).json({ error: "User ID invalide" });

        try {
            const groups = await db("groups")
                .where("is_private", false)
                .andWhereNotIn("id", function() {
                    this.select("group_id").from("user_groups").where("user_id", userId);
                })
                .andWhere("id", ">", startId)
                .orderBy("id", "asc")
                .limit(20);
            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }
};
