/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Création de la table
    await knex.schema.createTable('groups_users', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');
        table.integer('group_id').unsigned().notNullable()
            .references('id').inTable('groups')
            .onDelete('CASCADE');
        table.timestamps(true, true);
        table.unique(['user_id', 'group_id']); // éviter les doublons
    });

    // Récupérer les IDs des deux utilisateurs
    const users = await knex('users').whereIn('username', ['user1', 'user2']);
    if (users.length < 2) {
        throw new Error("user1 ou user2 n'existent pas dans la table users");
    }
    const user1Id = users.find(u => u.username === 'user1').id;
    const user2Id = users.find(u => u.username === 'user2').id;

    // Générer les entrées pour les groupes 30 à 60
    const now = new Date();
    const groupUserEntries = [];
    for (let groupId = 30; groupId <= 60; groupId++) {
        groupUserEntries.push({ user_id: user1Id, group_id: groupId, created_at: now, updated_at: now });
        groupUserEntries.push({ user_id: user2Id, group_id: groupId, created_at: now, updated_at: now });
    }

    // Insérer dans la table
    await knex('groups_users').insert(groupUserEntries);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('groups_users');
};
