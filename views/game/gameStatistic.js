import GameRoom from "../../DataBase/GameRoom.js";
import User from "../../DataBase/User.js";
import { sequelize } from "../../DataBase/DataBase.js";

export async function gameStatistic(req, res, userId) {
  try {
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
      res.status(200).json({
        message: "user found",
        nickname,
        univ,
        myBadge,
        getBadge,
        wins,
        total,
        rockNum,
        paperNum,
        scissorNum,
      });
    } else {
      res.status(404).json({ message: "user not found" });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: "error ocurred", error });
  }
}

export function getUnivBadge(req, res) {
  try {
    const korea = Univ.findByPk("korea");
    const yonsei = Univ.findByPk("yonsei");
    const kuBadgeRatio =
      Math.floor(
        (korea.badgeAmount / (korea.badgeAmount + yonsei.badgeAmount)) * 100
      ) / 100;
    return res.status(200).json({
      kuBadgeRatio: kuBadgeRatio,
      korea: korea.badgeAmount,
      yonsei: yonsei.badgeAmount,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function getRanker(req, res, userId) {
  try {
    const rankers = await sequelize.query(
      `SELECT
        "nickname",
        "univ",
        "getBadge",
        RANK() OVER (ORDER BY "getBadge" DESC) AS rank
       FROM
        "GameRoom"
       ORDER BY
        rank
        LIMIT 20`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const myRank = await sequelize.query(
      `SELECT
        RANK() OVER (ORDER BY "getBadge" DESC) AS rank
       FROM
        "GameRoom"
        WHERE
          "id"="${userId}"`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.status(200).json({ rankers: rankers, myRank: myRank });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export function getBadge(req, res, userId) {
  try {
    const user = User.findByPk(userId);
    res.status(200).json({ getBadge: user.getBadge, myBadge: user.myBadge });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function getRecord(req, res, userId) {
  try {
    const user = await User.findByPk(userId);
    const { nickname, wins, total, rockNum, paperNum, scissorNum } = user;
    const losers = findLosers(userId);
    const myRank = await sequelize.query(
      `SELECT
        RANK() OVER (ORDER BY "getBadge" DESC) AS rank
       FROM
        "GameRoom"
        WHERE
          "id"="${userId}"`,
      { type: sequelize.QueryTypes.SELECT }
    );
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "internal server error" });
  }
}

async function findLosers(userId) {
  const losers = await GameRoom.findAll({
    where: {
      winnerId: userId,
    },
    include: [
      {
        model: User,
        as: "User", // Assuming you've defined this association alias
        attributes: ["nickname", "univ"],
        where: sequelize.literal(
          '"User"."id" = CASE WHEN "winnerId" = "creatorId" THEN "visitorId" ELSE "creatorId" END'
        ),
      },
    ],
  });

  return losers;
}
