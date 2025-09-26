/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username').notNullable();
        table.string('password').notNullable();
        table.enum('theme', ['dark', 'light']).notNullable().defaultTo('light');
        table.enum('online_status', ['online', 'offline', 'away']).notNullable().defaultTo('offline');
        table.timestamps(true, true);
    });


    const users = [];
    for (let i = 1; i <= 100; i++) {
        users.push({
            username: `user${i}`,
            password: `mdpUser${i}`,
            theme: i % 2 === 1 ? 'light' : 'dark',
            online_status: i % 2 === 1 ? 'online' : 'offline',
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    await knex('users').insert(users);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTable('users');
};
