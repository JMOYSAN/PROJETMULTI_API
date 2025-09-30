
const knex = require("../db");

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const assoc = await knex("groups_users").where({ id }).first();
        if (!assoc) {
            return res.status(404).json({ error: "Association non trouvée" });
        }
        res.json(assoc);
    } catch (err) {
        console.error("Erreur show groups_users:", err);
        res.status(500).json({ error: "Erreur lors de la récupération" });
    }
};


// Lister toutes les associations (user ↔ groupe)
exports.index = async (req, res) => {
    try {
        const data = await knex("groups_users").select("*");
        res.json(data);
    } catch (err) {
        console.error("Erreur index groups_users:", err);
        res.status(500).json({ error: "Erreur lors de la récupération" });
    }
};

// Ajouter un user dans un groupe
exports.store = async (req, res) => {
    try {
        const { userId, groupId } = req.body;

        if (!userId || !groupId) {
            return res.status(400).json({ error: "userId et groupId requis" });
        }

        // Empêcher les doublons
        const exists = await knex("groups_users")
            .where({ user_id: userId, group_id: groupId })
            .first();

        if (exists) {
            return res.status(409).json({ error: "L'utilisateur est déjà dans ce groupe" });
        }

        const [id] = await knex("groups_users").insert({
            user_id: userId,
            group_id: groupId,
        });

        res.status(201).json({ id, userId, groupId });
    } catch (err) {
        console.error("Erreur ajout group_user:", err);
        res.status(500).json({ error: "Erreur lors de l'ajout" });
    }
};

// Supprimer un user d’un groupe
exports.destroy = async (req, res) => {
    try {
        const { userId, groupId } = req.params;

        const count = await knex("groups_users")
            .where({ user_id: userId, group_id: groupId })
            .del();

        if (count === 0) {
            return res.status(404).json({ error: "Association non trouvée" });
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Erreur suppression group_user:", err);
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};

// Récupérer tous les membres d’un groupe
exports.groupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;

        const members = await knex("users")
            .join("groups_users", "users.id", "groups_users.user_id")
            .where("groups_users.group_id", groupId)
            .select("users.id", "users.username", "users.theme", "users.online_status");

        res.json(members);
    } catch (err) {
        console.error("Erreur récupération membres:", err);
        res.status(500).json({ error: "Erreur lors de la récupération des membres" });
    }
};

// Récupérer tous les groupes d’un user
exports.userGroups = async (req, res) => {
    try {
        const { userId } = req.params;

        const groups = await knex("groups")
            .join("groups_users", "groups.id", "groups_users.group_id")
            .where("groups_users.user_id", userId)
            .select("groups.id", "groups.name", "groups.is_private");

        res.json(groups);
    } catch (err) {
        console.error("Erreur récupération groupes user:", err);
        res.status(500).json({ error: "Erreur lors de la récupération des groupes" });
    }
};
