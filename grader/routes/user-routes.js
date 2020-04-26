async function routes(fastify, options) {
  const bcrypt = require("bcrypt");
  const saltRounds = 8;
  const db = fastify.mongo.client.db("taugrad");
  const c = db.collection("users");

  fastify.post("/register", async (req, reply) => {
    params = req.body; // Username, Displayname, Email, Password (Needs to be hashed), Type of Account, Timestamp created
    if (!params.username || !params.email || !params.password || !params.time) {
      reply
        .code(422)
        .send(new Error("Missing one or more parameters for signup"));
      return;
    }

    if (Math.floor(Date.now() / 1000) - params.time > 5) {
      reply.code(403).send(new Error("Invalid signup"));
    }

    user = await c
      .find(
        { username: params.username },
        { collation: { locale: "en", strength: 2 } }
      )
      .toArray();
    if (user.length > 0) {
      reply.code(409).send(new Error("Username taken"));
      return;
    }

    user = await c
      .find(
        { email: params.email },
        { collation: { locale: "en", strength: 2 } }
      )
      .toArray();
    if (user.length > 0) {
      reply.code(409).send(new Error("A user with that email already exists"));
      return;
    }

    const hash = await bcrypt.hash(params.password, saltRounds);
    let id =
      parseInt((await c.findOne({ specificUse: "databaseInfo" })).userId) + 1;
    c.updateOne({ specificUse: "databaseInfo" }, { $set: { userId: id } });
    c.insertOne({
      id: id,
      username: params.username,
      firstname: params.firstname,
      lastname: params.lastname,
      email: params.email,
      pass: hash,
      timecreated: Math.floor(Date.now() / 1000),
      dataset: "",
      image: "",
      tutorial: false,
      firstlogin: -1
    });
    // const token = fastify.jwt.sign({
    //   id: id,
    //   username: params.user,
    //   email: params.email,
    //
    // });
    reply.send({ success: true });
    return;
  });

  fastify.post("/login", async (req, reply) => {
    params = req.body;
    if (!params.identifier || !params.password) {
      reply
        .code(422)
        .send(new Error("Missing one or more parameters for login"));
      return;
    }
    userBasedName = await c.findOne(
      { username: params.identifier },
      { collation: { locale: "en", strength: 2 } }
    );
    userBasedEmail = await c.findOne(
      { email: params.identifier },
      { collation: { locale: "en", strength: 2 } }
    );
    method = -1;
    if (userBasedName) {
      user = userBasedName;
      method = 0;
    } else if (userBasedEmail) {
      user = userBasedEmail;
      method = 1;
    } else {
      user = null;
    }
    if (!user) {
      reply.code(404).send(new Error("User not found"));
      return;
    }
    const verify = await bcrypt.compare(params.password, user.pass);
    if (!verify) {
      reply.code(401).send(new Error("Invalid Crededentials"));
      return;
    }

    let firstlogin = user.firstlogin;
    if (!firstlogin || firstlogin <= 0) {
      firstlogin = Math.floor(Date.now() / 1000);
      await c.updateOne({ id: user.id }, { $set: { firstlogin: firstlogin } });
    }
    let lasttime = user.lastlogin;
    lasttime = Math.floor(Date.now() / 1000);
    await c.updateOne({ id: user.id }, { $set: { lastlogin: lasttime } });
    const token = fastify.jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      firstlogin: user.firstlogin
    });
    reply.send({ token: token, username: user.username });
    return;
  });
  fastify.post(
    "/check",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      params = req.body;
      if (!params.password) {
        reply.code(422).send(new Error("Missing parameter"));
        return;
      }
      user = await c.findOne({ id: req.user.id });

      if (!user) {
        reply.code(404).send(new Error("User not found"));
        return;
      }

      const verify = await bcrypt.compare(params.password, user.pass);
      reply.send({ valid: verify });
      return;
    }
  );

  fastify.get(
    "/logout",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      params = req.query;
      user = await c.findOne({ id: req.user.id });
      console.log(params["logoutall"]);
      if (params["logoutall"] === "true") {
        await c.updateOne({ id: req.user.id }, { $set: { firstlogin: -1 } });
      }
      reply.code(200).send({ success: true });
    }
  );

  fastify.get(
    "/user",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      var data = await c.findOne({ id: req.user.id });
      reply.send({
        user: req.user,
        dataset: data.dataset,
        image: data.currentImage,
        profile: data.profile
      });
      return;
    }
  );
}

module.exports = routes;
