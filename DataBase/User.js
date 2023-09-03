import { DataTypes, Model } from "sequelize";
import sequelize from "./DataBase.js";
import Univ from "./Univ.js";

export default class User extends Model {}

User.initSchema = (sequelize, Univ) => {
  User.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      nickname: {
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
      myBadge: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      getBadge: {
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
      tableName: "User",
    }
  );
};
