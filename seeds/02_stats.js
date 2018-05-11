exports.seed = function(knex, Promise) {
    // Deletes ALL existing entries
    return knex('stats').del()
        .then(function() {
            // Inserts seed entries
            return knex('stats').insert([
                { user_id: 1, total_scores: 596, wins: 5, played: 8, game_types: 'pvp' },
                { user_id: 2, total_scores: 9099, wins: 25, played: 30, game_types: 'pvp' },
                { user_id: 3, total_scores: 609, wins: 7, played: 235, game_types: 'pvp' }
            ]);
        });
};