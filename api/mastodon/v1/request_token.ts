import { NowRequest, NowResponse } from "@now/node";
import formurlencoded from "form-urlencoded";
import fastify, { FastifyInstance } from "fastify";
import fetch from "node-fetch";
import { ProviderData, mstdnjp, pawoo } from "../apikeys";

const getProviderData = (provider: string): ProviderData | never => {
    switch (provider) {
        case "mstdnjp":
            return mstdnjp;
        case "pawoo":
            return pawoo;
        default:
            throw new Error(`unknown provider name: ${provider}`);
    }
};

const mastodonRequestToken = (): FastifyInstance => {
    const app = fastify(process.env.NODE_ENV === "development" ? { logger: true } : {});
    app.post("/api/mastodon/v1/request_token", async (req, res) => {
        const { code, scope, provider: providerName } = req.body as {
            code?: string;
            scope?: string;
            provider?: string;
        };

        if (typeof providerName !== "string") {
            res.status(400);
            res.send("bad request: provider is not string");
            return;
        }

        if (typeof code !== "string") {
            res.status(400);
            res.send("bad request: parameter is not string");
            return;
        }

        try {
            const provider = getProviderData(providerName);
            const result = await fetch(provider.url, {
                method: "POST",
                body: JSON.stringify({
                    client_id: provider.apiKey,
                    client_secret: provider.apiSecret,
                    redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
                    code,
                    scope,
                    grant_type: "code",
                }),
            });

            const json = result.json();

            res.status(200);
            res.header("content-type", "application/json");
            res.send(json);
        } catch (e) {
            res.status(400);
            res.send(`bad request: ${e.message}`);
            return;
        }
    });
    return app;
};

const mastodonRequestTokenInstance = mastodonRequestToken();

module.exports = async (req: NowRequest, res: NowResponse): Promise<void> => {
    await mastodonRequestTokenInstance.ready();
    mastodonRequestTokenInstance.server.emit("request", req, res);
};
