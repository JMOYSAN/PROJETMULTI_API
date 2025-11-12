/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable("devices", (table) => {
        table.increments("id").primary();
        table.integer("user_id").notNullable();
        table.string("device_id", 64).notNullable();
        table.binary("ik_pub", 32).notNullable();
        table.binary("sig_pub", 32).notNullable();
        table.string("display_name", 255);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.unique(["user_id", "device_id"]);
    });

    await knex.schema.createTable("prekeys", (table) => {
        table.increments("id").primary();
        table.integer("user_id").notNullable();
        table.string("device_id", 64).notNullable();
        table.binary("spk_pub", 32).notNullable();
        table.binary("spk_sig", 64).notNullable();
        table.binary("opk_pub", 32);
        table.integer("opk_id");
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });

    await knex.schema.createTable("e2ee_messages", (table) => {
        table.increments("id").primary();
        table.integer("group_id").nullable();
        table.integer("recipient_user_id").nullable();
        table.integer("sender_user_id").notNullable();
        table.string("sender_device_id", 64).notNullable();
        table.json("envelope").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index(["group_id", "id"]);
        table.index(["recipient_user_id", "id"]);
    });

    await knex.schema.createTable("device_membership", (table) => {
        table.increments("id").primary();
        table.integer("group_id").notNullable();
        table.integer("user_id").notNullable();
        table.string("device_id", 64).notNullable();
        table.timestamp("joined_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("device_membership");
    await knex.schema.dropTableIfExists("e2ee_messages");
    await knex.schema.dropTableIfExists("prekeys");
    await knex.schema.dropTableIfExists("devices");
};
