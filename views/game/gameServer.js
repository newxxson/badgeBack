import e from "express";
import GameRoom from "../../DataBase/GameRoom.js";
import Univ from "../../DataBase/Univ.js";
import User from "../../DataBase/User.js";
import makeQrCode from "./makeQrCode.js";

export default function gameServer(io) {
  const rooms = {};
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Create a new game room and notify the creator of game.
    socket.on("createGame", async (data) => {
      try {
        const user = await User.findByPk(data.userId);
        console.log("user", user.userId);
        const badge = user.myBadge;
        if (badge > 0) {
          const roomId = createRoomId(rooms);
          const newRoom = await GameRoom.create({
            creatorId: data.userId,
            roomId: roomId,
          });
          console.log(newRoom);
          socket.join(roomId);
          rooms[roomId] = { creator: socket, readyPlayer: 0 };
          const qrCode = makeQrCode(roomId);
          socket.emit("createGame", {
            message: "game created",
            status: "success",
            roomId: roomId,
            newRoom: newRoom,
            qrCode: qrCode,
          });
        } else {
          socket.emit("createGame", {
            message: "no badge",
            status: "error",
          });
        }
      } catch (error) {
        console.error("Error creating game room:", error);
        socket.emit("createGame", {
          message: "server error",
          status: "error",
        });
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
          io.to(roomId).emit("waiting", {
            message: "player signing up",
            status: "pending",
          });
          return;
        }

        if (rooms[roomId]) {
          const room = await GameRoom.findOne({
            where: {
              roomId: roomId,
            },
          });

          const visitor = await User.findByPk(visitorId);
          const creator = await User.findByPk(room.creatorId);

          //define room setting
          room.visitorId = visitor.userId;
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
            creatirBadge: creator.myBadge,
          });
          console.log(rooms);
          console.log(roomId);
          const data = {
            message: "player joined the game",
            status: "success",
            visitorNickname: visitor.nickname,
            visitorUniv: visitor.univ,
            visitorWin: visitor.wins,
            visitorTotal: visitor.total,
            visitorBadge: visitor.myBadge,
            roomId: roomId,
          };
          broadcast(rooms[roomId], "waiting", data);

          //auto start after visitor joins
          setTimeout(() => {
            if (rooms[roomId]["readyPlayer"] < 2 && !rooms[roomId]["block"]) {
              rooms[roomId]["block"] = true;
              const data = {
                message: "start game",
                state: "success",
              };
              broadcast(rooms[roomId], "startGame", data);
              startGame(roomId);
            }
          }, 5500);

          await room.save();
        } else {
          socket.emit("joinGame", {
            message: "Invalid room ID",
            status: "error",
          });
        }
      } catch (error) {
        socket.emit("joinGame", {
          message: "server error",
          status: "error",
        });
        console.log("error", error);
      }
    });

    socket.on("startGame", async (data) => {
      try {
        const roomId = data.roomId;
        if (
          //check if user and room is valid
          rooms[roomId] &&
          (rooms[roomId]["visitor"].id === socket.id ||
            rooms[roomId]["creator"].id === socket.id)
        ) {
          rooms[roomId]["readyPlayer"] += 1;
        } else {
          socket.emit("startGame", {
            message: "socket id does not match",
            socketId: socket.id,
          });
          return;
        }

        if (rooms[roomId]["readyPlayer"] >= 2) {
          const data = {
            message: "start game",
            state: "success",
          };
          broadcast(rooms[roomId], "startGame", data);
          if (!rooms[roomId]["block"]) {
            rooms[roomId]["block"] = true;
            startGame(roomId);
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    });

    socket.on("choice", async (data) => {
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
          if (userId == room.creatorId) {
            rooms[roomId]["creatorChoice"] = choice;
          } else if (userId == room.visitorId) {
            rooms[roomId]["visitorChoice"] = choice;
          } else {
            socket.emit("choice", { message: "who are you?", status: "error" });
            return;
          }
          socket.emit("choice", {
            message: "saved",
            status: "success",
            choice: choice,
          });
        }
      } catch (error) {
        console.log("error", error);
        socket.emit("choice", { message: "server error" });
      }
    });
    socket.on("deactivate", async (data) => {
      const roomId = data.roomId;
      if (!rooms[roomId]) {
        socket.emit("deactivate", {
          message: "already deactivated",
          status: "error",
        });
        console.log("already deactivated");
        return;
      }
      const room = await GameRoom.findOne({
        where: {
          roomId: roomId,
        },
      });
      if (room.creatorId == data.userId) {
        deactivateRoom(rooms, room);
        socket.emit("deactivate", {
          message: "room deactivated",
          status: "success",
        });
      } else {
        socket.emit("deactivate", { message: "unauthorized", status: "error" });
      }
    });
  });

  async function startGame(roomId) {
    const room = await GameRoom.findOne({
      where: {
        roomId: roomId,
      },
    });
    setTimeout(async () => {
      const creatorChoice =
        rooms[roomId]["creatorChoice"] ||
        ["rock", "paper", "scissor"][Math.floor(Math.random() * 3)];
      const visitorChoice =
        rooms[roomId]["visitorChoice"] ||
        ["rock", "paper", "scissor"][Math.floor(Math.random() * 3)];

      // Calculate the winner (this is a simple example)
      const winner = chooseWinner(creatorChoice, visitorChoice);
      if (winner === "draw") {
        const data = {
          message: "draw",
          status: "success",
          winner: "draw",
          choice: rooms[roomId]["visitorChoice"],
        };
        broadcast(rooms[roomId], "gameResult", data);
        setTimeout(async () => {
          startGame(roomId);
        }, 3000);
      }
      const winnerChoice = winner == "creator" ? creatorChoice : visitorChoice;
      broadcast(rooms[roomId], "gameResult", {
        message: "game ended",
        status: "success",
        winner: winner,
        winnerChoice: winnerChoice,
      });
      const result = await handleWin(room, winner, winnerChoice);
      deactivateRoom(rooms, room);
    }, 5500);
  }
}

