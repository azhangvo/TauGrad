const fastifyPlugin = require("fastify-plugin");
const mongo = require("mongodb").MongoClient;
const assert = require("assert");

async function mongoConnector(fastify, options, done) {
  var mongoOptions = require("./mongo.json");
  var connectionString = `mongodb://${mongoOptions.user}:${encodeURIComponent(
    mongoOptions.pass
  )}@${mongoOptions.url}/?authMechanism=DEFAULT&authSource=admin`;
  // console.log(connectionString);
  // const db = new mongo(connectionString);
  // await db.connect();
  // db.connect(function(err) {
  //   assert.equal(null, err);
  //   console.log("Connected correctly to server");
  //
  //   client.close();
  // });
  // var db = await mongo.connect(connectionString, options)
  console.log(options);
  mongo.connect(connectionString, options, () => {
    console.log("Connected!")
  })
  done();
  fastify.decorate("mongo", db);
}

module.exports = fastifyPlugin(mongoConnector);
