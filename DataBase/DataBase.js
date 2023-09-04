import { Sequelize } from "sequelize";
import Univ from "./Univ.js";
import User from "./User.js";
import GameRoom from "./GameRoom.js";
import PhoneNum from "./PhoneNum.js";

export const sequelize = new Sequelize("gbb_database", "postgres", "1234", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  timezone: "Asia/Seoul",
});

export default async function initializeDatabase() {
  Univ.initSchema(sequelize);
  User.initSchema(sequelize, Univ);
  GameRoom.initSchema(sequelize, User);
  PhoneNum.initSchema(sequelize, User);

  Univ.hasMany(User, { foreignKey: "univ" });
  User.belongsTo(Univ, { foreignKey: "univ" });

  User.hasMany(GameRoom, { foreignKey: "creatorId" });
  User.hasMany(GameRoom, { foreignKey: "visitorId" });

  GameRoom.belongsTo(User, { as: "Creator", foreignKey: "creatorId" });
  GameRoom.belongsTo(User, { as: "Visitor", foreignKey: "visitorId" });

  User.hasOne(PhoneNum, { as: "PhoneNum", foreignKey: "userId" });
  PhoneNum.belongsTo(User, { as: "User", foreignKey: "userId" });

  await sequelize.sync();
  console.log("All models were synchronized successfully.");
}
