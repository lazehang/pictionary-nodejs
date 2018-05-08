exports.up = function(knex, Promise) {
    return knex.schema.createTable('stats', (table) => {
        table.increments();
        table.integer("user_id").unsigned();
        table.integer("total_scores");
        table.integer("wins");
        table.integer("played");
        table.string("game_types").nullable();
        table.timestamps(false, true);

        table.foreign('user_id').references('users.id');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('stats');
};