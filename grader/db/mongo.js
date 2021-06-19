const fastifyPlugin = require("fastify-plugin");
const mongo = require("mongodb").MongoClient;

async function mongoConnector(fastify, options, done) {
    const mongoOptions = require("./mongo.json");
    const connectionString = `mongodb://${mongoOptions.user}:${encodeURIComponent(
        mongoOptions.pass
    )}@${mongoOptions.url}/?authMechanism=DEFAULT&authSource=admin`;

    mongo.connect(connectionString, options, () => {
        console.log("Connected!")
    })
    done();
    fastify.decorate("mongo", db);
}

module.exports = fastifyPlugin(mongoConnector);
