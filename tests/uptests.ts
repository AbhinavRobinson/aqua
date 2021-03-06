import Aqua from "../mod.ts";

const app = new Aqua(4000);
let registeredTests = 0;
let solvedTests = 0;

async function request(suffix: string = "", options: any = {}) {
    return await (await fetch(`http://localhost:4000${suffix}`, options)).text();
}

function registerTest(name: string, fn: () => any) {
    registeredTests++;
    Deno.test(name, async () => {
        await fn();
        solvedTests++;
    });
}

await request();

registerTest("Is website up and is the content right?", async () => {
    app.get("/", (req) => "Hello, World!");

    const content = await request();
    if (content !== "Hello, World!") throw Error("Page isn't up or the content is wrong");
});

registerTest("Middlewares working?", async () => {
    app.get("/", (req) => "Hello, REPLACE_ME!");
    app.register((req, respondValue) => {
        return {
            ...respondValue,
            content: respondValue.content?.replace("REPLACE_ME", "Planet") || ""
        };
    });

    const content = await request();
    if (content !== "Hello, Planet!") throw Error("Middlewares don't seem to work");
});

registerTest("URL parameters working?", async () => {
    app.get("/api/:action", (req) => req.parameters.action);

    const content = await request(`/api/hello`);
    if (content !== "hello") throw Error("URL parameters don't seem to work");
});

registerTest("URL query decoding working?", async () => {
    app.get("/search", (req) => JSON.stringify(req.query));

    const content = await request("/search?q=foo+bar&withCharsThatNeedEscaping=%24%26");
    if (content !== `{"q":"foo bar","withCharsThatNeedEscaping":"$&"}`) throw Error("URL query decoding doesn't seem to work");
});

registerTest("Custom fallback handler working?", async () => {
    app.provideFallback((req) => "Nothing to see here");

    const content = await request(`/this_route_doesnt_exist`);
    if (content !== "Nothing to see here") throw Error("Custom fallback handlers don't seem to work");
});

registerTest("Regex routes working?", async () => {
    app.get(new RegExp("\/hello-world\/(.*)"), (req) => JSON.stringify(req.matches));

    const content = await request(`/hello-world/hello/okay`);
    if (JSON.parse(content)[0] !== "hello/okay") throw Error("Regex routes don't seem to work");
});

registerTest("Regex route priorities working?", async () => {
    app.get("/hello-world/should-trigger-first", (req) => "First!");

    const content = await request(`/hello-world/should-trigger-first`);
    if (content !== "First!") throw Error("Regex route priorities don't seem to work");
});

registerTest("Body parsing working if Object converted to JSON string?", async () => {
    app.post("/test-json-body-parsing", (req) => req.body.test);

    const content = await request(`/test-json-body-parsing`, { method: "post", body: JSON.stringify({ test: "hello" }) });
    if (content !== "hello") throw Error("Body parsing of a object converted to a JSON string don't seem to work");
});

registerTest("Body parsing working if passed FormData?", async () => {
    app.post("/test-formdata-body-parsing", (req) => req.body.test);

    const f = new FormData();
    f.append("test", "hello");

    const content = await request(`/test-formdata-body-parsing`, { method: "post", body: f });
    if (content !== "hello") throw Error("Body parsing of FormData don't seem to work");
});

setInterval(() => {
    if (registeredTests === solvedTests) Deno.exit(0);
}, 500);
