
var path = require('path');
var fs = require('fs');
var assert = require('assert');

function readFile(pathToFile) {
    var absPath = path.join(__dirname, '..', pathToFile);
    return {
        content: fs.readFileSync(absPath, 'utf8'),
        path: absPath
    };
}

function assertExists(pathToFile) {
    var absPath = path.join(__dirname, '..', pathToFile);
    return assert.ok(fs.existsSync(absPath, 'utf8'), absPath + ' not found');
}

module.exports = {
    readFile: readFile,
    assertExists: assertExists
};