"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const inferTitle_1 = require("./inferTitle");
test('it returns the correct title', async () => {
    const axiosGetMock = jest.spyOn(axios_1.default, 'get');
    const mockedResponse = {
        data: `
      <HTML>
        <head>
          <title>TEST_TITLE</title>
        </head>
      </HTML>`,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
    };
    axiosGetMock.mockResolvedValue(mockedResponse);
    const result = await (0, inferTitle_1.inferTitle)('someurl');
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(result).toBe('TEST_TITLE');
});
//# sourceMappingURL=inferTitle.test.js.map