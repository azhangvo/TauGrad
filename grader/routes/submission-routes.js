const { readdirSync, readFileSync, writeFile } = require("fs");
const pump = require("pump");
const fs = require("fs");

const arrUtils = require("../utils/arrays.js");

var regulations = JSON.parse(fs.readFileSync("./regulation.json"));
var problems = regulations.problems;

var problemInfo = {};

function saveProblemInfo(problem) {
  if (problem) {
    if (problems.includes(problem) && problemInfo[problem]) {
      fs.writeFileSync(
        "./data/" + problem + "/info.json",
        JSON.stringify(problemInfo[problem], null, 2)
      );
      return;
    } else {
      return false;
    }
  }
  problems.forEach(problem => {
    fs.writeFileSync(
      "./data/" + problem + "/info.json",
      JSON.stringify(problemInfo[problem], null, 2)
    );
  });
  return true;
}

function loadProblemInfo(problem) {
  if (problem) {
    if (fs.existsSync("./data/" + problem + "/info.json")) {
      problemInfo[problem] = JSON.parse(
        fs.readFileSync("./data/" + problem + "/info.json")
      );
    } else {
      return false;
    }
  }
  problems.forEach(problem => {
    if (fs.existsSync("./data/" + problem + "/info.json")) {
      problemInfo[problem] = JSON.parse(
        fs.readFileSync("./data/" + problem + "/info.json")
      );
    } else {
      problemInfo[problem] = {};
      fs.mkdir("./data/" + problem, { recursive: true });
      fs.writeFileSync(
        "./data/" + problem + "/info.json",
        JSON.stringify(problemInfo[problem], null, 2)
      );
    }
  });
  return true;
}

loadProblemInfo();
problems = regulations.problems;

setInterval(() => {
  regulations = JSON.parse(fs.readFileSync("./regulation.json"));
  if (!arrUtils.arraysEqual(problems, regulations.problems)) {
    saveProblemInfo();
    problems = regulations.problems;
    loadProblemInfo();
  }
}, 5000);

async function routes(fastify, options) {
  const db = fastify.mongo.client.db("taugrad");
  const cUser = db.collection("users");

  fastify.post(
    "/submit",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      let info = await db
        .collection("regulation")
        .findOne({ use: "restriction" });

      if (!info.enabled) {
        reply.code(403).send(new Error("Submission is disabled at the moment"));
        return;
      }

      if (
        !req.body ||
        !req.body.submission ||
        !req.body.language ||
        !req.body.problem
      ) {
        reply.code(422).send(new Error("Missing parameters"));
        return;
      }
      if (req.body.submission.length !== 1) {
        reply.code(409).send(new Error("Too many files"));
        return;
      }
      if (!regulations.problems.includes(req.body.problem)) {
        reply.code(409).send(new Error("Problem not found"));
        return;
      }
      if (
        regulations.problems.indexOf(req.body.problem) <
        regulations.problemAccess[0] - 1
      ) {
        reply.code(409).send(new Error("Problem is no longer accessible."));
        return;
      }
      if (
        regulations.problems.indexOf(req.body.problem) >
        regulations.problemAccess[1] - 1
      ) {
        reply
          .code(409)
          .send(
            new Error(
              "Problem is not accessible yet. Wait... how did you know the name??"
            )
          );
        return;
      }

      let s = req.body.submission[0];
      let ending = s.filename.substring(s.filename.lastIndexOf("."));
      let type = req.body.language;
      if (
        !(
          type.startsWith("python") ||
          type.startsWith("java") ||
          type.startsWith("c++")
        )
      ) {
        reply.code(409).send(new Error("That language is not supported"));
      }
      if (
        !(
          (type.startsWith("python") && ending === ".py") ||
          (type.startsWith("java") && ending === ".java") ||
          (type.startsWith("c++") && ending === ".cpp")
        )
      ) {
        reply
          .code(409)
          .send(new Error("File ending and submission language do not match"));
      }

      if (!languages.includes(type)) {
        reply.code(409).send(new Error("Language not found or supported"));
      }

      let cu = await cUser.findOne({ id: req.user.id });

      if (problemInfo[req.body.problem][req.user.id]) {
        fs.unlink(
          "./data/" +
            req.body.problem +
            "/" +
            problemInfo[req.body.problem][req.user.id]["filename"],
          () => {}
        );
      } else {
        problemInfo[req.body.problem][req.user.id] = {};
      }
      problemInfo[req.body.problem][req.user.id]["filename"] =
        req.user.id + ending;
      problemInfo[req.body.problem][req.user.id]["language"] =
        req.body.language;
      console.log(problemInfo[req.body.problem][req.user.id]);
      saveProblemInfo(req.body.problem);

      fs.promises.mkdir("./data/" + req.body.problem, { recursive: true });
      let stream = fs.createWriteStream(
        "./data/" + req.body.problem + "/" + req.user.id + ending
      );
      stream.write(s.data.toString());
      stream.end();

      reply.header("Content-Type", "application/json").send({
        success: true
      });
      return;
    }
  );

  fastify.get("/problems", async (req, reply) => {
    reply.send({
      problems: problems.slice(
        regulations.problemAccess[0] - 1,
        regulations.problemAccess[1]
      )
    });
  });
}

module.exports = routes;
