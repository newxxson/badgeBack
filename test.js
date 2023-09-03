const socket = io(apiUrl);

socket.on("connect", () => {
  console.log("Connected to server", socket.id);
});

socket.emit("createGame", { userId: "user1" });
socket.on("createGame", (data) => {
  console.log(data);
});
