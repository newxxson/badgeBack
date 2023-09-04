import express from "express";
import http from "http";
import { Server } from "socket.io";
import gameServer from "./views/game/gameServer.js";
import initializeDatabase from "./DataBase/DataBase.js";
import login from "./views/user/login.js";
import signup from "./views/user/signup.js";
import { config } from "dotenv";
import gameUrl from "./views/game/urls.js";
config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//gameServer.js
gameServer(io);
//game/*
gameUrl(app);

//user
app.post("api/user/login/", login);
app.post("api/user/signup", signup);

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
