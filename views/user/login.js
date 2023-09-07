import bcrypt from "bcrypt";
import User from "../../DataBase/User.js";
import { generateAccessToken } from "./token.js";

export default async function login(req, res) {
  try {
    const { userId, password } = req.body;
    // Check if the user with the provided userId exists in the database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(401).json({ message: "Incorrect password or id" });
    }
    // Check if the provided password matches the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password or id" });
    }

    // Generate a JSON Web Token (JWT) for the user
    const accessToken = generateAccessToken(user);
    console.log("logging in", accessToken);
    // Return the token as part of the response
    res.setHeader("Content-Type", "application/json");
    res
      .status(200)
      .json({ token: accessToken, message: "login is complete", userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
