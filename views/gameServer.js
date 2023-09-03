import GameRoom from "../DataBase/GameRoom.js";
import Univ from "../DataBase/Univ.js";
import User from "../DataBase/User.js";

export default function gameServer(io) {
  const rooms = {};
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    // Create a new game room and notify the creator of game.
    socket.on("createGame", async (data) => {
      try {
        const user = User.findByPk(data.userId);
        const badge = user.univ == "korea" ? user.kuBadge : user.yonBadge;
        if (badge > 0) {
          const roomId = createRoomId(Object.keys(rooms));
          const newRoom = await GameRoom.create({
            creatorId: data.userId,
            roomId: roomId,
          });
          socket.join(roomId);
          rooms[roomId] = { creator: socket, readyPlayer: 0 };
          socket.emit("newGame", {
            message: "game created",
            status: "success",
            roomId: roomId,
          });
        } else {
          socket.emit("error", {
            message: "no badge",
            status: "error",
          });
        }
      } catch (error) {
        console.error("Error creating game room:", error);
      }
    });
    // socket.on("searchGame", async (data) => {
    //   try {
    //     const roomId = data.roomId;
    //     if (rooms[roomId]) {
    //       const room = await GameRoom.findOne({
    //         where: {
    //           roomId: roomId,
    //         },
    //       });
    //       const creator = room.getCreator();
    //       socket.emit("searchGame", {
    //         message: "gameRoom found",
    //         status: "success",
    //         creatorId: creator.id,
    //         creatorUniv: creator.univ,
    //         creatorWin: creator.wins,
    //         creatorTotal: creator.total,
    //         creatorBadge:
    //           creator.univ == "korea" ? creator.yonBadge : creator.kuBadge,
    //       });
    //     } else {
    //       socket.emit("error", {
    //         message: "cannot find gameRoom",
    //         status: "error",
    //       });
    //     }
    //   } catch (error) {
    //     console.log("error", error);
    //   }
    // });
    // When a player joins the room, notify all players in the room.
    socket.on("joinGame", async (data) => {
      try {
        const roomId = data.roomId;
        const visitorId = data.userId;

        //telling creator to wait
        if (visitorId == null) {
          io.to(roomId).emit("wait", {
            message: "player signing up",
            status: "success",
          });
          return;
        }

        if (rooms[roomId]) {
          const room = await GameRoom.findOne({
            where: {
              roomId: roomId,
            },
          });
          const visitor = await User.findByPk(data.userId);
          const creator = room.getCreator();

          //define room setting
          room.visitorId = visitor.id;
          room.civil = visitor.univ == creator.univ ? true : false;

          rooms[roomId]["visitor"] = socket;
          socket.join(roomId);
          socket.emit("joinGame", {
            message: "joining game",
            status: "success",
            creatorNickname: creator.nickname,
            creatorUniv: creator.univ,
            creatorWin: creator.wins,
            creatorTotal: creator.total,
          });
          io.to(roomId).emit("playerJoin", {
            message: "player joined the game",
            status: "success",
            visitorNickname: visitor.nickname,
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
          rooms[roomId]["readyPlayer"] += 1;
        }

        if (rooms[roomId]["readyPlayer"] >= 2) {
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
            if (!rooms[roomId]["block"]) {
              rooms[roomId]["block"] = true;
              startGame(roomId);
            }
          } else {
            socket.emit("error", {
              message: "no room",
              status: "error",
            });
          }
        }
        //incase of not starting
        setTimeout(() => {
          if (rooms[roomId]["readyPlayer"] < 2 && !rooms[roomId]["block"]) {
            rooms[roomId]["block"] = true;
            startGame(roomId);
          }
        });
      } catch (error) {
        console.log("error", error);
      }
    });

    socket.on("choose", async (data) => {
      try {
        const roomId = data.roomId;
        const userId = data.userId;
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
      if (winner === "draw") {
        io.to(roomId).emit("gameResult", {
          message: "draw",
          status: "success",
        });
        startGame(roomId);
      }
      const winnerChoice = winner == "creator" ? creatorChoice : visitorChoice;
      io.to(room.roomId).emit("gameResult", {
        message: "game ended",
        status: "success",
        winner: winner,
        winnerChoice: winnerChoice,
      });
      handleWin(room, winner, winnerChoice);
      deactivateRoom(rooms, room);
    }, 5500);
  }
}

function createRoomId(roomKeys) {
  let roomId;
  do {
    roomId = Math.floor(Math.random() * 1000000);
  } while (roomKeys.includes(roomId));
  return roomId;
}

function chooseWinner(creatorChoice, visitorChoice) {
  if (creatorChoice === visitorChoice) return "draw";

  if (
    (creatorChoice === "rock" && visitorChoice === "scissors") ||
    (creatorChoice === "scissors" && visitorChoice === "paper") ||
    (creatorChoice === "paper" && visitorChoice === "rock")
  )
    return "creator";

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
  //save
  room.save();
  winner.save();
  loser.save();
  winUniv.save();
}

function deactivateRoom(rooms, room) {
  const roomId = room.roomId;
  rooms[roomId]["creator"].leave(roomId);
  rooms[roomId]["visitor"].leave(roomId);
  delete rooms[roomId];
  room.roomId = 0;
  room.save();
}

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
