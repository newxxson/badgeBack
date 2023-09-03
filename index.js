import express from "express";
import http from "http";
import { Server } from "socket.io";
import sequelize from "./DataBase/DataBase.js";
import User from "./DataBase/User.js";
import GameRoom from "./DataBase/GameRoom.js";
import gameServer from "./views/gameServer.js";
import gameStatistic from "./views/gameStatistic.js";
import initializeDatabase from "./DataBase/DataBase.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

gameServer(io);

app.get("/statistic/:userId", (req, res) => {
  const userId = req.params.userId;
  gameStatistic(req, res, userId);
});

// Sync database and then start server
initializeDatabase()
  .then(() => {
    server.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  })
  .then(() => {
    console.log("server online");
  })
  .catch((e) => {
    console.log(e);
  });
