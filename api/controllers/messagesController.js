const knex = require("../db");
const { publisher } = require("../redis");

exports.index = async (req, res) => {
    const { lastCreatedAt, limit = 20, groupId } = req.query;

    try {
        const query = knex("messages")
            .select("id", "user_id", "group_id", "content", "created_at")
            .orderBy("created_at", "asc")
            .limit(parseInt(limit));

        if (lastCreatedAt) {
            query.where("created_at", ">", new Date(lastCreatedAt));
        }

        if (groupId) {
            query.andWhere("group_id", groupId);
        }

        const messages = await query;
        res.json(messages);
    } catch (err) {
        console.error("Erreur index messages:", err);
        res.status(500).json({ error: "Erreur lors de la récupération des messages" });
    }
};

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await knex("messages").where({ id }).first();
        if (!message) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        res.json(message);
    } catch (err) {
        console.error("Erreur show message:", err);
        res.status(500).json({ error: "Erreur lors de la récupération du message" });
    }
};

exports.store = async (req, res) => {
    try {
        const { content, user_id, group_id } = req.body;
        if (!user_id || !group_id || !content) {
            return res.status(400).json({ error: "user_id, group_id et content sont requis" });
        }

        const [id] = await knex("messages").insert({
            content,
            user_id,
            group_id,
            created_at: new Date(),
        });

        const message = await knex("messages").where({ id }).first();

        // broadcast via Redis
        await publisher.publish("chat_messages", JSON.stringify({
            type: "message",
            ...message,
        }));

        res.status(201).json(message);
    } catch (err) {
        console.error("Erreur store message:", err);
        res.status(500).json({ error: "Erreur lors de la création du message" });
    }
};

exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await knex("messages").where({ id }).del();
        if (count === 0) {
            return res.status(404).json({ error: "Message non trouvé" });
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Erreur destroy message:", err);
        res.status(500).json({ error: "Erreur lors de la suppression du message" });
    }
};

exports.groupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await knex("messages")
            .where("group_id", groupId)
            .select("id", "user_id", "group_id", "content", "created_at")
            .orderBy("id", "asc");

        res.json(messages);
    } catch (err) {
        console.error("Erreur groupMessages:", err);
        res.status(500).json({ error: "Erreur lors de la récupération des messages du groupe" });
    }
};

exports.lazyLoadMessages = async (req, res) => {
    const { groupId } = req.params;
    const { beforeId, limit = 20 } = req.query;

    try {
        const query = knex("messages")
            .where("group_id", groupId)
            .select("id", "user_id", "group_id", "content", "created_at")
            .orderBy("id", "desc")
            .limit(parseInt(limit));

        if (beforeId) {
            query.where("id", "<", parseInt(beforeId));
        }

        const messages = await query;
        res.json(messages);
    } catch (err) {
        console.error("Erreur lazyLoadMessages:", err);
        res.status(500).json({ error: "Erreur lors du lazy loading des messages" });
    }
};