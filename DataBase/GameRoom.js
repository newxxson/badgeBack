import { DataTypes, Model } from "sequelize";
import sequelize from "./DataBase";
import User from "./User";

export class GameRoom extends Model {}

GameRoom.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.STRING, //turns to 0 after game ends
    },
    creatorId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
    visitorId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
      allowNull: true,
    },
    winnerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    winMethod: {
      type: DataTypes.ENUM,
      values: ["rock", "paper", "scissors"], // Replace with your actual methods
      allowNull: true,
    },
    civil: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "GameRoom",
    tableName: "gameRoom",
    timestamps: true, // Enables createdAt and updatedAt
    createdAt: "createdAt", // Changes the default column name
  }
);

// Create foreign key relationship
User.hasMany(GameRoom, { foreignKey: "creatorId" });
User.hasMany(GameRoom, { foreignKey: "visitorId" });

GameRoom.belongsTo(User, { as: "Creator", foreignKey: "creatorId" });
GameRoom.belongsTo(User, { as: "Visitor", foreignKey: "visitorId" });
