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
            dest: 'i18n',
            displayStats: true
        }, this.data || {});

        var files = grunt.file.expand(options.src);

        if (_.isEmpty(files)){
            grunt.fail.fatal('No file found. Make sure `src` option is properly defined.');
        }

        var report = _.chain(files)
            .reduce(function (memo, file) {
                var moduleName = lib.getModuleName(file);
                memo[moduleName] = (memo[moduleName] || []).concat(lib.findTranslations({content: grunt.file.read(file), path: file}));
                return memo;
            }, {})
            .pairs()
            .reduce(function (memo, pair) {
                // create pairs for each language
                var moduleName = pair[0], foundKeys = pair[1];

                foundKeys = _.uniq(foundKeys);

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
                    grunt.fail.warn('Following keys are hidden by namespace usage' + hidden.join(', '));
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
                grunt.log.debug(format('Save translations for module "{}" and language "{}"', moduleName, lang));
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

        if (options.displayStats){
            var Table = require('cli-table');
            var statsTable = new Table({
                head: ['Module', 'lang', 'Used', 'New', 'Obsolete', 'Empty'],
                style: {compact: true}
            });
            var modules = _.keys(report);
            _.forEach(modules, function (module, i) {
                var languages = report[module];
                _.forEach(options.lang, function (lang) {
                    var stat = languages[lang];
                    statsTable.push([module, lang, stat.used, stat.new, stat.obsolete, stat.empty]);
                });
                if (i < modules.length - 1){
                    statsTable.push([]);
                }
            });
            grunt.log.ok('Statistics');
            grunt.log.writeln(statsTable.toString());
        }

    });
};
