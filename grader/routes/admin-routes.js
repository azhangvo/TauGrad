const { readdirSync, readFileSync, writeFile } = require("fs");
const path = require("path");
const { exec, execFile } = require("child_process");
const pump = require("pump");
const fs = require("fs");

const arrUtils = require("../utils/arrays.js");

var regulations = JSON.parse(fs.readFileSync("./regulation.json"));
var problems = regulations.problems;

var problemInfo = {};

saveProblemInfo = problem => {
  if (problem) {
    if (problems.includes(problem) && problemInfo[problem]) {
      fs.writeFileSync(
        "./data/" + problem + "/info.json",
        JSON.stringify(problemInfo[problem], null, 2)
      );
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
};

loadProblemInfo = problem => {
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
};

loadProblemInfo();
problems = regulations.problems;

setInterval(() => {
  regulations = JSON.parse(fs.readFileSync("./regulation.json"));
  if (!arrUtils.arraysEqual(problems, regulations.problems)) {
    // saveProblemInfo();
    problems = regulations.problems;
    loadProblemInfo();
  }
}, 5000);

setInterval(() => {
  regulations = JSON.parse(fs.readFileSync("./regulation.json"));
}, 5000);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function compile(files, problem, status) {
  files.forEach(async (filename, index) => {
    status[index] = 1;


    var id = filename.substr(0, filename.lastIndexOf("."));
    var compileCommand = "";
    var filePath = "./data/" + req.body.problem
    var testPath = filePath + "/" + id;
    var truncFile = filename.substr(0, filename.lastIndexOf("."));

    fs.mkdir(testPath)

    if (
      problemInfo[req.body.problem][id].language.startsWith("c++") ||
      problemInfo[req.body.problem][id].language.startsWith("java")
    ) {
      if (problemInfo[req.body.problem][id].language == "c++11")
        compileCommand = "g++ -std=c++11 -o " + testPath + "/" + truncFile + " " + filename;
      if (problemInfo[req.body.problem][id].language == "c++14")
        compileCommand = "g++ -std=c++14 -o " + testPath + "/" + truncFile + " " + filename;
      if (problemInfo[req.body.problem][id].language == "c++17")
        compileCommand = "g++ -std=c++17 -o " + testPath + "/" + truncFile + " " + filename;
      if (problemInfo[req.body.problem][id].language == "java8")
        compileCommand =
          "update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java && javac " +
          filename;
      if (problemInfo[req.body.problem][id].language == "java11")
        compileCommand =
          "update-alternatives --set java /usr/lib/jvm/java-11-oracle/bin/java && javac " +
          filename;
      exec("rm " + testPath + "/" + truncFile, async (err, sout, serr) => {
        exec(
          compileCommand,
          { timeout: 6000, cwd: filePath },
          async (error, stdout, stderr) => {
            if (err) {
              status[index] = 4;
              return;
            }
          }
        );
      });
    }
  });
}

function run(files, status, problem, total, results, i) {
  files.forEach(async (filename, index) => {
    status[index] = 1;

    var id = filename.substr(0, filename.lastIndexOf("."));
    var compileCommand = "";
    var command = "";
    var filePath = "./data/" + req.body.problem;
    var truncFile = filename.substr(0, filename.lastIndexOf("."));

    if (
      problemInfo[req.body.problem][id].language.startsWith("c++") ||
      problemInfo[req.body.problem][id].language.startsWith("java")
    ) {
      if (problemInfo[req.body.problem][id].language.startsWith("c++"))
        command = "./" + truncFile;
      if (problemInfo[req.body.problem][id].language.startsWith("java")) {
        if (problemInfo[req.body.problem][id].language == "java8")
          command =
            "update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java && java " +
            filename;
        if (problemInfo[req.body.problem][id].language == "java11")
          command =
            "update-alternatives --set java /usr/lib/jvm/java-11-oracle/bin/java && java " +
            filename;
      }

      startTime[index] = Date.now();
      if (command.startsWith("java")) {
        exec(
          command,
          { timeout: 8000, cwd: filePath },
          (error, stdout, stderr) => {
            if (error) {
              if (Date.now() - startTime[index] <= 5000) {
                status[index] = 5;
              } else {
                status[index] = 3;
              }
              return;
            }
            if (Date.now() - startTime[index] <= 5000) {
              status[index] = 2;
            } else {
              status[index] = 3;
            }
          }
        );
      } else {
        execFile(
          command,
          { timeout: 8000, cwd: filePath },
          (error, stdout, stderr) => {
            if (error) {
              if (Date.now() - startTime[index] <= 5000) {
                status[index] = 5;
              } else {
                status[index] = 3;
              }
              return;
            }
            if (Date.now() - startTime[index] <= 5000) {
              status[index] = 2;
            } else {
              status[index] = 3;
            }
          }
        );
      }
    } else {
      if (problemInfo[req.body.problem][id].language == "python27")
        command = "python2.7 " + filePath;
      if (problemInfo[req.body.problem][id].language == "python36")
        command = "python3.6 " + filePath;
      if (problemInfo[req.body.problem][id].language == "python37")
        command = "python3.7 " + filePath;
      if (problemInfo[req.body.problem][id].language == "python38")
        command = "python3.8 " + filePath;
      exec(
        command,
        { timeout: 8000, cwd: filePath },
        (error, stdout, stderr) => {
          if (error) {
            if (Date.now() - startTime[index] <= 5000) {
              status[index] = 5;
            } else {
              status[index] = 3;
            }
            return;
          }
          if (Date.now() - startTime[index] <= 5000) {
            status[index] = 2;
          } else {
            status[index] = 3;
          }
        }
      );
    }
  });
}

async function routes(fastify, options) {
  const db = fastify.mongo.client.db("globalmind");
  const cUser = db.collection("users");

  fastify.post(
    "/grade",
    { preValidation: [fastify.authenticate] },
    async (req, reply) => {
      if (req.user.id !== 1) {
        reply.code(401);
      }
      if (!req.body || !req.body.problem) {
        reply.code(422).send(new Error("Missing parameters"));
        return;
      }

      let files = readdirSync("./data/" + req.body.problem);
      files.splice(files.indexOf("info.json"), 1);

      accEndings = [".cpp", ".c++", ".py", ".java"];

      files = files.filter(function(e) {
        return accEndings.includes(path.extname(e).toLowerCase());
      });

      var status = new Array(files.length);
      var total = new Array(files.length);
      var results = new Array(files.length);

      for (let i = 0; i < files.length; i++) {
        results[i] = new Array(5);
      }

      compile(files, status);
      for (let i = 1; i <= 5; i++) {
        fs.copyFileSync(
          "./tests/" + req.body.problem + "/test" + i + ".in",
          "./data/" + req.body.problem + "/" + req.body.problem + ".in"
        );
        await sleep(100);
        run(files, status, total, results, i);
      }

      files.forEach(async (filename, index) => {
        status[index] = 1;

        var id = filename.substr(0, filename.lastIndexOf("."));
        var compileCommand = "";
        var command = "";
        var filePath = "./data/" + req.body.problem;
        var truncFile = filename.substr(0, filename.lastIndexOf("."));

        if (
          problemInfo[req.body.problem][id].language.startsWith("c++") ||
          problemInfo[req.body.problem][id].language.startsWith("java")
        ) {
          if (problemInfo[req.body.problem][id].language.startsWith("c++"))
            command = "./" + truncFile;
          if (problemInfo[req.body.problem][id].language.startsWith("java"))
            command = "java " + truncFile;
          if (problemInfo[req.body.problem][id].language == "c++11")
            compileCommand = "g++ -std=c++11 -o " + truncFile + " " + filename;
          if (problemInfo[req.body.problem][id].language == "c++14")
            compileCommand = "g++ -std=c++14 -o " + truncFile + " " + filename;
          if (problemInfo[req.body.problem][id].language == "c++17")
            compileCommand = "g++ -std=c++17 -o " + truncFile + " " + filename;
          if (problemInfo[req.body.problem][id].language == "java8")
            compileCommand =
              "update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java && javac " +
              filename;
          if (problemInfo[req.body.problem][id].language == "java11")
            compileCommand =
              "update-alternatives --set java /usr/lib/jvm/java-11-oracle/bin/java && javac " +
              filename;
          exec("rm " + filePath + "/" + truncFile, async (err, sout, serr) => {
            exec(
              compileCommand,
              { timeout: 6000, cwd: filePath },
              async (error, stdout, stderr) => {
                if (err) {
                  status[index] = 4;
                  return;
                }

                await sleep(500);

                startTime[index] = Date.now();
                if (command.startsWith("java")) {
                  exec(
                    command,
                    { timeout: 8000, cwd: filePath },
                    (error, stdout, stderr) => {
                      if (error) {
                        if (Date.now() - startTime[index] <= 5000) {
                          status[index] = 5;
                        } else {
                          status[index] = 3;
                        }
                        return;
                      }
                      if (Date.now() - startTime[index] <= 5000) {
                        status[index] = 2;
                      } else {
                        status[index] = 3;
                      }
                    }
                  );
                } else {
                  execFile(
                    command,
                    { timeout: 8000, cwd: filePath },
                    (error, stdout, stderr) => {
                      if (error) {
                        if (Date.now() - startTime[index] <= 5000) {
                          status[index] = 5;
                        } else {
                          status[index] = 3;
                        }
                        return;
                      }
                      if (Date.now() - startTime[index] <= 5000) {
                        status[index] = 2;
                      } else {
                        status[index] = 3;
                      }
                    }
                  );
                }
              }
            );
          });
        } else {
          if (problemInfo[req.body.problem][id].language == "python27")
            command = "python2.7 " + filePath;
          if (problemInfo[req.body.problem][id].language == "python36")
            command = "python3.6 " + filePath;
          if (problemInfo[req.body.problem][id].language == "python37")
            command = "python3.7 " + filePath;
          if (problemInfo[req.body.problem][id].language == "python38")
            command = "python3.8 " + filePath;
          exec(
            command,
            { timeout: 8000, cwd: filePath },
            (error, stdout, stderr) => {
              if (error) {
                if (Date.now() - startTime[index] <= 5000) {
                  status[index] = 5;
                } else {
                  status[index] = 3;
                }
                return;
              }
              if (Date.now() - startTime[index] <= 5000) {
                status[index] = 2;
              } else {
                status[index] = 3;
              }
            }
          );
        }
      });

      await sleep(20000);

      for (let i = 0; i < files.length; i++) {
        console.log(files[i] + " " + status[i]);
      }

      reply.header("Content-Type", "application/json").send({
        success: true
      });
      return;
    }
  );
}

module.exports = routes;
