import bcrypt from "bcrypt";
import User from "../../DataBase/User.js";
import { generateAccessToken } from "./token.js";

export default async function signup(req, res) {
  try {
    const { userId, nickname, password, univ } = req.body;

    // Check if the userId or nick already exists in the database
    const existingId = await User.findOne({
      where: {
        userId: userId,
      },
    });
    if (existingId) {
      return res.status(400).json({ message: "id" });
    }
    const existingNickname = await User.findOne({
      where: { nickname: nickname },
    });
    if (existingNickname) {
      return res.status(400).json({ message: "nickname" });
    }

    // Hash the user's password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record and save it to the database
    const user = await User.create({
      userId: userId,
      nickname: nickname,
      password: hashedPassword,
      univ: univ,
      myBadge: 10,
    });

    const token = generateAccessToken(user);

    res.status(201).json({ message: "User created successfully", token: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
