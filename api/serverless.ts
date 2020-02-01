import { NowRequest, NowResponse } from "@now/node";
import build from "./index";

const app = build();

module.exports = async (req: NowRequest, res: NowResponse): Promise<void> => {
    await app.ready();
    app.server.emit("request", req, res);
};
