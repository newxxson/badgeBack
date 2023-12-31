import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();
const SECRET_KEY = process.env.SECRET_KEY;

// Function to generate an access token
export const generateAccessToken = (user) => {
  return jwt.sign({ userId: user.userId }, SECRET_KEY);
};

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
