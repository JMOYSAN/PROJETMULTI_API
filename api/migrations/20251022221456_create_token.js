exports.up = async function (knex) {
    await knex.schema.createTable("refresh_tokens", (table) => {
        table.increments("id").primary();
        table
            .integer("user_id")
            .unsigned()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        table.text("token").notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable("revoked_tokens", (table) => {
        table.increments("id").primary();
        table.text("token").notNullable();
        table.timestamp("revoked_at").defaultTo(knex.fn.now());
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("revoked_tokens");
    await knex.schema.dropTableIfExists("refresh_tokens");
};

