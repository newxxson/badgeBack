import User from "../../DataBase/User.js";

export default async function checkAvailable(req, res, userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    let currentTime = new Date().getTime();
    const timeInterval = currentTime - user.godLimit.getTime();

    if (timeInterval > 5 * 60 * 1000) {
      res.status(200).json({ message: "time interval okay", timeInterval });
    } else {
      res
        .status(400)
        .json({
          message: "too soon",
          timeInterval: 5 * 60 * 1000 - timeInterval,
        });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "internal server error" });
  }
}
