const {readdirSync, readFileSync, writeFile} = require("fs");
const path = require("path");
const {exec, execFile} = require("child_process");
const pump = require("pump");
const fs = require("fs");
const js_diff = require("diff");

const arrUtils = require("../utils/arrays.js");

let regulations = JSON.parse(fs.readFileSync("./regulation.json"));
let problems = regulations.problems;

let problemInfo = {};

saveProblemInfo = (problem) => {
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
    problems.forEach((problem) => {
        fs.writeFileSync(
            "./data/" + problem + "/info.json",
            JSON.stringify(problemInfo[problem], null, 2)
        );
    });
    return true;
};

loadProblemInfo = (problem) => {
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
            fs.mkdir("./data/" + problem, {recursive: true});
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
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function compile(files, problem, status) {
    await Promise.all(
        Object.keys(files).map(async (index) => {
            let filename = files[index];
            status[index][0] = 0;

            const id = filename.substr(0, filename.lastIndexOf("."));
            let compileCommand = "";
            const filePath = "./data/" + problem;
            const testPath = filePath + "/" + id;
            const truncFile = filename.substr(0, filename.lastIndexOf("."));
            if (!fs.existsSync(testPath + "/")) fs.mkdirSync(testPath + "/");

            if (
                problemInfo[problem][id].language.startsWith("c++") ||
                problemInfo[problem][id].language.startsWith("java")
            ) {
                if (problemInfo[problem][id].language === "c++11")
                    compileCommand =
                        "g++ -std=c++11 -o " + id + "/" + truncFile + " " + filename;
                if (problemInfo[problem][id].language === "c++14")
                    compileCommand =
                        "g++ -std=c++14 -o " + id + "/" + truncFile + " " + filename;
                if (problemInfo[problem][id].language === "c++17")
                    compileCommand =
                        "g++ -std=c++17 -o " + id + "/" + truncFile + " " + filename;
                if (problemInfo[problem][id].language === "java8")
                    compileCommand =
                        "update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java && javac -d " +
                        id +
                        " " +
                        filename;
                if (problemInfo[problem][id].language === "java11")
                    compileCommand =
                        "update-alternatives --set java /usr/lib/jvm/java-11-oracle/bin/java && javac -d " +
                        id +
                        " " +
                        filename;
                await new Promise((resolve, reject) => {
                    if (fs.existsSync(testPath + "/" + truncFile))
                        fs.unlinkSync(testPath + "/" + truncFile);
                    if (fs.existsSync(testPath + "/" + truncFile + ".exe"))
                        fs.unlinkSync(testPath + "/" + truncFile + ".exe");
                    // exec("rm " + testPath + "/" + truncFile, (err, sout, serr) => {
                    exec(
                        compileCommand,
                        {timeout: 8000, cwd: filePath},
                        (error, stdout, stderr) => {
                            if (error) {
                                status[index][0] = 4;
                            } else {
                                status[index][0] = 1;
                            }
                            resolve();
                        }
                    );
                    // });
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
        Object.keys(files).map(async (index) => {
            let filename = files[index];
            const id = filename.substr(0, filename.lastIndexOf("."));
            let command = "";
            const filePath = "./data/" + problem;
            const testPath = filePath + "/" + id;
            const truncFile = filename.substr(0, filename.lastIndexOf("."));

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
                        if (problemInfo[problem][id].language === "java8")
                            command =
                                "update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java && java " +
                                filename;
                        if (problemInfo[problem][id].language === "java11")
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
                            {timeout: 7000, cwd: testPath},
                            (error, stdout, stderr) => {
                                if (error) {
                                    if (Date.now() - startTime[index] <= 5000) {
                                        status[index][i] = 5; // Error within time
                                    } else {
                                        status[index][i] = 3; // Timeout with error
                                    }
                                    resolve();
                                    return;
                                }
                                if (Date.now() - startTime[index] <= 5000) {
                                    status[index][i] = 2; // Finished within time
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
                                        let diff = js_diff.diffLines(answer, output);
                                        if (diff.length <= 1) {
                                            total[index]++;
                                            results[index][i - 1] = true;
                                        } else {
                                            results[index][i - 1] = false;
                                        }
                                    }
                                } else {
                                    status[index][i] = 3; // Timeout error
                                }
                                resolve();
                            }
                        );
                    } else {
                        execFile(
                            command,
                            {timeout: 7000, cwd: testPath + "/"},
                            (error, stdout, stderr) => {
                                if (error) {
                                    console.log(error);
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
                                        diff = js_diff.diffLines(answer, output);
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
                    if (problemInfo[problem][id].language === "python27")
                        command = "python2.7 " + filename;
                    if (problemInfo[problem][id].language === "python36")
                        command = "python3.6 " + filename;
                    if (problemInfo[problem][id].language === "python37")
                        command = "python3.7 " + filename;
                    if (problemInfo[problem][id].language === "python38")
                        command = "python3.8 " + filename;
                    exec(
                        command,
                        {timeout: 7000, cwd: testPath},
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
                                    let diff = js_diff.diffLines(answer, output);
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

async function routes(fastify, options) {
    // const db = fastify.mongo.client.db("globalmind");
    const db = fastify.mongo.client.db("taugrad");
    const cScores = db.collection("scores");
    const cUsers = db.collection("users");
    const cTeams = db.collection("teams");

    fastify.post(
        "/grade",
        {preValidation: [fastify.authenticate]},
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

            let accEndings = [".cpp", ".py", ".java"];

            files = files.filter(function (e) {
                return accEndings.includes(path.extname(e).toLowerCase());
            });

            let status = new Array(files.length);
            let total = new Array(files.length);
            total.fill(0);
            let results = new Array(files.length);

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
                let id = files[i].substr(0, files[i].lastIndexOf("."));
                console.log(files[i] + " " + status[i] + " " + total[i]);
                let scores = await cScores.findOne({id: id});
                if (!scores) {
                    await cScores.insertOne({id: id});
                }
                cScores.updateOne(
                    {id: id},
                    {
                        $set: {
                            [req.body.problem]: {
                                status: status[i],
                                total: total[i],
                                results: results[i],
                            },
                        },
                    }
                );
            }

            reply.header("Content-Type", "application/json").send({
                success: true,
            });
        }
    );

    fastify.post(
        "/genTeams",
        {preValidation: [fastify.authenticate]},
        async (req, reply) => {
            if (req.user.id !== 1) {
                reply.code(401);
            }

            if (!req.body) {
                reply.code(422).send(new Error("Missing parameters"));
            }

            let code =
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

            while (await cTeams.findOne({code})) {
                code =
                    Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15);
            }

            let found = false;
            let user = null;

            if (req.body.id) {
                let data = await cUsers.findOne({id: req.body.id});
                if (data) {
                    found = true;
                    user = data;
                }
            }

            if (!found && req.body.email) {
                let data = await cUsers.findOne({email: req.body.email});
                if (data) {
                    found = true;
                    user = data;
                }
            }

            if (!found || !user) {
                reply.code(404).send({found: false});
                return;
            }

            if (user.team) {
                reply.code(404).send({found: true, hasTeam: true});
                return;
            }

            if (await cTeams.findOne({teamname: req.body.name})) {
                reply.code(404).send({found: true, hasTeam: false, teamExists: true});
                return;
            }

            let metadata = await cTeams.findOne({specificUse: "databaseInfo"});
            let teamId = metadata.teamId + 1;

            cTeams.updateOne(metadata, {$set: {teamId: teamId}});

            await cTeams.insertOne({
                id: teamId,
                code: code,
                teamname: req.body.name,
            });

            await cUsers.updateOne(user, {
                $set: {team: teamId, teamname: req.body.name},
            });

            let members = [];
            members.push(user.id);

            await cTeams.updateOne({id: teamId}, {$set: {members: members}});

            reply.send({found: true, hasTeam: false, code});
        }
    );
}

module.exports = routes;