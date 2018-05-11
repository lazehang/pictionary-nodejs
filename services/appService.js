class AppService {
    constructor(knex) {
        this.knex = knex;
    }

    async getStat(userid) {
        return new Promise((resolve, reject) => {
            this.knex('stats')
                .where({
                    user_id: userid
                }).then((row) => {
                    resolve(row[0]);
                }).catch((err) => {
                    console.log(err.message)
                });
        });
    }

    getAllStats() {
        return new Promise((resolve, reject) => {
            this.knex('stats')
                .join('users', 'users.id', 'stats.user_id')
                .orderBy('total_scores', 'desc')
                .then((rows) => {
                    var i;
                    var rank = 1;
                    for (i = 0; i < rows.length; i++) {
                        rows[i]['index'] = rank;
                        rank++;
                    }

                    resolve(rows);

                })
                .catch((err) => {
                    console.log(err.message)
                });
        });

    }


}

module.exports = AppService;