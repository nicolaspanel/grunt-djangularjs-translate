var stringify = require('stringify-object');

function json(Handlebars) {
    Handlebars.registerHelper('json', function(obj) {
        return stringify(obj, {indent: '    '});
    });
}


module.exports = json;
