import User from "../../DataBase/User.js";

export default async function godGame(req, res, userId) {
  try {
    console.log(req.body);
    const { choice } = req.body;

    //check out whether database has user or not
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let currentTime = new Date().getTime();
    const timeInterval = currentTime - user.godLimit.getTime();
    if (timeInterval < 5 * 60 * 1000) {
      res.status(400).json({ message: "too soon", timeInterval });
      return;
    }
    const gmChoices = ["rock", "paper", "scissors"];
    const gmChoice = gmChoices[Math.floor(Math.random() * gmChoices.length)];
    //creat gm's random choice

    let result = "tie";
    if (
      (choice === "rock" && gmChoice === "scissors") ||
      (choice === "scissors" && gmChoice === "paper") ||
      (choice === "paper" && gmChoice === "rock")
    ) {
      // User wins
      result = "win";
      // Increase the user's badge by three
      user.myBadge += 3;
    } else if (
      (gmChoice === "rock" && choice === "scissors") ||
      (gmChoice === "scissors" && choice === "paper") ||
      (gmChoice === "paper" && choice === "rock")
    ) {
      // GM wins, or you can handle this separately
      result = "lose";
    }

    if (result === "win" || result === "lose") {
      user.godLimit = new Date();
    }

    // Save the user's changes to the database
    await user.save();
    return res.status(200).json({ gmChoice, result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
