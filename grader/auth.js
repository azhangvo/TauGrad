const fp = require("fastify-plugin");
const token = require("./token.json")["token"];

module.exports = fp(async function (fastify, opts) {
    const db = fastify.mongo.client.db("taugrad");
    const c = db.collection("users");
    fastify.register(require("fastify-jwt"), {
        secret: token
    });

    fastify.decorate("authenticate", async function (request, reply) {
        try {
            await request.jwtVerify();
            let u = request.user;
            if (!u.id) {
                reply.code(404).send(new Error("Login is invalid"));
                return;
            }
            let cu = await c.findOne({id: u.id});
            if (cu.lastlogin <= 0) {
                reply.code(404).send(new Error("Login is invalid"));
                return;
            }
            if (!(u.username === cu.username) || !(u.email === cu.email) || !(u.firstlogin === cu.firstlogin)) {
                reply.code(404).send(new Error("Login is invalid"));
                return;
            }
            // Add check with database to ensure no fakes
        } catch (err) {
            reply.send(err);
        }
    });
});
