const knex = require('knex');
const config = require('./knex.js');
module.exports = knex(config.development);