function createRoomId(room) {
  let roomId;
  do {
    roomId = Math.floor(Math.random() * 1000000);
  } while (room.hasOwnProperty(roomId));
  console.log("createRoomId", roomId);
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

async function handleWin(room, winnerIs, winnerChoice) {
  let winner;
  let loser;
  let winUniv;
  console.log("room", room);
  if (winnerIs == "creator") {
    winner = await User.findByPk(room.creatorId);
    loser = await User.findByPk(room.visitorId);
  } else {
    winner = await User.findByPk(room.visitorId);
    loser = await User.findByPk(room.creatorId);
  }
  //record
  room.winnerId = winner.userId;
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
    winner.myBadge += 1;
    loser.myBadge -= 1;
  } else {
    winner.getBadge += 1;
    loser.myBadge -= 1;
    //univ badge
    winUniv = await Univ.findByPk(winner.univ);
    winUniv.badgeAmount += 1;
  }
  //save
  await room.save();
  await winner.save();
  await loser.save();
  await winUniv.save();
}

function deactivateRoom(rooms, room) {
  const roomId = room.roomId;
  if (rooms[roomId]["creator"]) rooms[roomId]["creator"].leave(roomId);
  if (rooms[roomId]["visitor"]) rooms[roomId]["visitor"].leave(roomId);
  delete rooms[roomId];
  room.roomId = 0;
  room.save();
  console.log("deactivated", rooms);
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

function broadcast(room, subject, data) {
  if (subject == "gameResult") sendGameResult(room, subject, data);
  else {
    room["creator"].emit(subject, data);
    room["visitor"].emit(subject, data);
  }
}

function getLosingChoice(choice) {
  if (choice === "rock") return "scissor";
  if (choice === "paper") return "rock";
  if (choice === "scissor") return "paper";
}

function sendGameResult(room, subject, data) {
  let creatorChoice, creatorResult;
  let visitorChoice, visitorResult;
  if (data.winner === "creator") {
    creatorResult = "win";
    creatorChoice = data.winnerChoice;
    visitorChoice = "lose";
    visitorChoice = getLosingChoice(creatorChoice);
  } else if (data.winner == "visitor") {
    visitorResult = "win";
    visitorChoice = data.winnerChoice;
    creatorResult = "lose";
    creatorChoice = getLosingChoice(visitorChoice);
  } else {
    visitorResult = "draw";
    creatorResult = "draw";
    visitorChoice = data.choice;
    creatorChoice = data.choice;
  }
  const creatorData = {
    message: data.message,
    status: data.status,
    result: creatorResult,
    myChoice: creatorChoice,
    opChoice: visitorChoice,
  };
  const visitorData = {
    message: data.message,
    status: data.status,
    result: visitorResult,
    myChoice: visitorChoice,
    opChoice: creatorChoice,
  };

  room["creator"].emit(subject, creatorData);
  room["visitor"].emit(subject, visitorData);
}
