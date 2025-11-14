module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host: 'mysql',        // service name in docker-compose
            user: 'root',
            password: '47fc01b0-39ab-4475-a0c6-7b2f6689f2d9',
            database: 'mydb'
        },
        migrations: {
            directory: './migrations'
        }
    }
};
