'use strict';

var format = require('string-format');
var _ = require('lodash');
var Handlebars = require('handlebars');
var fs = require('fs');
var path =  require('path');
var templateHelpers = require('../templates/helpers/index');

_.forEach(templateHelpers, function (register) { register(Handlebars); });

var templatesDir = path.resolve(__dirname, '../templates'),
    cache = {};

function buildRegExp(str, opt){
    return new RegExp(str, opt || 'gi');
}

var SPACE_OR_NEW_LINE = '(?:(?:\\s|\\n)*)*?'; // [...]
var ONE_TIME_BINDING = format('{0}(?:\\:\\:)?{0}', SPACE_OR_NEW_LINE); // [...::...]
var COMMENT_REG = format('\\/\\*{0}translate{0}\\*\\/', SPACE_OR_NEW_LINE); // /*[...]translate[...]*/
var SERVICE_REG = '\\$translate(?:\\.instant)?';               // $translate
var S_QUOTE = '\\\'';
var D_QUOTE = '"';
var QUOTE_REG = format('(?:{0}|{1})', S_QUOTE, D_QUOTE);
var REGEXES = {
    comment: buildRegExp(format('{0}{1}(\\S+?){1}', COMMENT_REG, QUOTE_REG)), // looks for commented translations. Ex: /* translation */'TRANS_ID'
    serviceSingle: buildRegExp(format('{0}\\(\\s*?{1}(\\S+?){1}', SERVICE_REG, QUOTE_REG)), // looks for service with single translations. Ex: $translate('TRANS_ID')
    serviceMultiple: buildRegExp(format('{0}\\({1}(\\[{1}(?:{2}\\S+?{2}(?:(?:\\s|\\n|,)*?)*?)+{1}\\]){1}\\)', SERVICE_REG, SPACE_OR_NEW_LINE, QUOTE_REG)), // looks for service with multiple translations on single line. Ex: $translate(['TRANS_ID_01', 'TRANS_ID_01'])
    filter: buildRegExp(format('{0}{4}{3}(\\S+?){3}{2}\\|{2}translate.*?{1}', '{{', '}}', SPACE_OR_NEW_LINE, QUOTE_REG, ONE_TIME_BINDING)), // looks for filter in curly brackets. Ex: {{ 'TRANS_ID' |translate }}
    //expression: buildRegExp(format('<[^>]*={1}{0}{1}(\\S+){1}{0}\\|{0}translate(:.*?)?{0}(?:{0}\\|{0}\\S+(:.*?)?{0})*{1}', SPACE_OR_NEW_LINE, QUOTE_REG)), // looks for filter in curly directive expression. Ex: <i ng-bind="'TRANS_ID' |translate " ></i>
    sqexpression: buildRegExp(format('<[^>]*?bind(?:-html)?={1}{3}{2}(.+){2}{0}\\|{0}translate.*?{1}', SPACE_OR_NEW_LINE, S_QUOTE, D_QUOTE, ONE_TIME_BINDING)), // looks for filter in curly directive expression. Ex: <i ng-bind='"TRANS_ID" |translate ' ></i>
    dqexpression: buildRegExp(format('<[^>]*?bind(?:-html)?={1}{3}{2}(.+){2}{0}\\|{0}translate.*?{1}', SPACE_OR_NEW_LINE, D_QUOTE, S_QUOTE, ONE_TIME_BINDING)), // looks for filter in curly directive expression. Ex: <i ng-bind="'TRANS_ID' |translate " ></i>
    directiveInterpolated: buildRegExp(format('<[^>]*?translate(?!=)[^{>]*>([^<]*)<\/[^>]*>', SPACE_OR_NEW_LINE)),
    directiveStandalone: buildRegExp(format('<[^>]*?translate={0}(\\S+?){0}', QUOTE_REG))
};

var MODULE_REG = buildRegExp('^^public\\/([^\\/]+)\\/.*', 'i');

