const db = require("../db");

module.exports = {
    // Liste tous les groupes (limite 20)
    index: async (req, res) => {
        try {
            const groups = await db("groups").select("*").limit(20);
            res.json(groups);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erreur serveur" });
        }
    },

    // Groupes d'un utilisateur (limite 20)
    userGroupsIndex: async (req, res) => {
        try {
            const { userId } = req.params;
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

    // Groupes publics auxquels l'utilisateur n'appartient pas (limite 20)
    publicGroupsIndex: async (req, res) => {
        try {
            const { userId } = req.params;
            const groups = await db("groups")
                .where("is_private", 0)
                .whereNotIn("id", function () {
                    this.select("group_id").from("user_groups").where("user_id", userId);
                })
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
            const { name, description, is_private} = req.body;

            if (!name) {
                return res.status(400).json({ error: "Le nom est obligatoire" });
            }

            const [id] = await db("groups").insert({
                name,
                description: description || "",
                is_private: is_private ? 1 : 0,
            });

            res.status(201).json({ id, name, description, is_public, owner_id });
        } catch (err) {
            console.error(err);
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
