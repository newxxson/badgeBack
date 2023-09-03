import { DataTypes, Model } from "sequelize";

export default class GameRoom extends Model {}

GameRoom.initSchema = (sequelize, User) => {
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
        type: DataTypes.STRING,
        references: {
          model: User,
          key: "id",
        },
      },
      visitorId: {
        type: DataTypes.STRING,
        references: {
          model: User,
          key: "id",
        },
        allowNull: true,
      },
      winnerId: {
        type: DataTypes.STRING,
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
};

// Create foreign key relationship
