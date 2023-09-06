const socket = window.io(
  "https://port-0-badgeback-jvvy2blm6d8yj1.sel5.cloudtype.app/",
  {
    transports: ["polling"],
  }
); // Replace with your server's address and port

socket.on("connect", () => {
  console.log("Connected to server", socket.id);
});

socket.emit("createGame", { userId: "user0" });
socket.once("createGame", (data) => {
  const imgElement = document.getElementById("qrCodeImage");
  imgElement.src = data.qrCode;
});
