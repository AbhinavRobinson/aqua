# Aqua
Aqua is a minimal and fast web framework.

## Features
- Immediate parsing of the request body, query and the cookie string
- Middleware functions
- Possibility for route changes while runtime
- URL parameters
- [Blazing fast](#benchmarks)

## Example usage
```typescript
import Aqua from "https://deno.land/x/aqua/mod.ts";

const app = new Aqua(3100);

app.get("/", (req) => {
    return "Hello, World!";
});
```

## Routing
You can either use the short-form syntax for the `GET` and `POST` method
```typescript
app.get("/", (req) => "Hello, World!");
app.post("/", (req) => "Hello, World!");
```

or use the route function
```typescript
app.route("/", "GET", (req) => "Hello, World!");
```

## Middlewares
You can register middlewares, that will be able to adjust the response object, the following way:
```typescript
app.register((req, res) => {
    // Make changes to the response object
    // res.content = res.content.replace("Hello", "Hi");
    return res;
});
```

## URL parameters
You can define URL parameters by using a colon followed by the key name.
```typescript
app.get("/api/:action", (req) => {
    return req.parameters.action;
});
```

## Response value
You can either just return a string
```typescript
app.get("/", (req) => {
    return "Hello, World!";
});
```

or return a response object to also set cookies, headers or a status code
```typescript
app.get("/", (req) => {
    return {
        statusCode: 200,
        cookies: { hello: "I'm a cookie value" },
        headers: { hello: "I'm a header value" },
        content: "Hello, World!"
    };
});
```
Cookies and headers are just getting appended, so no information is getting lost by providing custom ones.
However, you can still overwrite existing headers.

## Benchmarks
|Framework  | Version   | Avg RPS   | Router?
|-----------|-----------|-----------|-----------
| Deno HTTP | 0.61.0    | 22614     | No
| **Aqua**  | **1.0.2** | **21360** | **Yes**
| Fastro    | 0.13.5    | 21292     | Yes
| Drash     | 1.0.7     | 18020     | Yes
| Denotrain | 0.5.2     | 13430     | Yes
| Attain    | master    | 9597      | Yes

## More examples

### Respond with the content of a file
```typescript
app.get("/", async (req) => {
    return await app.render("index.html");
});
```
_Please note that you must run your application with the `--allow-read` flag._

### Provide own fallback handler
Your provided fallback handler will be executed if no route has been found.
```typescript
app.provideFallback((req) => {
    return "No page found, sorry!";
});
```

### Redirect a request
```typescript
app.get("/dashboard", (req) => {
    return { redirect: "/login" };
});
```

### Static routes
You can register static routes by passing the path to the local folder and
the public alias to the `serve` function.
```javascript
app.serve("mystaticfolder", "/public");
// A GET request to /public/test.txt would serve the local file at mystaticfolder/test.txt
```

### Regex paths
You can provide a RegExp object instead of a string and receive the matches.
```typescript
app.get(new RegExp("\/(.*)"), (req) => {
    console.log(req.matches); // GET /hello-world -> [ "hello-world" ]

    return "Hello, World!";
});
```

### TLS
You can enable TLS the following way:
```typescript
const app = new Aqua(3001, {
    tls: {
        hostname: "localhost",
        certFile: "localhost.crt",
        keyFile: "localhost.key"
    }
});
```
The example above would handle requests coming to `https://localhost:3001`.

#### Handle HTTP and HTTPS requests
You are able to provide the TLS certificate to a different port and let the default port still handle HTTP requests.
```typescript
const app = new Aqua(3001, {
    tls: {
        hostname: "localhost",
        certFile: "localhost.crt",
        keyFile: "localhost.key",
        independentPort: 3002
    }
});
```
The example above would allow you to handle requests to `http://localhost:3001` and `https://localhost:3002`
at the same time.