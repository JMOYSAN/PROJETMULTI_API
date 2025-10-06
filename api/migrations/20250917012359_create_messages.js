/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Création de la table
    await knex.schema.createTable('messages', (table) => {
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

    // Récupérer des utilisateurs pour insérer des messages
    const users = await knex('users').limit(2); // utilise les 5 premiers utilisateurs pour varier
    if (users.length === 0) {
        throw new Error("Aucun utilisateur trouvé pour insérer des messages");
    }

    const now = new Date();
    const messages = [];

    for (let i = 1; i <= 100; i++) {
        const user = users[i % users.length]; // alterne entre les utilisateurs
        messages.push({
            user_id: user.id,
            group_id: 1,
            content: `Message automatique #${i}`,
            created_at: now,
        });
    }

    // Insérer dans la table
    await knex('messages').insert(messages);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('messages');
};
