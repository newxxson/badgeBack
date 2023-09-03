import { Sequelize } from "sequelize";
const CONNECTION_STRING =
  "postgresql://postgresql:1234@localhost:5432/gbb_database";
const sequelize = new Sequelize(CONNECTION_STRING, {
  timezone: "Asia/Seoul",
});

export default sequelize;
