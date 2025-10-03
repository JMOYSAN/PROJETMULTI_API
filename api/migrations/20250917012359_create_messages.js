/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('messages', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');
        table.integer('group_id').unsigned()
            .references('id')
            .inTable('groups');
        table.text('content').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};
// Tous les messages d’un groupe
exports.groupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await knex("messages")
            .where("group_id", groupId)
            .select("id", "user_id", "group_id", "content", "created_at")
            .orderBy("created_at", "asc");

        res.json(messages);
    } catch (err) {
        console.error("Erreur groupMessages:", err);
        res.status(500).json({ error: "Erreur lors de la récupération des messages du groupe" });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('messages');
};
