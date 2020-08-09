class ChunkedBodyParser {
  WAITTING_CHUNK_LENGTH = 0;
  WAITTING_CHUNK_LENGTH_END = 1;
  WAITTING_CHUNK_CONTENT = 2;
  WAITTING_CHUNK_CONTENT_END = 3;
  WAITTING_BODY_END = 4;
  current = this.WAITTING_CHUNK_LENGTH;
  currentChunkLengthStr = "";
  currentChunkLength = 0;
  data = "";
  receiveChar(c) {
      switch (this.current) {
          case this.WAITTING_CHUNK_LENGTH:
              if (c == "\r") {
                  this.current = this.WAITTING_CHUNK_LENGTH_END;
                  this.currentChunkLength = parseInt(this.currentChunkLengthStr, 16);
                  if (this.currentChunkLength === 0) {
                      this.current = this.WAITTING_BODY_END;
                  }
              } else {
                  this.currentChunkLengthStr += c;
              }
              break;
          case this.WAITTING_CHUNK_LENGTH_END:
              if (c == "\n") {
                  this.current = this.WAITTING_CHUNK_CONTENT;
              }
              break;
          case this.WAITTING_CHUNK_CONTENT:
              if (this.currentChunkLength === 0 && c === "\r") {
                  this.current = this.WAITTING_CHUNK_CONTENT_END;
              } else {
                  this.data += c;
                  this.currentChunkLength--;
              }
              break;
          case this.WAITTING_CHUNK_CONTENT_END:
              if (c == "\n") {
                  this.currentChunkLengthStr = ""
                  this.current = this.WAITTING_CHUNK_LENGTH;
              }
              break;
          case this.WAITTING_BODY_END:
              break;
          default:
              break;
      }
  }
}

class HttpResponseParser {
  WAITTING_STATUS_LINE = 0;
  WAITTING_STATUS_LINE_END = 1;
  WAITTING_HEADER_NAME = 2;
  WAITTING_HEADER_SAPCE = 3;
  WAITTING_HEADER_VALUE = 4;
  WAITTING_HEADER_LINE_END = 5;
  WAITTING_HEADER_BLOCK_END = 6;
  WAITTING_BODY = 7;

  current = this.WAITTING_STATUS_LINE;
  statusLine = "";
  currentHeaderName = "";
  currentHeaderValue = "";
  headers = {};
  body = "";
  bodyParser = new ChunkedBodyParser();

  parse(data) {
      for (const c of data) {
          this.receiveChar(c)
      }
  }

  get response() {
      this.statusLine.match(/HTTP\/1.1 ([0-9]+) (\w+)/)
      return {
          status: {
              code: parseInt(RegExp.$1),
              message: RegExp.$2
          },
          headers: this.headers,
          body: this.bodyParser.data
      }

  }

  receiveChar(c) {
      switch (this.current) {
          case this.WAITTING_STATUS_LINE:
              if (c == '\r') {
                  this.current = this.WAITTING_STATUS_LINE_END;
              } else {
                  this.statusLine += c;
              }
              break;
          case this.WAITTING_STATUS_LINE_END:
              if (c == "\n") {
                  this.current = this.WAITTING_HEADER_NAME;
              }
              break;
          case this.WAITTING_HEADER_NAME:
              if (c == "\r") {
                  this.current = this.WAITTING_HEADER_BLOCK_END;
              } else if (c == ":") {
                  this.current = this.WAITTING_HEADER_SAPCE;
              } else {
                  this.currentHeaderName += c;
              }
              break;
          case this.WAITTING_HEADER_SAPCE:
              if (c == " ") {
                  this.current = this.WAITTING_HEADER_VALUE;
              }
              break;
          case this.WAITTING_HEADER_VALUE:
              if (c == "\r") {
                  this.headers[this.currentHeaderName] = this.currentHeaderValue;
                  this.currentHeaderName = "";
                  this.currentHeaderValue = "";
                  this.current = this.WAITTING_HEADER_LINE_END;
              } else {
                  this.currentHeaderValue += c;
              }
              break;
          case this.WAITTING_HEADER_LINE_END:
              if (c == "\n") {
                  this.current = this.WAITTING_HEADER_NAME;
              }
              break;
          case this.WAITTING_HEADER_BLOCK_END:
              if (c == "\n") {
                  this.current = this.WAITTING_BODY;
              }
              break;
          case this.WAITTING_BODY:
              this.bodyParser.receiveChar(c);
              break;
          default:
              break;
      }
  }
}


module.exports = {
  HttpResponseParser
}