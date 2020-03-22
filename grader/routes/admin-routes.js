const { readdirSync, readFileSync, writeFile } = require("fs");
const path = require("path");
const { exec, execFile } = require("child_process");
const pump = require("pump");
const fs = require("fs");
var jsdiff = require('diff');

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

async function compile(files, problem, status) {
  await Promise.all(
    Object.keys(files).map(async index => {
      let filename = files[index];
      status[index] = 1;

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
            "update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java && javac -d " +
            id +
            " " +
            filename;
        if (problemInfo[problem][id].language == "java11")
          compileCommand =
            "update-alternatives --set java /usr/lib/jvm/java-11-oracle/bin/java && javac -d " +
            id +
            " " +
            filename;
        await new Promise((resolve, reject) => {
          exec("rm " + testPath + "/" + truncFile, (err, sout, serr) => {
            exec(
              compileCommand,
              { timeout: 4000, cwd: filePath },
              (error, stdout, stderr) => {
                if (err) {
                  status[index] = 4;
                }
                resolve();
              }
            );
          });
        });
      } else {
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
    Object.keys(files).map(async index => {
      let filename = files[index];
      var id = filename.substr(0, filename.lastIndexOf("."));
      var command = "";
      var filePath = "./data/" + problem;
      var testPath = filePath + "/" + id;
      var truncFile = filename.substr(0, filename.lastIndexOf("."));

      fs.copyFileSync(
        "./data/" + problem + "/" + problem + ".in",
        testPath + "/" + problem + ".in"
      );

      status[index] = 1;

      await new Promise((resolve, reject) => {
        if (
          problemInfo[problem][id].language.startsWith("c++") ||
          problemInfo[problem][id].language.startsWith("java")
        ) {
          if (problemInfo[problem][id].language.startsWith("c++"))
            command = "./" + truncFile;
          if (problemInfo[problem][id].language.startsWith("java")) {
            if (problemInfo[problem][id].language == "java8")
              command =
                "update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java && java " +
                filename;
            if (problemInfo[problem][id].language == "java11")
              command =
                "update-alternatives --set java /usr/lib/jvm/java-11-oracle/bin/java && java " +
                filename;
          }

          if (fs.existsSync(testPath + "/" + problem + ".out"))
            fs.unlinkSync(testPath + "/" + problem + ".out");
          startTime[index] = Date.now();
          if (command.startsWith("java")) {
            exec(
              command,
              { timeout: 7000, cwd: testPath },
              (error, stdout, stderr) => {
                if (error) {
                  if (Date.now() - startTime[index] <= 5000) {
                    status[index] = 5;
                  } else {
                    status[index] = 3;
                  }
                  resolve();
                  return;
                }
                if (Date.now() - startTime[index] <= 5000) {
                  status[index] = 2;
                } else {
                  status[index] = 3;
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
                  console.log(error);
                  if (Date.now() - startTime[index] <= 5000) {
                    status[index] = 5;
                  } else {
                    status[index] = 3;
                  }
                  resolve();
                  return;
                }
                if (Date.now() - startTime[index] <= 5000) {
                  status[index] = 2;
                  if (fs.existsSync(testPath + "/" + problem + ".out")) {
                    let answer = fs.readFileSync(
                      "./tests/" + problem + "/" + problem + ".out", "utf8"
                    );
                    let output = fs.readFileSync(
                      testPath + "/" + problem + ".out", "utf8"
                    );
                    output = output.replace(/^\s+|\s+$/g, '');
                    diff = jsdiff.diffLines(answer, output);
                    if(diff.length <= 1) {
                      total[index]++;
                      results[index][i] = true;
                    }
                  }
                } else {
                  status[index] = 3;
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
          exec(
            command,
            { timeout: 7000, cwd: testPath },
            (error, stdout, stderr) => {
              if (error) {
                if (Date.now() - startTime[index] <= 5000) {
                  status[index] = 5;
                  if (fs.existsSync(testPath + "/" + problem + ".out")) {
                    let answer = fs.readFileSync(
                      "./tests/" + problem + "/" + problem + ".out"
                    );
                    let output = fs.readFileSync(
                      testPath + "/" + problem + ".out"
                    );
                  }
                } else {
                  status[index] = 3;
                }
                resolve();
                return;
              }
              if (Date.now() - startTime[index] <= 5000) {
                status[index] = 2;
              } else {
                status[index] = 3;
              }
              resolve();
            }
          );
        }
      });
    })
  );
}

async function routes(fastify, options) {
  // const db = fastify.mongo.client.db("globalmind");
  // const cUser = db.collection("users");

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

      accEndings = [".cpp", ".py", ".java"];

      files = files.filter(function(e) {
        return accEndings.includes(path.extname(e).toLowerCase());
      });

      var status = new Array(files.length);
      var total = new Array(files.length);
      total.fill(0);
      var results = new Array(files.length);

      for (let i = 0; i < files.length; i++) {
        results[i] = new Array(10);
      }

      await compile(files, req.body.problem, status);
      // await sleep(5000);
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

      // await sleep(20000);

      for (let i = 0; i < files.length; i++) {
        console.log(files[i] + " " + status[i] + " " + total[i]);
      }

      reply.header("Content-Type", "application/json").send({
        success: true
      });
      return;
    }
  );
}

module.exports = routes;

// files.forEach(async (filename, index) => {
//   status[index] = 1;
//
//   var id = filename.substr(0, filename.lastIndexOf("."));
//   var compileCommand = "";
//   var command = "";
//   var filePath = "./data/" + req.body.problem;
//   var truncFile = filename.substr(0, filename.lastIndexOf("."));
//
//   if (
//     problemInfo[req.body.problem][id].language.startsWith("c++") ||
//     problemInfo[req.body.problem][id].language.startsWith("java")
//   ) {
//     if (problemInfo[req.body.problem][id].language.startsWith("c++"))
//       command = "./" + truncFile;
//     if (problemInfo[req.body.problem][id].language.startsWith("java"))
//       command = "java " + truncFile;
//     if (problemInfo[req.body.problem][id].language == "c++11")
//       compileCommand = "g++ -std=c++11 -o " + truncFile + " " + filename;
//     if (problemInfo[req.body.problem][id].language == "c++14")
//       compileCommand = "g++ -std=c++14 -o " + truncFile + " " + filename;
//     if (problemInfo[req.body.problem][id].language == "c++17")
//       compileCommand = "g++ -std=c++17 -o " + truncFile + " " + filename;
//     if (problemInfo[req.body.problem][id].language == "java8")
//       compileCommand =
//         "update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java && javac " +
//         filename;
//     if (problemInfo[req.body.problem][id].language == "java11")
//       compileCommand =
//         "update-alternatives --set java /usr/lib/jvm/java-11-oracle/bin/java && javac " +
//         filename;
//     exec("rm " + filePath + "/" + truncFile, async (err, sout, serr) => {
//       exec(
//         compileCommand,
//         { timeout: 6000, cwd: filePath },
//         async (error, stdout, stderr) => {
//           if (err) {
//             status[index] = 4;
//             return;
//           }
//
//           await sleep(500);
//
//           startTime[index] = Date.now();
//           if (command.startsWith("java")) {
//             exec(
//               command,
//               { timeout: 8000, cwd: filePath },
//               (error, stdout, stderr) => {
//                 if (error) {
//                   if (Date.now() - startTime[index] <= 5000) {
//                     status[index] = 5;
//                   } else {
//                     status[index] = 3;
//                   }
//                   return;
//                 }
//                 if (Date.now() - startTime[index] <= 5000) {
//                   status[index] = 2;
//                 } else {
//                   status[index] = 3;
//                 }
//               }
//             );
//           } else {
//             execFile(
//               command,
//               { timeout: 8000, cwd: filePath },
//               (error, stdout, stderr) => {
//                 if (error) {
//                   if (Date.now() - startTime[index] <= 5000) {
//                     status[index] = 5;
//                   } else {
//                     status[index] = 3;
//                   }
//                   return;
//                 }
//                 if (Date.now() - startTime[index] <= 5000) {
//                   status[index] = 2;
//                 } else {
//                   status[index] = 3;
//                 }
//               }
//             );
//           }
//         }
//       );
//     });
//   } else {
//     if (problemInfo[req.body.problem][id].language == "python27")
//       command = "python2.7 " + filePath;
//     if (problemInfo[req.body.problem][id].language == "python36")
//       command = "python3.6 " + filePath;
//     if (problemInfo[req.body.problem][id].language == "python37")
//       command = "python3.7 " + filePath;
//     if (problemInfo[req.body.problem][id].language == "python38")
//       command = "python3.8 " + filePath;
//     exec(
//       command,
//       { timeout: 8000, cwd: filePath },
//       (error, stdout, stderr) => {
//         if (error) {
//           if (Date.now() - startTime[index] <= 5000) {
//             status[index] = 5;
//           } else {
//             status[index] = 3;
//           }
//           return;
//         }
//         if (Date.now() - startTime[index] <= 5000) {
//           status[index] = 2;
//         } else {
//           status[index] = 3;
//         }
//       }
//     );
//   }
// });
