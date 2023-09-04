import User from "../../DataBase/User.js";

export default async function checkAvailable(req, res, userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    let currentTime = new Date().getTime();
    const timeInterval = currentTime - user.godlimit.getTime();

    if (timeInterval > 5 * 60 * 1000) {
      res.status(200).json({ message: "time interval okay" });
    } else {
      const differenceInSeconds = Math.floor(timeInterval / 1000);
      const minutes = Math.floor(differenceInSeconds / 60);
      const seconds = differenceInSeconds % 60;

      const displayTime = `${minutes}:${
        seconds < 10 ? "0" + seconds : seconds
      }`;

      res.status(400).json({ message: "too soon", displayTime: displayTime });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "internal server error" });
  }
}
