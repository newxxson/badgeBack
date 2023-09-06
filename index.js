import { config } from "dotenv";
config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import gameServer from "./views/game/gameServer.js";
import initializeDatabase from "./DataBase/DataBase.js";
import setGameUrl from "./views/game/urls.js";
import login from "./views/user/login.js";
import signup from "./views/user/signup.js";
import { sign } from "crypto";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://127.0.0.1:3000",
      "http:localhost:3000",
      "http:localhost:5500",
      "*",
    ], // Set your client's origin here
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use(express.json());
app.use(cors());
//gameServer.js
gameServer(io);
//game/*
setGameUrl(app);

//user
app.post("/api/user/login/", (req, res) => {
  login(req, res);
});
app.post("/api/user/signup/", (req, res) => {
  signup(req, res);
});

// Sync database and then start server
initializeDatabase()
  .then(() => {
    server.listen(3000, () => {
      console.log("Server is running");
    });
  })
  .then(() => {
    console.log("server online");
  })
  .catch((e) => {
    console.log(e);
  });
