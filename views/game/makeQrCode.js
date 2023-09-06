import pkg from "qrcode";
const { QRCode } = pkg;
export default async function makeQrCode(roomId) {
  const baseUrl =
    "https://port-0-badgeback-jvvy2blm6d8yj1.sel5.cloudtype.app/api/game/join-game/";
  const sendUrl = baseUrl + roomId;
  const qrDataURL = await QRCode.toDataURL(sendUrl);
  return qrDataURL;
}
