import fastify from "fastify";

const build = () => {
    const app = fastify({});
    app.get("/", async (req, res) => {
        const { name = "World" } = req.query;
        req.log.info({ name }, "hello, world!");
        return `Hello, ${name}`;
    });

    return app;
};

export default build;
