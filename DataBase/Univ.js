import { DataTypes, Model } from "sequelize";
import sequelize from "./DataBase";

export class Univ extends Model {}

Univ.init(
  {
    univName: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    badgeAmount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Univ",
    tableName: "Univ",
  }
);
