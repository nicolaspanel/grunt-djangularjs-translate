'use strict';

module.exports = function (grunt) {

    var lib = require('../src');
    var format = require('string-format');
    var stringify = require('stringify-object');
    var _ = require('lodash');

    grunt.registerMultiTask('translate', 'Generate translations for djangularjs projects', function () {

        var options = _.extend({
            src: [
                "public/*[!_]*/*.js",
                "public/*[!_]*/*[!tests]*/*.js",
                "public/*[!_]*/*[!tests]*/*.html"
            ],
            lang: ['en'],
            dest: 'i18n'
        }, this.data || {});

        var files = grunt.file.expand(options.src);

        if (_.isEmpty(files)){
            grunt.fail.fatal('No file found. Make sure `src` option is properly defined.');
        }

        var stats = _.chain(files)
            .reduce(function (memo, file) {
                var moduleName = lib.getModuleName(file);
                memo[moduleName] = (memo[moduleName] || []).concat(lib.findTranslations(grunt.file.read(file)));
                return memo;
            }, {})
            .pairs()
            .reduce(function (memo, pair) {
                // create pairs for each language
                var moduleName = pair[0], foundKeys = pair[1];

                grunt.log.ok('check keys');
                foundKeys = _.uniq(foundKeys);

                if (options.safe) {
                    var hidden = _
                        .filter(foundKeys, function (key, i) {
                            return _.chain(foundKeys)
                                .without(key)
                                .any(function (otherKey) {
                                    return otherKey.indexOf(key + '.') === 0; // start with
                                })
                                .value();
                        });
                    if (!_.isEmpty(hidden)) {
                        grunt.fail.warn('Following keys are hidden by one ore more namespace(s): ' + hidden.join(', '));
                    }
                    grunt.log.ok('Keys are ok');
                }

                return memo.concat(_.map(options.lang, function (lang) { return [moduleName, foundKeys, lang];  }));
            }, [])
            .map(function (pair) {
                var moduleName = pair[0], foundKeys = pair[1], lang = pair[2],
                    jsonTranslations, newTranslations;

                var pathToJsonFile = format('public/{}/{}/{}.json', moduleName, options.dest, lang);
                var pathToJSFile = format('public/{}/{}/{}.js', moduleName, options.dest, lang);
                if (grunt.file.exists(pathToJsonFile)){
                    jsonTranslations = grunt.file.readJSON(pathToJsonFile);
                }
                else {
                    jsonTranslations = {};
                }

                newTranslations = _.merge({}, lib.nestify(foundKeys), jsonTranslations);
                grunt.log.ok(format('Save translations for module "{}" and language "{}"', moduleName, lang));
                grunt.file.write(pathToJsonFile, JSON.stringify(newTranslations, null, 4));
                grunt.file.write(pathToJSFile, lib.renderJS({
                    moduleName: moduleName,
                    lang: lang,
                    translations: newTranslations
                }));
                return [moduleName, lib.getStats(jsonTranslations, foundKeys), lang];
            })
            .reduce(function (memo, pair) {
                var moduleName = pair[0], stats = pair[1], lang = pair[2];
                memo[moduleName] = memo[moduleName] || {};
                memo[moduleName][lang] = stats;
                return memo;
            }, {})
            .value();
        grunt.log.writeln('Statistics: ' + stringify(stats, {indent: '    '}));

    });
};
