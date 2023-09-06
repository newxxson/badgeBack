const QRCode = require("qrcode");

async function makeQrCode(roomId) {
  // const baseUrl =
  //   "https://port-0-badgeback-jvvy2blm6d8yj1.sel5.cloudtype.app/api/game/join-game/";
  const baseUrl = "http://localhost:3000/join-game/";
  const sendUrl = baseUrl + roomId;
  console.log(sendUrl, "adsf");
  const qrDataURL = await QRCode.toDataURL(sendUrl);
  return qrDataURL;
}

module.exports = makeQrCode;
