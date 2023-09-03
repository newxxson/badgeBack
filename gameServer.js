import { GameRoom } from "./DataBase/GameRoom";
import { Univ } from "./DataBase/Univ";
import { User } from "./DataBase/User";

export default function gameServer(io) {
  const rooms = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Create a new game room and notify the creator of game.
    socket.on("createGame", async (data) => {
      const roomId = createRoomId();
      try {
        const newRoom = await GameRoom.create({
          creatorId: data.Id,
          roomId: roomId,
        });
        socket.join(roomId);
        rooms[roomId] = { creator: socket };
        socket.emit("newGame", {
          message: "game created",
          status: "success",
          roomId,
        });
      } catch (error) {
        console.error("Error creating game room:", error);
      }
    });
    socket.on("searchGame", async (data) => {
      try {
        const roomId = data.roomId;
        if (rooms[roomId]) {
          const room = await GameRoom.findOne({
            where: {
              roomId: roomId,
            },
          });
          const creator = room.getCreator();
          socket.emit("searchGame", {
            message: "gameRoom found",
            status: "success",
            creatorId: creator.id,
            creatorUniv: creator.univ,
            creatorWin: creator.wins,
            creatorTotal: creator.total,
            creatorBadge:
              creator.univ == "korea" ? creator.yonBadge : creator.kuBadge,
          });
        } else {
          socket.emit("error", {
            message: "cannot find gameRoom",
            status: "error",
          });
        }
      } catch (error) {
        console.log("error", error);
      }
    });
    // When a player joins the room, notify all players in the room.
    socket.on("joinGame", async (data) => {
      try {
        const roomId = data.roomId;
        if (rooms[roomId]) {
          const room = await GameRoom.findOne({
            where: {
              roomId: roomId,
            },
          });
          const visitor = await User.findByPk(data.id);
          const creator = room.getCreator();
          //define room setting
          room.visitorId = visitor.id;
          room.civil = visitor.univ == creator.univ ? true : false;

          rooms[roomId]["visitor"] = socket;
          socket.join(roomId);
          socket.emit("joinGame", {
            message: "joining game",
            status: "success",
            creatorId: creator.id,
            creatorUniv: creator.univ,
            creatorWin: creator.wins,
            creatorTotal: creator.total,
            creatorBadge:
              creator.univ == "korea" ? creator.yonBadge : creator.kuBadge,
          });
          io.to(roomId).emit("playerJoin", {
            message: "player joined the game",
            status: "success",
            visitorId: visitor.id,
            visitorUniv: visitor.univ,
            visitorWin: visitor.wins,
            visitorTotal: visitor.total,
            visitorBadge:
              visitor.univ == "korea" ? visitor.yonBadge : visitor.kuBadge,
          });
          await room.save();
        } else {
          socket.emit("error", { message: "Invalid room ID", status: "error" });
        }
      } catch (error) {
        console.log("error", error);
      }
    });
    socket.on("startGame", async (data) => {
      try {
        const roomId = data.roomId;
        if (rooms[roomId]) {
          const room = await GameRoom.findOne({
            where: {
              roomId: roomId,
            },
          });
          const visitorId = data.visitorId;
          if (visitorId == room.visitorId) {
            io.to(roomId).emit("startGame", {
              message: "start game",
              state: "success",
            });
            startGame(roomId, rooms);
          } else {
            socket.emit("error", {
              message: "you are not the vistor",
              status: "error",
            });
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    });

    socket.on("choose", async (data) => {
      try {
        const roomId = data.roomId;
        const userId = data.id;
        const choice = data.choice;
        if (rooms[roomId]) {
          const room = await GameRoom.findOne({
            where: {
              roomId: roomId,
            },
          });
          if (userId == room.creator) {
            rooms[roomId]["creatorChoice"] = choice;
          } else if (userId == room.visitor) {
            rooms[roomId]["visitorChoice"] = choice;
          } else {
            socket.emit("error", { message: "who are you?", status: "error" });
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    });

    // Handle disconnection, remove player from room.
    socket.on("disconnect", (data) => {
      for (const [roomId, room] of Object.entries(rooms)) {
        const playerIndex = room.players.indexOf(socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            delete rooms[roomId];
          } else {
            io.to(roomId).emit("playerLeft", { playerId: socket.id });
          }
          break;
        }
      }
      console.log("User disconnected:", socket.id);
    });
  });

  function startGame(roomId) {
    const room = GameRoom.findOne({
      where: {
        roomId: roomId,
      },
    });
    setTimeout(() => {
      const creatorChoice =
        rooms[roomId]["creatorChoice"] ||
        ["rock", "paper", "scissor"][Math.floor(Math.random() * 3)];
      const visitorChoice =
        rooms[roomId]["visitorChoice"] ||
        ["rock", "paper", "scissor"][Math.floor(Math.random() * 3)];

      // Calculate the winner (this is a simple example)
      const winner = chooseWinner(creatorChoice, visitorChoice);
      const winnerChoice = winner == "creator" ? creatorChoice : visitorChoice;
      io.to(room.roomId).emit("gameResult", {
        message: "game ended",
        status: "success",
        winner: room.winnerId,
        winnerChoice: winnerChoice,
      });
      handleWin(room, winner, winnerChoice);
    }, 5500);
  }
}

function createRoomId(rooms) {
  let roomId;
  do {
    roomId = Math.floor(Math.random() * 1000000);
  } while (rooms.hasOwnProperty(roomId));
  return roomId;
}

function chooseWinner(creatorChoice, visitorChoice) {
  if (creatorChoice === visitorChoice) {
    return "draw";
  }

  if (
    (creatorChoice === "rock" && visitorChoice === "scissors") ||
    (creatorChoice === "scissors" && visitorChoice === "paper") ||
    (creatorChoice === "paper" && visitorChoice === "rock")
  ) {
    return "creator";
  }

  return "visitor";
}

function handleWin(room, winner, winnerChoice) {
  if (winner == "creator") {
    winner = room.getCreator();
    loser = room.getVisitor();
  } else {
    winner = room.getVisitor();
    loser = room.getCreator();
  }
  //record
  room.winnerId = winner.id;
  room.winMethod = winnerChoice;
  //statistics
  winner.wins += 1;
  winner.total += 1;
  loser.total += 1;

  if (winnerChoice === "rock") winner.rockNum += 1;
  else if (winnerChoice === "paper") winner.paperNum += 1;
  else winner.scissorNum += 1;

  //user badge
  if (room.civil) {
    if (winner.univ == "korea") {
      winner.kuBadge += 1;
      loser.kuBadge -= 1;
    } else {
      winner.yonBadge += 1;
      loser.yonBadge -= 1;
    }
  } else {
    if (winner.univ == "korea") {
      winner.yonBadge += 1;
      loser.yonBadge -= 1;
    } else {
      winner.kuBadge += 1;
      loser.kuBadge -= 1;
    }
    //univ badge
    winUniv = winner.getUniv();
    winUniv.badgeAmount += 1;
  }
}

function deactivateRoom(rooms, room) {}

// function sendResults(room, rooms, io, winner) {
//   io.to(room.roomId).emit("gameResult", {
//     message: "game ended",
//     status: "success",
//     winner: room.winnerId,
//   });
//   creatorSocket = rooms[room.roomId]["creator"];
//   visitorSocket = rooms[room.roomId]["visitor"];
//   if (winner == "creator") {
//     creatorSocket.emit('sendStatistic', {
//       status:'success',

//     })
//   }
// }
function deactivateRoomID(roomId, gameRoom) {
  activatedRoomId.pop(roomId);
  gameRoom.roomId = 0;
}
