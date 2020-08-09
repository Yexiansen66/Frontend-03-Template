  
const net = require('net');
const htmlParser = require('./html-parser');
const { HttpResponseParser } = require('./http-response-parser')

class HttpRequest {
    constructor(options) {
        this.method = options.method || "GET";
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || "/";
        this.body = options.body || {};
        this.headers = options.headers || {};
        if (!this.headers["Content-Type"]) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        if (this.headers["Content-Type"] === "application/json")
            this.bodyText = JSON.stringify(this.body);
        else if (this.headers["Content-Type"] === "application/x-www-form-urlencoded")
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');

        this.headers["Content-Length"] = this.bodyText.length;
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers).map(key => `${key}:${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}`
    }

    async request(connection) {
        let parser = new HttpResponseParser();
        return new Promise((resolve, reject) => {
            if (connection) {
                connection.write(this.toString())
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString())
                })
            }

            connection.on('data', (data) => {
                parser.parse(data.toString());
                resolve(parser.response);
                connection.end();
            });

            connection.on('error', e => {
                reject(e);
                connection.end();
            })
        });
    }
}

void async function () {
    let request = new HttpRequest({
        method: "POST",
        host: "localhost",
        port: "8666",
        path: "/",
        headers: {
            ['X-Foo2']: 'customed'
        },
        body: {
            name: "KwokKwok"
        }
    });

    let response = await request.request();
    let document = htmlParser.parse(response.body);
    console.log(document)
}();