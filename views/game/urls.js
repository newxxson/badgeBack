import { authenticateToken } from "../user/token.js";
import checkAvailable from "./checkAvailable.js";
import {
  gameStatistic,
  getUnivBadge,
  getRanker,
  getBadge,
  getRecord,
} from "./gameStatistic.js";

export default function gameUrl(app) {
  //checkAvailable.js
  app.get("api/game/check-available/", authenticateToken, (req, res) => {
    const userId = req.user.id;
    checkAvailable(req, res, userId);
  });

  //gameStatistic.js
  app.get("api/game/statistic/", authenticateToken, (req, res) => {
    const userId = req.user.id;
    gameStatistic(req, res, userId);
  });
  app.get("api/game/get-univ-badge/", getUnivBadge);
  app.get("api/game/get-ranker/", authenticateToken, (req, res) => {
    const userId = req.user.id;
    getRanker(req, res, userId);
  });
  app.get("api/game/get-badge/", authenticateToken, (req, res) => {
    const userId = req.user.id;
    getBadge(req, res, userId);
  });
  app.get("api/game/getRecord/", authenticateToken, (req, res) => {
    const userId = req.user.id;
    getRecord(req, res, userId);
  });
}
