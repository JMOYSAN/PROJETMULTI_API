require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const helmet = require("helmet");
const apiRouter = require("./routes/api");
/*
// INTEGRATION REDIS
const Redis = require("ioredis");
const sub = new Redis();
const pub = new Redis();

sub.subscribe("chat");

sub.on("message", (channel, message) => {
    console.log(`Received message from ${channel}: ${message}`);
});

function onClientMessage(channel, message) {
    console.log(`Client received message from ${channel}: ${message}`);
}
 */
// INTEGRATION REDIS
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));



app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRouter);
app.use("/users", require("./routes/users"));
//app.use("/groups", require("./routes/groups"));
//app.use("/messages", require("./routes/messages"));
//app.use("/group-users", require("./routes/groupUsers"));

app.listen(port, '0.0.0.0', () => {
  console.log(`Listening at http://localhost:${port}`);
});
