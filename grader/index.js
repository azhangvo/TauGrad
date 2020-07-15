var fs = require("fs");
var request = require("request");
const path = require("path");

const fastify = require("fastify")({
  logger: true,
  // https: {
  //   key: fs.readFileSync("./key.pem"),
  //   cert: fs.readFileSync("./cert.pem")
  // }
});

var mongoOptions = require("./mongo.json");
var connectionString = `mongodb://${mongoOptions.user}:${encodeURIComponent(
  mongoOptions.pass
)}@${mongoOptions.url}/?authMechanism=DEFAULT&authSource=admin`;

fastify.register(require("fastify-mongodb"), {
  forceClose: true,
  url: connectionString,
});

// fastify.register(require("./db/mongo.js"), { uri_decode_auth: true});

fastify.register(require("fastify-multipart"), {
  addToBody: true,
  limits: {
    fieldNameSize: 1000,
    fieldSize: 1000000,
    fileSize: 10000000,
  },
});

fastify.register(require("fastify-cors"), {
  origin: true,
});

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "static"),
  prefix:
    "/oijawfweifjaiwbgiajofajwefaefawefawefawefawieofjaoweifjawefiadjfaoiwefjaieofjasfioaejfiadfjbnsdfjgrhjigfkjgfdfghjktfdxcvbnmkutrdcvbnmjkitdcvbnjydcvbnjtdszxcvbhtrdfgbjkitfdcvbnmkiyfvbn,kjgvc bnmkjgfvbhmkligtfcbnmjgfcvbhjygcxc vbnjgfdcvbnmjgfiajwefaiowefoiawejifaoefghauefhaovbaweofawioefjairgniaoedfajefijaoaioedvnaiodnvfiawenfoawiefiaowejfnodsfvnioawawefaiwefawefnjiaodfjoawefawbeivoawnefaowifnaoiwnviawoefiaowjfoiwaefjawioefiowahfawbvuaeifvaheugfaiehguahgvuabvfauiehfauwehniuadhvuaheifawireogjaiergiajerfjiaejfoiajwefoahrguiahoifjawfoiadvnioandvioajdfioajdiovajifhaorgvhoiafvjaioenviaoerjfoajwiofajoidviahivoawjfoiwaefhiaohdovfiawdjfioawhiuvohaerhvaiofhvuoahweifawiofiaevhiaoefhviaojfeioajwefjawiofhjdefianwerfoawef/", // optional: default '/'
});

fastify.register(require("./auth.js"));
fastify.register(require("./routes/user-routes.js"), { prefix: "/api" });
fastify.register(require("./routes/submission-routes.js"), { prefix: "/api" });
fastify.register(require("./routes/admin-routes.js"), { prefix: "/api" });

fastify.get("/content/:item", async (req, reply) => {
  reply.sendFile("content/" + req.params["item"]);
  await reply;
});

fastify.get("/images/:path/:item", async (req, reply) => {
  reply.sendFile(
    "content/images/" + req.params["path"] + "/" + req.params["item"]
  );
  await reply;
});

fastify.get("/content/:path/:item", async (req, reply) => {
  reply.sendFile("content/" + req.params["path"] + "/" + req.params["item"]);
  await reply;
});

fastify.get("/static/:item", async (req, reply) => {
  reply.sendFile("build/static/" + req.params["item"]);
  await reply;
});

fastify.get("/static/:path/:item", async (req, reply) => {
  reply.sendFile(
    "build/static/" + req.params["path"] + "/" + req.params["item"]
  );
  await reply;
});

fastify.get("/:file", async (req, reply) => {
  if (fs.existsSync("static/build/" + req.params["file"])) {
    reply.sendFile("build/" + req.params["file"]);
    await reply;
    return;
  }
  reply.sendFile("build/index.html");
  await reply;
});

fastify.get("*", async (req, reply) => {
  reply.sendFile("build/index.html");
  await reply;
});

const start = async () => {
  try {
    await fastify.listen(3001, "0.0.0.0");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
