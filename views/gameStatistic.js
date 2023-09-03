import GameRoom from "../DataBase/GameRoom.js";
import Univ from "../DataBase/Univ.js";
import User from "../DataBase/User.js";

export default async function gameStatistic(req, res, userId) {
  try {
    const user = await User.findByPk(userId);
    if (user) {
      const {
        nickname,
        univ,
        kuBadge,
        yonBadge,
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
        kuBadge,
        yonBadge,
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
