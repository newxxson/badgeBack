import { DataTypes, Model } from "sequelize";

export default class PhoneNum extends Model {}
PhoneNum.initSchema = (sequelize, User) => {
  PhoneNum.init(
    {
      userId: {
        type: DataTypes.STRING,
        references: {
          model: User,
          key: "userId",
        },
        allowNull: false,
        primaryKey: true,
      },
      phoneNum: {
        type: DataTypes.STRING,
      },
      amount: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: "PhoneNum",
      tableName: "PhoneNum",
    }
  );
};
