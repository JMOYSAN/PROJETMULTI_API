exports.up = async function (knex) {
    // Devices
    await knex.schema.createTable("devices", (table) => {
        table.integer("user_id").notNullable();
        table.string("device_id", 128).notNullable();
        table.text("ik_pub").notNullable();        // base64
        table.text("sig_pub").notNullable();       // base64
        table.string("display_name", 255).nullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.unique(["user_id", "device_id"]);
    });

    // Prekeys
    await knex.schema.createTable("prekeys", (table) => {
        table.integer("user_id").notNullable();
        table.string("device_id", 128).notNullable();
        table.text("spk_pub").notNullable();       // base64
        table.text("spk_sig").notNullable();       // base64
        table.text("opk_pub").nullable();          // base64
        table.integer("opk_id").nullable();
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.unique(["user_id", "device_id"]);
    });

    // Stored E2EE message envelopes
    await knex.schema.createTable("e2ee_messages", (table) => {
        table.increments("id").primary();
        table.integer("group_id").nullable();
        table.integer("recipient_user_id").nullable();
        table.integer("sender_user_id").notNullable();
        table.string("sender_device_id", 128).notNullable();
        table.json("envelope").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index(["group_id", "id"]);
        table.index(["recipient_user_id", "id"]);
    });

    // Future multi-device membership (optional)
    await knex.schema.createTable("device_membership", (table) => {
        table.increments("id").primary();
        table.integer("group_id").notNullable();
        table.integer("user_id").notNullable();
        table.string("device_id", 128).notNullable();
        table.timestamp("joined_at").defaultTo(knex.fn.now());
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("device_membership");
    await knex.schema.dropTableIfExists("e2ee_messages");
    await knex.schema.dropTableIfExists("prekeys");
    await knex.schema.dropTableIfExists("devices");
};
