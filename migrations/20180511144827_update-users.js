exports.up = function(knex, Promise) {
    return knex.schema.table('users', function(t) {
        t.string('name').nullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(t) {
        t.dropColumn('name');
    });
};