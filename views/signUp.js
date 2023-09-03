import bcrypt from 'bcrypt';
import { User } from '../DataBase/User';

export default async function signUp(req, res) {
  try {
    const { userId, nickname, password, univ } = req.body;

    // Check if the userId or nick already exists in the database
    const existingUser = await User.findOne({
      where: {
        $or: [
          { userId: userId },
          { nickname: nickname },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with the same ID or nickname already exists' });
    }

    // Hash the user's password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record and save it to the database
    await User.create({
      userId: userId,
      nickname: nickname,
      password: hashedPassword,
      univ: univ,
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}