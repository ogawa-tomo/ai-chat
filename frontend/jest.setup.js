import "@testing-library/jest-dom";

// Mock scrollIntoView (not implemented in jsdom)
Element.prototype.scrollIntoView = jest.fn();

// Mock ReadableStream for Node.js environment
if (typeof ReadableStream === "undefined") {
  global.ReadableStream = class ReadableStream {
    constructor(underlyingSource) {
      this.underlyingSource = underlyingSource;
      this.locked = false;
    }

    getReader() {
      this.locked = true;
      const source = this.underlyingSource;
      let started = false;

      return {
        read: async () => {
          if (!started) {
            started = true;
            if (source.start) {
              source.start({
                enqueue: (chunk) => {
                  this._chunk = chunk;
                },
                close: () => {
                  this._closed = true;
                },
              });
            }
          }

          if (this._chunk) {
            const chunk = this._chunk;
            this._chunk = undefined;
            return { done: false, value: chunk };
          }

          if (this._closed) {
            return { done: true, value: undefined };
          }

          return { done: true, value: undefined };
        },
        releaseLock: () => {
          this.locked = false;
        },
      };
    }
  };
}

// Mock TextEncoder/TextDecoder
if (typeof TextEncoder === "undefined") {
  global.TextEncoder = class TextEncoder {
    encode(str) {
      const buf = Buffer.from(str, "utf-8");
      return new Uint8Array(buf);
    }
  };
}

if (typeof TextDecoder === "undefined") {
  global.TextDecoder = class TextDecoder {
    decode(arr) {
      return Buffer.from(arr).toString("utf-8");
    }
  };
}
