import { NowRequest, NowResponse } from "@now/node/dist";
import fastify, { FastifyInstance } from "fastify";

const twitterOAuth = (): FastifyInstance => {
    const app = fastify(process.env.NODE_ENV === "development" ? { logger: true } : {});
    app.get("/api/twitter/oauth", async (req, res) => {
        res.status(501);
        res.send();
    });

    return app;
};

const twitterAuthorize = twitterOAuth();

module.exports = async (req: NowRequest, res: NowResponse): Promise<void> => {
    await twitterAuthorize.ready();
    twitterAuthorize.server.emit("request", req, res);
};
