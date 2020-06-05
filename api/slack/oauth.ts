import { NowRequest, NowResponse } from "@now/node";
import bent from "bent";
import fastify from "fastify";

const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID;
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET;

const slackGetOAuthAccess = bent("https://slack.com/api/oauth.access", "GET", "json", 200);

const slack = (): fastify.FastifyInstance => {
    const app = fastify(process.env.NODE_ENV === "development" ? { logger: true } : {});
    app.get("/api/slack/oauth", async (req, res) => {
        const { query } = req.query;
        if (query.state) {
            res.status(200);
            res.header("content-type", "application/json");
            res.send(JSON.stringify(query));
        } else if (query.access_token) {
            const slackOAuthAccessRequest = await slackGetOAuthAccess("", {
                client_id: SLACK_CLIENT_ID,
                client_secret: SLACK_CLIENT_SECRET,
                code: query.access_token as string,
                redirect_uri: "https://tempest-authorizer.origamium.net/slack-oauth",
            });

            res.status(200);
            res.header("content-type", "application/json");
            res.send(slackOAuthAccessRequest);
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
