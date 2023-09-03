import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../DataBase/User';

export default async function login(req, res) {
  try {
    const { userId, password } = req.body;

    // Check if the user with the provided userId exists in the database
    const user = await User.findOne({
      where: {
        userId: userId,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if the provided password matches the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate a JSON Web Token (JWT) for the user
    const token = generateAuthToken(user);

    // Return the token as part of the response
    res.status(200).json({ token: token, message: 'login is complete' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

function generateAuthToken(user) {
  const payload = {
    userId: user.userId,
    nick: user.nick,
    // Add other user-related data if needed
  };

  const options = {
    expiresIn: '1h', // Token expires in 1 hour (you can adjust this)
  };

  const secretKey = 'your-secret-key'; // Replace with your own secret key
  const token = jwt.sign(payload, secretKey, options);

  return token;
}