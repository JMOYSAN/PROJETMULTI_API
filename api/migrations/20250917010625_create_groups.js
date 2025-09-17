/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('groups', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();   // group name
        table.boolean('is_private').defaultTo(false);  // private/public
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('groups');
};