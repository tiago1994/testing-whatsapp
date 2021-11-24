const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const fs = require("fs");

const SESSION_FILE_PATH = "./session.json";
let sessionCfg;
let client;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
  client = new Client({
    session: sessionCfg,
  });
}else{
  client = new Client();
}

client.on("authenticated", (session) => {
  console.log("AUTHENTICATED", session);
  sessionCfg = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
    if (err) {
      console.error(err);
    }
  });
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessfull
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("qr", (qr) => {
  console.log('QR String', qr)
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  console.log("MESSAGE RECEIVED", msg);

  if (msg.body === "!ping reply") {
    // Send a new message as a reply to the current one
    msg.reply("pong");
  } else if (msg.body === "!ping") {
    // Send a new message to the same chat
    console.log("here", msg.from);
    client.sendMessage(msg.from, "pong");
  } else if (msg.body.startsWith("!sendto ")) {
    // Direct send a new message to specific id
    let number = msg.body.split(" ")[1];
    let messageIndex = msg.body.indexOf(number) + number.length;
    let message = msg.body.slice(messageIndex, msg.body.length);
    number = number.includes("@c.us") ? number : `${number}@c.us`;
    let chat = await msg.getChat();
    chat.sendSeen();
    client.sendMessage(number, message);
  }
});
client.initialize();
