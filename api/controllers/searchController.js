const knex = require("../db");

exports.search = async (req, res) => {
    const { term } = req.params;
    const like = `%${term}%`;

    try {
        const [users, groups, messages] = await Promise.all([
            knex("users").select("*").where("username", "like", like).limit(5),
            knex("groups").select("*").where("name", "like", like).limit(5),
            knex("messages").select("*").where("content", "like", like).limit(5)
        ]);

        res.json({ users, groups, messages });
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: "Search failed" });
    }
};
