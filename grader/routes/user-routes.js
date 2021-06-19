async function routes(fastify, options) {
    const bcrypt = require("bcrypt");
    const saltRounds = 8;
    const db = fastify.mongo.client.db("taugrad");
    const c = db.collection("users");
    const cTeams = db.collection("teams");

    fastify.post("/register", async (req, reply) => {
        let params = req.body; // Username, Displayname, Email, Password (Needs to be hashed), Type of Account, Timestamp created
        if (!params.username || !params.email || !params.password || !params.time) {
            reply
                .code(422)
                .send(new Error("Missing one or more parameters for signup"));
            return;
        }

        if (Math.floor(Date.now() / 1000) - params.time > 5) {
            reply.code(403).send(new Error("Invalid signup"));
        }

        let user = await c
            .find(
                {username: params.username},
                {collation: {locale: "en", strength: 2}}
            )
            .toArray();
        if (user.length > 0) {
            reply.code(409).send(new Error("Username taken"));
            return;
        }

        user = await c
            .find(
                {email: params.email},
                {collation: {locale: "en", strength: 2}}
            )
            .toArray();
        if (user.length > 0) {
            reply.code(409).send(new Error("A user with that email already exists"));
            return;
        }

        const hash = await bcrypt.hash(params.password, saltRounds);
        let id =
            parseInt((await c.findOne({specificUse: "databaseInfo"})).userId) + 1;
        c.updateOne({specificUse: "databaseInfo"}, {$set: {userId: id}});
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
            firstlogin: -1,
        });
        // const token = fastify.jwt.sign({
        //   id: id,
        //   username: params.user,
        //   email: params.email,
        //
        // });
        reply.send({success: true});
    });

    fastify.post("/login", async (req, reply) => {
        let params = req.body;
        if (!params.identifier || !params.password) {
            reply
                .code(422)
                .send(new Error("Missing one or more parameters for login"));
            return;
        }
        let userBasedName = await c.findOne(
            {username: params.identifier},
            {collation: {locale: "en", strength: 2}}
        );
        let userBasedEmail = await c.findOne(
            {email: params.identifier},
            {collation: {locale: "en", strength: 2}}
        );
        let method = -1;
        let user;
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

        let first_login = user.firstlogin;
        if (!first_login || first_login <= 0) {
            first_login = Math.floor(Date.now() / 1000);
            await c.updateOne({id: user.id}, {$set: {firstlogin: first_login}});
        }
        let last_time = user.lastlogin;
        last_time = Math.floor(Date.now() / 1000);
        await c.updateOne({id: user.id}, {$set: {lastlogin: last_time}});
        const token = fastify.jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
            firstlogin: user.firstlogin,
        });
        reply.send({token: token, username: user.username});
        return;
    });

    fastify.post(
        "/check",
        {preValidation: [fastify.authenticate]},
        async (req, reply) => {
            let params = req.body;
            if (!params.password) {
                reply.code(400).send(new Error("Missing parameter"));
                return;
            }
            let user = await c.findOne({id: req.user.id});

            if (!user) {
                reply.code(404).send(new Error("User not found"));
                return;
            }

            const verify = await bcrypt.compare(params.password, user.pass);
            reply.send({valid: verify});
            return;
        }
    );

    fastify.get(
        "/logout",
        {preValidation: [fastify.authenticate]},
        async (req, reply) => {
            let params = req.query;
            let user = await c.findOne({id: req.user.id});
            if (params["logoutall"] === "true") {
                await c.updateOne({id: req.user.id}, {$set: {firstlogin: -1}});
            }
            reply.code(200).send({success: true});
        }
    );

    let millisSinceEpoch = new Date(2020, 6, 19, 8).getTime();

    fastify.get(
        "/user",
        {preValidation: [fastify.authenticate]},
        async (req, reply) => {
            let data = await c.findOne({id: req.user.id});
            let team = "None",
                teamcode = null;
            let start = 0,
                ended;
            if (data.teamname) {
                team = data.teamname;
                let teamData = await cTeams.findOne({id: data.team});
                if (Date.now() >= 1595160000000) {
                    // 1095160000000
                    start = teamData.start;
                    ended = Date.now() - teamData.start > 10800000;
                }
                teamcode = teamData.code;
            }
            reply.send({
                user: req.user,
                profile: data.profile,
                team: team,
                teamcode: teamcode,
                competitionStart: Date.now() >= 1595160000000, // 1595160000000
                started: start,
                ended: ended,
            });
            return;
        }
    );

    fastify.post(
        "/confirmTeam",
        {preValidation: [fastify.authenticate]},
        async (req, reply) => {
            let params = req.body;
            if (!params) {
                reply.code(400).send(new Error("Missing body"));
                return;
            }
            if (!params.teamcode) {
                reply.code(400).send(new Error("Missing team code"));
                return;
            }
            let team = await cTeams.findOne({code: params.teamcode});
            if (!team) {
                reply.code(404).send(new Error("Team not found"));
                return;
            }

            let data = await c.findOne({id: req.user.id});

            if (data.team) {
                if (data.team === team.id) {
                    reply.code(400).send(new Error("You're already in that team!"));
                    return;
                }
                let prevTeam = cTeams.findOne({id: data.team});
                let members = prevTeam.members;
                members = members.filter((value, index, arr) => {
                    return value !== req.user.id;
                });
                await cTeams.updateOne(prevTeam, {$set: {members}});
            }

            await c.updateOne(
                {id: req.user.id},
                {$set: {team: team.id, teamname: team.teamname}}
            );

            let members = team.members;
            if (!members) members = [];
            members.push(req.user.id);

            await cTeams.updateOne({id: team.id}, {$set: {members: members}});

            reply.send({success: true, team: team.teamname});
        }
    );

    fastify.post(
        "/startTime",
        {preValidation: [fastify.authenticate]},
        async (req, reply) => {
            let data = await c.findOne({id: req.user.id});

            if (!data.team) {
                reply.code(400).send(new Error("You are not in a team, join one"));
            }

            if (Date.now() < 1595160000000) {
                reply
                    .code(400)
                    .send(
                        new Error(
                            "The contest has not started yet! It starts on July 19th at 8:00AM Eastern."
                        )
                    );
            }

            if (Date.now() > 1595808000000) {
                reply
                    .code(400)
                    .send(
                        new Error(
                            "The contest is over! You can no longer start the competition."
                        )
                    );
            }

            let teamData = await cTeams.findOne({id: data.team});

            if (!teamData) {
                reply.code(400).send(new Error("Team not found"));
                return;
            }

            if (teamData.start) {
                reply.code(400).send(new Error("Time has already started"));
                return;
            }

            await cTeams.updateOne(
                {id: data.team},
                {$set: {start: Date.now()}}
            );
            reply.send({success: true});
        }
    );
}

module.exports = routes;
