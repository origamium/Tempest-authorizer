import { NowRequest, NowResponse } from "@now/node";
import formurlencoded from "form-urlencoded";
import fastify, { FastifyInstance } from "fastify";
import fetch from "node-fetch";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;

const slack = (): FastifyInstance => {
    const app = fastify(process.env.NODE_ENV === "development" ? { logger: true } : {});
    app.get("/api/slack/oauth", async (req, res) => {
        const { code, temp_code } = req.query as { temp_code?: string; code?: string };
        if (code) {
            res.status(200);
            res.header("content-type", "application/json");
            res.send(JSON.stringify(code));
        } else if (temp_code) {
            const slackOAuthAccessRequest = await fetch(
                "https://slack.com/api/oauth.v2.access",
                {
                    method: "POST",
                    body: formurlencoded({
                        client_id: SLACK_CLIENT_ID,
                        client_secret: SLACK_CLIENT_SECRET,
                        code: temp_code,
                        redirect_uri:
                            "https://tempest-authorizer.origamium.net/api/slack/oauth",
                    }),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            res.status(200);
            res.header("content-type", "application/json");
            res.send(slackOAuthAccessRequest.json());
        }

        res.status(400);
        res.send("bad request");
    });

    return app;
};

const slackAuthorize = slack();

module.exports = async (req: NowRequest, res: NowResponse): Promise<void> => {
    await slackAuthorize.ready();
    slackAuthorize.server.emit("request", req, res);
};
