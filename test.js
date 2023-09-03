const { Server } = require("socket.io");
const io = new Server(3000);

io.on("connection", (socket) => {
  // Create game room
  socket.on("createGame", async (data) => {
    try {
      const newRoom = await GameRoom.create({
        creatorId: data.creatorId,
        // other fields
      });
      socket.join(newRoom.id);
      io.to(newRoom.id).emit("newGame", { roomId: newRoom.id });
    } catch (error) {
      console.error("Error creating game room:", error);
    }
  });

  // Join game room
  socket.on("joinGame", async (data) => {
    try {
      const room = await GameRoom.findByPk(data.roomId);
      if (room) {
        room.visitorId = data.visitorId;
        await room.save();
        socket.join(data.roomId);
        io.to(data.roomId).emit("playerJoined", {});
      } else {
        socket.emit("error", { message: "Invalid room ID" });
      }
    } catch (error) {
      console.error("Error joining game:", error);
    }
  });

  // User Univ
  socket.on("getUserUniv", async (userId) => {
    try {
      const user = await User.findByPk(userId, { include: Univ });
      if (user && user.Univ) {
        socket.emit("userUnivData", { univ: user.Univ.univName });
      } else {
        socket.emit("error", { message: "User or university not found" });
      }
    } catch (error) {
      console.error("Error fetching university:", error);
    }
  });

  // ... other Socket.io event handlers
});
