import { urlencoded } from "express";
import { authenticateToken } from "../user/token.js";
import checkAvailable from "./checkAvailable.js";
import {
  gameStatistic,
  getUnivBadge,
  getRanker,
  getBadge,
  getRecord,
} from "./gameStatistic.js";
import godGame from "./godGame.js";

export default function setGameUrl(app) {
  //checkAvailable.js
  app.get("/api/game/check-available/", authenticateToken, (req, res) => {
    const userId = req.user.userId;
    checkAvailable(req, res, userId);
  });
  //godGame.js
  app.post("/api/game/god-game/", authenticateToken, (req, res) => {
    const userId = req.user.userId;
    godGame(req, res, userId);
  });

  //gameStatistic.js
  app.get("/api/game/statistic/", authenticateToken, (req, res) => {
    const userId = req.user.userId;
    console.log("game/statistic", userId);
    gameStatistic(req, res, userId);
  });
  app.get("/api/game/get-univ-badge/", getUnivBadge);
  app.get("/api/game/get-ranker/", authenticateToken, (req, res) => {
    const userId = req.user.userId;
    getRanker(req, res, userId);
  });
  app.get("/api/game/get-badge/", authenticateToken, (req, res) => {
    const userId = req.user.userId;
    getBadge(req, res, userId);
  });
  app.get("/api/game/get-record/", authenticateToken, (req, res) => {
    const userId = req.user.userId;
    getRecord(req, res, userId);
  });

  //add gaming
  app.get("/api/game/join-game/:gameId", (req, res) => {
    const gameId = req.params.gameId;
    res.status(200).json({ message: "hello", gameId });
  });
}
