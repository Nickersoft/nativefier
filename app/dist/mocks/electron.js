"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebRequest = exports.WebContents = exports.Session = exports.BrowserWindow = exports.dialog = void 0;
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable @typescript-eslint/no-unused-vars */
const events_1 = require("events");
/*
  These mocks are PURPOSEFULLY minimal. A few reasons as to why:
  1. I'm l̶a̶z̶y̶ a busy person :)
  2. The less we have in here, the less we'll need to fix if an electron API changes
  3. Only mocking what we need as we need it helps reveal areas under test where electron
     is being accessed in previously unaccounted for ways
  4. These mocks will get fleshed out as more unit tests are added, so if you need
     something here as you are adding unit tests, then feel free to add exactly what you
     need (and no more than that please).

  As well, please resist the urge to turn this into a reimplimentation of electron.
  When adding functions/classes, keep your implementation to only the minimal amount of code
  it takes for TypeScript to recognize what you are doing. For anything more complex (including
  implementation code and return values) please do that within your tests via jest with
  mockImplementation or mockReturnValue.
*/
class MockBrowserWindow extends events_1.EventEmitter {
    constructor(options) {
        // @ts-expect-error options is really EventEmitterOptions, but events.d.ts doesn't expose it...
        super(options);
        this.webContents = new MockWebContents();
    }
    addTabbedWindow(tab) {
        return;
    }
    focus() {
        return;
    }
    static fromWebContents(webContents) {
        return new MockBrowserWindow();
    }
    static getFocusedWindow(window) {
        return window !== null && window !== void 0 ? window : new MockBrowserWindow();
    }
    isSimpleFullScreen() {
        throw new Error('Not implemented');
    }
    isFullScreen() {
        throw new Error('Not implemented');
    }
    isFullScreenable() {
        throw new Error('Not implemented');
    }
    loadURL(url, options) {
        return Promise.resolve(undefined);
    }
    setFullScreen(flag) {
        return;
    }
    setSimpleFullScreen(flag) {
        return;
    }
}
exports.BrowserWindow = MockBrowserWindow;
class MockDialog {
    static showMessageBox(browserWindow, options) {
        throw new Error('Not implemented');
    }
    static showMessageBoxSync(browserWindow, options) {
        throw new Error('Not implemented');
    }
}
exports.dialog = MockDialog;
class MockSession extends events_1.EventEmitter {
    constructor() {
        super();
        this.webRequest = new MockWebRequest();
    }
    clearCache() {
        return Promise.resolve();
    }
    clearStorageData() {
        return Promise.resolve();
    }
}
exports.Session = MockSession;
class MockWebContents extends events_1.EventEmitter {
    constructor() {
        super();
        this.session = new MockSession();
    }
    getURL() {
        throw new Error('Not implemented');
    }
    insertCSS(css, options) {
        throw new Error('Not implemented');
    }
}
exports.WebContents = MockWebContents;
class MockWebRequest {
    constructor() {
        this.emitter = new InternalEmitter();
    }
    onResponseStarted(filter, listener) {
        if (listener) {
            this.emitter.addListener('onResponseStarted', (details) => listener(details));
        }
    }
    send(event, ...args) {
        this.emitter.emit(event, ...args);
    }
}
exports.WebRequest = MockWebRequest;
class InternalEmitter extends events_1.EventEmitter {
}
//# sourceMappingURL=electron.js.map