function _findSingles(reg, file){
    var found = [], toBeRemoved = [];
    var match = reg.exec(file.content);
    while (match) {
        var trimmed = match[1].trim();
        if (trimmed) {
            found.push(trimmed);
        }
        toBeRemoved.push(match[0]);
        match = reg.exec(file.content);
    }
    toBeRemoved.forEach(function (str) {
        file.content = file.content.replace(str, '');
    });
    return found;
}

function _findMultiples(reg, file) {
    var found = [],
        toBeRemoved = [],
        match = reg.exec(file.content);
    while (match) {
        var reg2 = buildRegExp('(?:\\\'|\\\")(\\S+)(?:\\\'|\\\")');
        var match2 = reg2.exec(match[1]);
        while (match2) {
            var trimmed = match2[1].trim();
            if (trimmed){
                found.push(trimmed);
            }
            match2 = reg2.exec(match[1]);
        }
        toBeRemoved.push(match[0]);
        match = reg.exec(file.content);
    }
    toBeRemoved.forEach(function (str) {
        file.content = file.content.replace(str, '');
    });
    return found;
}

function findKeys(file){
    return _.chain(REGEXES)
        .pairs()
        .reduce(function(matches, pair){
            var regName = pair[0], reg = pair[1];

            switch (regName) {
                case 'serviceMultiple':
                    return matches.concat(_findMultiples(reg, file));
                default :
                    return matches.concat(_findSingles(reg, file));
            }
        }, [])
        .value();
}

function assignProperty(obj, path, value) {
    var props = path.split(".") , i = 0, prop;

    for(; i < props.length - 1; i++) {
        obj[props[i]] = obj[props[i]] || {};
        obj = obj[props[i]];
    }

    obj[props[i]] = value;
}


function deleteProperty(obj, path) {
    var props = path.split(".") , i = 0, prop;

    for(; i < props.length - 1; i++) {
        obj[props[i]] = obj[props[i]] || {};
        obj = obj[props[i]];
    }

    if (_.has(obj,props[i])){
        delete obj[props[i]];
    }
}

function nestify(translations, defaultValue) {
    return _.reduce(translations || [], function (memo, translation) {
        assignProperty(memo, translation, defaultValue || '');
        return memo;
    }, {});
}

function getModuleName(fileName){
    return MODULE_REG.exec(fileName)[1];
}

var flattenObject = function(ob) {
    var toReturn = {};

    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) {
            continue;
        }

        if ((typeof ob[i]) === 'object') {
            var flatObject = flattenObject(ob[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) {
                    continue;
                }

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
};

function getStats(json, foundKeys) {
    var jsonFlattened = flattenObject(json);
    var jsonKeys = _.keys(jsonFlattened);
    var obsoletes = _.filter(jsonKeys, function (jk) {
        return !_.contains(foundKeys, jk);
    });
    return {
        used: foundKeys.length,
        new: _.filter(foundKeys, function(fk){ return !_.contains(jsonKeys, fk); }).length,
        obsolete: obsoletes.length,
        empty: _.filter(foundKeys, function(fk) { return !jsonFlattened[fk]; }).length,
        obsoletesList: obsoletes
    };
}


function renderJS(data){
    var contents;

    // Check if already compiled
    if (cache['i18n']) {
        return cache['i18n'](data);
    }

    // Otherwise, read the file, compile and cache
    contents = fs.readFileSync(path.join(templatesDir, 'i18n.js')).toString();
    cache['i18n'] = Handlebars.compile(contents);

    // Call the function again
    return renderJS(data);
}

module.exports = {
    findKeys: findKeys,
    buildRegExp: buildRegExp,
    nestify: nestify,
    getModuleName: getModuleName,
    getStats: getStats,
    renderJS: renderJS,
    flattenObject: flattenObject,
    deleteProperty: deleteProperty,
    assignProperty: assignProperty
};