const { DataTypes, Model } = require("sequelize");
import sequelize from "./DataBase";
import Univ from "./Univ";

export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    nick: {
      type: DataTypes.STRING,
      unique: true,
    },
    univ: {
      type: DataTypes.STRING,
      references: {
        model: Univ,
        key: "univName",
      },
    },
    kuBadge: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    yonBadge: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    wins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rockNum: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    paperNum: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    scissorNum: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    godLimit: {
      type: DataTypes.DATE,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "user",
  }
);

Univ.hasMany(User, { foreignKey: "univ" });
User.belongsTo(Univ, { foreignKey: "univ" });
