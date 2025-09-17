module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: 'mysql',     // name of the service in docker-compose
      user: 'root',
      password: 'password',
      database: 'mydb'
    },
    migrations: {
      directory: './migrations'
    }
  }
};
