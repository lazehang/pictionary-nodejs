exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries
    return knex('users').del()
        .then(function() {
            return knex('users').insert([
                { username: 'tom', password: '$2b$10$RXKG7GkKWJaAfE6nVxsaWuodXpEVTLl8l1mc7cWYpwxknv2BJO4PO', name: 'Tom Lee' },
                { username: '2243797762312741', password: '', social_id: '2243797762312741', name: 'Laze Hang' },
                { username: 'user1', password: '$2b$10$RXKG7GkKWJaAfE6nVxsaWuodXpEVTLl8l1mc7cWYpwxknv2BJO4PO', name: 'User 1' }

            ]);
        });
};