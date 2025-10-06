module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host: 'mysql',        // service name in docker-compose
            user: 'root',
            password: 'password',
            database: 'mydb'
        },
        migrations: {
            directory: './migrations'
        }
    }
};
