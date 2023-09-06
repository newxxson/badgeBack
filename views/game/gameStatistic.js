import GameRoom from "../../DataBase/GameRoom.js";
import Univ from "../../DataBase/Univ.js";
import User from "../../DataBase/User.js";
import { sequelize } from "../../DataBase/DataBase.js";

export async function gameStatistic(req, res, userId) {
  try {
    console.log("user", userId);
    const user = await User.findByPk(userId);
    if (user) {
      const {
        nickname,
        univ,
        myBadge,
        getBadge,
        wins,
        total,
        rockNum,
        paperNum,
        scissorNum,
      } = user;
      console.log("user found", nickname);
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({
        message: "user found",
        nickname: nickname,
        univ: univ,
        myBadge: myBadge,
        getBadge: getBadge,
        wins: wins,
        total: total,
        rockNum: rockNum,
        paperNum: paperNum,
        scissorNum: scissorNum,
      });
    } else {
      console.log("user not found");
      res.setHeader("Content-Type", "application/json");
      res.status(404).json({ message: "user not found" });
      return;
    }
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    res.status(500).json({ message: "error ocurred", error });
  }
}

export async function getUnivBadge(req, res) {
  try {
    const korea = await Univ.findByPk("korea");
    const yonsei = await Univ.findByPk("yonsei");
    const kuBadgeRatio =
      Math.floor(
        (korea.badgeAmount / (korea.badgeAmount + yonsei.badgeAmount)) * 100
      ) / 100;
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      kuBadgeRatio: kuBadgeRatio,
      korea: korea.badgeAmount,
      yonsei: yonsei.badgeAmount,
    });
  } catch (error) {
    console.log("error", error);
    res.setHeader("Content-Type", "application/json");
    res.status(500).json({ message: "internal server error" });
  }
}

export async function getRanker(req, res, userId) {
  try {
    const rankers = await sequelize.query(
      `SELECT "nickname","univ","getBadge", RANK() OVER (ORDER BY "getBadge" DESC) AS rank
       FROM "User"
       ORDER BY rank
       LIMIT 20`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const myRank = await sequelize.query(
      `SELECT
        RANK() OVER (ORDER BY "getBadge" DESC) AS rank
       FROM
        "User"
        WHERE
          "userId"='${userId}'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ rankers: rankers, myRank: myRank[0].rank });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function getBadge(req, res, userId) {
  try {
    const user = await User.findByPk(userId);
    res.status(200).json({ getBadge: user.getBadge, myBadge: user.myBadge });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function getRecord(req, res, userId) {
  try {
    const user = await User.findByPk(userId);
    const { nickname, wins, total, rockNum, paperNum, scissorNum, univ } = user;
    const losers = await findLosers(userId);
    const myRank = await sequelize.query(
      `SELECT
        RANK() OVER (ORDER BY "getBadge" DESC) AS rank
       FROM
        "User"
        WHERE
          "userId"='${userId}'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json({
      nickname,
      univ,
      wins,
      total,
      rockNum,
      paperNum,
      scissorNum,
      losers: losers,
      myRank: myRank[0].rank,
    });
  } catch (error) {
    console.log("error", error);
    res.setHeader("Content-Type", "application/json");
    res.status(500).json({ message: "internal server error" });
  }
}

async function findLosers(userId) {
  const [asCreator, metaData] = await sequelize.query(
    `SELECT "User"."nickname", "User"."univ", "GameRoom"."winMethod" FROM "GameRoom" JOIN "User" ON "GameRoom"."visitorId" = "User"."userId" WHERE "GameRoom"."winnerId" = '${userId}'`
  );
  const [asVisitor, dd] = await sequelize.query(
    `SELECT "User"."nickname", "User"."univ", "GameRoom"."winMethod" FROM "GameRoom" JOIN "User" ON "GameRoom"."creatorId" = "User"."userId" WHERE "GameRoom"."winnerId" = '${userId}'`
  );
  const mergedArray = [...asCreator, ...asVisitor];

  return mergedArray;
}
