const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username').notNullable();
        table.string('password').notNullable();
        table.string('role');
        table.enum('theme', ['dark', 'light']).notNullable().defaultTo('light');
        table.enum('online_status', ['online', 'offline', 'away']).notNullable().defaultTo('offline');
        table.timestamps(true, true);
    });

    const users = [];

    const hashedPassword1 = await bcrypt.hash('mdpUser1', SALT_ROUNDS);
    users.push({
        username: 'user1',
        password: hashedPassword1,
        theme: 'light',
        role: 'admin',
        online_status: 'online',
        created_at: new Date(),
        updated_at: new Date()
    });

    for (let i = 2; i <= 100; i++) {
        const hashedPassword = await bcrypt.hash(`mdpUser${i}`, SALT_ROUNDS);
        users.push({
            username: `user${i}`,
            password: hashedPassword,
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