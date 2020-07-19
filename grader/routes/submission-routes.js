const { readdirSync, readFileSync, writeFile } = require("fs");
const pump = require("pump");
const fs = require("fs");
const path = require("path");
const { exec, execFile } = require("child_process");
const nodemailer = require("nodemailer");
var jsdiff = require("diff");

const arrUtils = require("../utils/arrays.js");
const emailInfo = require("../email.json");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: emailInfo.from, pass: emailInfo.password },
});

var regulations = JSON.parse(fs.readFileSync("./regulation.json"));
var problems = regulations.problems;

var languages = [
  "python27",
  "python36",
  "python37",
  "python38",
  "java8",
  "java11",
  "c++11",
  "c++14",
];

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
  problems.forEach((problem) => {
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
  problems.forEach((problem) => {
    if (fs.existsSync("./data/" + problem + "/info.json")) {
      problemInfo[problem] = JSON.parse(
        fs.readFileSync("./data/" + problem + "/info.json")
      );
    } else {
      problemInfo[problem] = {};
      fs.mkdirSync("./data/" + problem, { recursive: true });
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function compile(files, problem, status) {
  await Promise.all(
    Object.keys(files).map(async (index) => {
      let filename = files[index];
      status[index][0] = 0;

      var id = filename.substr(0, filename.lastIndexOf("."));
      var compileCommand = "";
      var filePath = "./data/" + problem;
      var testPath = filePath + "/" + id;
      var truncFile = filename.substr(0, filename.lastIndexOf("."));
      if (!fs.existsSync(testPath + "/")) fs.mkdirSync(testPath + "/");

      if (
        problemInfo[problem][id].language.startsWith("c++") ||
        problemInfo[problem][id].language.startsWith("java")
      ) {
        if (problemInfo[problem][id].language == "c++11")
          compileCommand =
            "g++ -std=c++11 -o " + id + "/" + truncFile + " " + filename;
        if (problemInfo[problem][id].language == "c++14")
          compileCommand =
            "g++ -std=c++14 -o " + id + "/" + truncFile + " " + filename;
        if (problemInfo[problem][id].language == "c++17")
          compileCommand =
            "g++ -std=c++17 -o " + id + "/" + truncFile + " " + filename;
        if (problemInfo[problem][id].language == "java8")
          compileCommand =
            "update-alternatives --set javac /usr/lib/jvm/java-8-openjdk-amd64/bin/javac && javac -d " +
            id +
            " " +
            filename;
        if (problemInfo[problem][id].language == "java11")
          compileCommand =
            "update-alternatives --set javac /usr/lib/jvm/java-11-oracle/bin/javac && javac -d " +
            id +
            " " +
            filename;
        await new Promise((resolve, reject) => {
          let files = fs.readdirSync(testPath);
          for (const file of files) {
            fs.unlinkSync(path.join(testPath, file));
          }
          // if (fs.existsSync(testPath + "/" + truncFile))
          //   fs.unlinkSync(testPath + "/" + truncFile);
          // if (fs.existsSync(testPath + "/" + truncFile + ".exe"))
          //   fs.unlinkSync(testPath + "/" + truncFile + ".exe");
          // exec("rm " + testPath + "/" + truncFile, (err, sout, serr) => {
          //   exec(
          //     "rm " + testPath + "/" + truncFile + ".exe",
          //     (err, sout, serr) => {
          exec(
            compileCommand,
            { timeout: 8000, cwd: filePath },
            (error, stdout, stderr) => {
              if (error) {
                status[index][0] = 4;
              } else {
                status[index][0] = 1;
              }
              resolve();
            }
          );
          //     }
          //   );
          // });
        });
      } else {
        let files = fs.readdirSync(testPath);
        for (const file of files) {
          fs.unlinkSync(path.join(testPath, file));
        }
        await sleep(500);
        // await new Promise((resolve, reject) => {
        //   exec(
        //     "cp ./data/" +
        //       problem +
        //       "/" +
        //       filename +
        //       " " +
        //       testPath +
        //       "/" +
        //       filename,
        //     (error, stdout, stderr) => {
        //       resolve();
        //     }
        //   );
        // });
        fs.copyFileSync(
          "./data/" + problem + "/" + filename,
          testPath + "/" + filename
        );
      }
    })
  );
}

async function run(files, status, problem, total, results, i) {
  var startTime = new Array(files.length);
  await Promise.all(
    Object.keys(files).map(async (index) => {
      let filename = files[index];
      var id = filename.substr(0, filename.lastIndexOf("."));
      var command = "";
      var filePath = "./data/" + problem;
      var testPath = filePath + "/" + id;
      var truncFile = filename.substr(0, filename.lastIndexOf("."));

      if (status[index][0] === 4) {
        for (let j = 0; j < 10; j++) {
          results[index][j] = false;
          status[index][j + 1] = 5;
        }
        return;
      }

      fs.copyFileSync(
        "./data/" + problem + "/" + problem + ".in",
        testPath + "/" + problem + ".in"
      );

      status[index][i] = 1;

      await new Promise((resolve, reject) => {
        if (
          problemInfo[problem][id].language.startsWith("c++") ||
          problemInfo[problem][id].language.startsWith("java")
        ) {
          if (problemInfo[problem][id].language.startsWith("c++"))
            command = "./" + truncFile;
          if (problemInfo[problem][id].language.startsWith("java")) {
            let className = null;

            let files = fs.readdirSync(testPath);
            for (const file of files) {
              if (file.endsWith(".class") && !file.includes("$")) {
                className = file.substring(0, file.length - 6);
                break;
              }
            }
            if (!className) {
              status[index][i] = 5;
              resolve();
              return;
            }

            if (problemInfo[problem][id].language == "java8")
              command =
                "update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java && java " +
                className;
            if (problemInfo[problem][id].language == "java11")
              command =
                "update-alternatives --set java /usr/lib/jvm/java-11-oracle/bin/java && java " +
                className;
          }

          if (fs.existsSync(testPath + "/" + problem + ".out"))
            fs.unlinkSync(testPath + "/" + problem + ".out");
          startTime[index] = Date.now();
          if (problemInfo[problem][id].language.startsWith("java")) {
            exec(
              command,
              { timeout: 7000, cwd: testPath },
              (error, stdout, stderr) => {
                if (error) {
                  if (Date.now() - startTime[index] <= 5000) {
                    status[index][i] = 5;
                  } else {
                    status[index][i] = 3;
                  }
                  resolve();
                  return;
                }
                if (Date.now() - startTime[index] <= 5000) {
                  status[index][i] = 2;
                  if (fs.existsSync(testPath + "/" + problem + ".out")) {
                    let answer = fs.readFileSync(
                      "./tests/" + problem + "/test" + i + ".out",
                      "utf8"
                    );
                    let output = fs.readFileSync(
                      testPath + "/" + problem + ".out",
                      "utf8"
                    );
                    answer = answer.replace(/^\s+|\s+$/g, "");
                    output = output.replace(/^\s+|\s+$/g, "");
                    diff = jsdiff.diffLines(answer, output);
                    if (diff.length <= 1) {
                      total[index]++;
                      results[index][i - 1] = true;
                    } else {
                      results[index][i - 1] = false;
                    }
                  }
                } else {
                  status[index][i] = 3;
                }
                resolve();
              }
            );
          } else {
            execFile(
              command,
              { timeout: 7000, cwd: testPath + "/" },
              (error, stdout, stderr) => {
                if (error) {
                  if (Date.now() - startTime[index] <= 5000) {
                    status[index][i] = 5;
                  } else {
                    status[index][i] = 3;
                  }
                  resolve();
                  return;
                }
                if (Date.now() - startTime[index] <= 5000) {
                  status[index][i] = 2;
                  if (fs.existsSync(testPath + "/" + problem + ".out")) {
                    let answer = fs.readFileSync(
                      "./tests/" + problem + "/test" + i + ".out",
                      "utf8"
                    );
                    let output = fs.readFileSync(
                      testPath + "/" + problem + ".out",
                      "utf8"
                    );
                    answer = answer.replace(/^\s+|\s+$/g, "");
                    output = output.replace(/^\s+|\s+$/g, "");
                    diff = jsdiff.diffLines(answer, output);
                    if (diff.length <= 1) {
                      total[index]++;
                      results[index][i - 1] = true;
                    } else {
                      results[index][i - 1] = false;
                    }
                  }
                } else {
                  status[index][i] = 3;
                }
                resolve();
              }
            );
          }
        } else {
          if (problemInfo[problem][id].language == "python27")
            command = "python2.7 " + filename;
          if (problemInfo[problem][id].language == "python36")
            command = "python3.6 " + filename;
          if (problemInfo[problem][id].language == "python37")
            command = "python3.7 " + filename;
          if (problemInfo[problem][id].language == "python38")
            command = "python3.8 " + filename;
          startTime[index] = Date.now();

          exec(
            command,
            { timeout: 7000, cwd: testPath },
            (error, stdout, stderr) => {
              if (error) {
                if (Date.now() - startTime[index] <= 5000) {
                  status[index][i] = 5;
                } else {
                  status[index][i] = 3;
                }
                resolve();
                return;
              }
              if (Date.now() - startTime[index] <= 5000) {
                status[index][i] = 2;
                if (fs.existsSync(testPath + "/" + problem + ".out")) {
                  let answer = fs.readFileSync(
                    "./tests/" + problem + "/test" + i + ".out",
                    "utf8"
                  );
                  let output = fs.readFileSync(
                    testPath + "/" + problem + ".out",
                    "utf8"
                  );
                  answer = answer.replace(/^\s+|\s+$/g, "");
                  output = output.replace(/^\s+|\s+$/g, "");
                  diff = jsdiff.diffLines(answer, output);
                  if (diff.length <= 1) {
                    total[index]++;
                    results[index][i - 1] = true;
                  } else {
                    results[index][i - 1] = false;
                  }
                }
              } else {
                status[index][i] = 3;
              }
              resolve();
            }
          );
        }
      });
    })
  );
}

var dangerContent = [
  "socket",
  "web",
  "requests",
  "wget",
  "curl",
  "http",
  "rm ",
  "cd",
  "exec",
];

async function routes(fastify, options) {
  const db = fastify.mongo.client.db("taugrad");
  const cUsers = db.collection("users");
  const cTeams = db.collection("teams");

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

      if (Date.now() < 1595160000000) {
        reply.code(400).send(new Error("Competition has not started yet"));
        return;
      }

      let cu = await cUsers.findOne({ id: req.user.id });
      if (!cu.team) {
        reply.code(400).send(new Error("You are not in a team!"));
        return;
      }

      let teamData = await cTeams.findOne({ id: cu.team });
      if (!teamData.start) {
        reply.code(400).send(new Error("Time has not started yet"));
        return;
      }

      if (Date.now() - teamData.start >= 10800000) {
        reply.code(400).send(new Error("Your time is up!"));
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

      await cUsers.updateOne(
        { id: req.user.id },
        { $set: { lastSubmission: Date.now() } }
      );

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
      let data = s.data.toString();
      if (type.startsWith("java"))
        data = data.replace(/public[ ]+class/, "class");
      stream.write(data);
      stream.end();

      let detectedWords = [];
      dangerContent.forEach((word) => {
        if (data.includes(word)) {
          detectedWords.push(word);
        }
      });
      if (detectedWords) {
        console.log(
          "[DETECTED] The user " +
            req.user.id +
            " has been detected using the following while submitting to " +
            req.body.problem +
            ": " +
            detectedWords.join(", ")
        );
        transporter.sendMail({
          from: emailInfo.from,
          to: emailInfo.to,
          subject: req.user.id + " using possibly dangerous code",
          text:
            "The user " +
            req.user.id +
            " has been detected using the following while submitting to " +
            req.body.problem +
            ": " +
            detectedWords.join(", "),
        });
        transporter.sendMail({
          from: emailInfo.from,
          to: emailInfo.to,
          subject: req.user.id + " code",
          text: data,
        });
      }

      let files = [req.user.id + ending];

      accEndings = [".cpp", ".py", ".java"];

      files = files.filter(function (e) {
        return accEndings.includes(path.extname(e).toLowerCase());
      });

      var status = new Array(files.length);
      var total = new Array(files.length);
      total.fill(0);
      var results = new Array(files.length);

      for (let i = 0; i < files.length; i++) {
        results[i] = new Array(10);
        status[i] = new Array(11);
      }

      await compile(files, req.body.problem, status);

      // if (status[0][0] === 4) {
      //   for (let i = 0; i < files.length; i++) {
      //     for (let j = 0; j < 10; j++) {
      //       results[i][j] = false;
      //       status[i][j + 1] = 5;
      //     }
      //   }
      // } else {
      for (let i = 1; i <= 10; i++) {
        if (!fs.existsSync("./tests/" + req.body.problem + "/test" + i + ".in"))
          continue;
        fs.copyFileSync(
          "./tests/" + req.body.problem + "/test" + i + ".in",
          "./data/" + req.body.problem + "/" + req.body.problem + ".in"
        );
        await sleep(100);
        await run(files, status, req.body.problem, total, results, i);
      }
      // }

      reply.header("Content-Type", "application/json").send({
        success: true,
        status: status[0],
        total: total[0],
        results: results[0],
      });

      return;
    }
  );

  fastify.get(
    "/problems",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      let cu = await cUsers.findOne({ id: req.user.id });
      if (!cu.team) {
        reply.code(400).send(new Error("You are not in a team!"));
        return;
      }

      let teamData = await cTeams.findOne({ id: cu.team });
      if (!teamData.start) {
        reply.code(400).send(new Error("Time has not started yet"));
        return;
      }

      if (Date.now() - teamData.start >= 10800000) {
        reply.code(400).send(new Error("Your time is up!"));
        return;
      }

      reply.send({
        problems: problems.slice(
          regulations.problemAccess[0] - 1,
          regulations.problemAccess[1]
        ),
      });
    }
  );

  fastify.get(
    "/writtenProblems",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      var data = await cUsers.findOne({ id: req.user.id });

      if (!data.team) {
        reply.code(400).send(new Error("You are not in a team, join one"));
      }

      var teamData = await cTeams.findOne({ id: data.team });
      if (!teamData.start) {
        reply
          .code(400)
          .send(
            new Error(
              "Time has not started yet, make sure to click the big button"
            )
          );
        return;
      }

      if (Date.now() - teamData.start >= 10800000) {
        reply.code(400).send(new Error("Your time is up!"));
        return;
      }

      reply.sendFile("pages/problems.html");
    }
  );
}

module.exports = routes;
