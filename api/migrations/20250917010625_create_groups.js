/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('groups', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();   // group name
        table.boolean('is_private').defaultTo(false);  // private/public
        table.timestamps(true, true);
    });

    const now = new Date();

    const publicGroups = Array.from({ length: 30 }, (_, i) => ({
        name: `PublicGroup${i + 1}`,
        is_private: false,
        created_at: now,
        updated_at: now,
    }));

    const privateGroups = Array.from({ length: 30 }, (_, i) => ({
        name: `PrivateGroup${i + 1}`,
        is_private: true,
        created_at: now,
        updated_at: now,
    }));

    await knex('groups').insert([...publicGroups, ...privateGroups]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTable('groups');
};
