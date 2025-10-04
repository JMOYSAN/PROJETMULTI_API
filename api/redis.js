// config/redis.js
const { createClient } = require("redis");
const url = process.env.REDIS_URL || "redis://redis:6379";

const publisher = createClient({ url });
const subscriber = createClient({ url });

module.exports = { publisher, subscriber };
