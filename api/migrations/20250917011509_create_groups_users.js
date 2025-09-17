/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('groups_users', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');
        table.integer('group_id').unsigned().notNullable()
            .references('id').inTable('groups')
            .onDelete('CASCADE');
        table.timestamps(true, true);
        table.unique(['user_id', 'group_id']); // prevent duplicates
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('groups_users');
};
