'use strict';

module.exports = function (grunt) {

    var utils = require('./utils');
    var format = require('string-format');
    var stringify = require('stringify-object');
    var _ = require('lodash');
    var Q = require('q');
    var inquirer = require('inquirer');

    function askUserWhichKeysToDiscard(choices) {
        var deferred = Q.defer();
        inquirer.prompt([{
            name: 'discardedKeys',
            message: format('Following keys seem to be obsolete. Select the ones you want to discard'),
            default: choices,
            type: "checkbox",
            choices: choices
        }], function (answers) {
            deferred.resolve(answers.discardedKeys);
        });

        return deferred.promise;
    }

    function processTranslations(options) {

        var files = grunt.file.expand(options.src);

        if (_.isEmpty(files)){
            grunt.fail.fatal('No file found. Make sure `src` option is properly defined.');
        }

        else if (_.isEmpty(options.lang)){
            grunt.fail.fatal('Require at least 1 language. Make sure `lang` option is properly defined.');
        }

        var existingTranslations = _
            .reduce(options.lang, function (memo, lang) {
                var pathToJsonFile = format('public/{}/{}.json', options.dest, lang);
                if (grunt.file.exists(pathToJsonFile)){
                    memo[lang] = grunt.file.readJSON(pathToJsonFile);
                }
                return memo;
            }, {});

        var foundKeys =  _
            .reduce(files, function (memo, file) {
                return _.union(memo, utils.findKeys({content: grunt.file.read(file), path: file}));
            }, []);

        var allKeys = _
            .reduce(options.lang, function (keys, lang) {
                return _.union(keys, _.keys(utils.flattenObject(existingTranslations[lang])));
            }, foundKeys);

        return new Q()
            .then(function () {
                // check for hidden keys
                var unusedKeys = _.difference(allKeys, foundKeys);
                if (_.isEmpty(unusedKeys)){
                    return [];
                }
                else {
                    return askUserWhichKeysToDiscard(unusedKeys);
                }
            })
            .then(function (discardedKeys) {
                // TODO: discard keys
                discardedKeys.forEach(function (key) {
                    options.lang.forEach(function (lang) {
                        utils.deleteProperty(existingTranslations[lang], key);
                    });
                });
                allKeys = _.difference(allKeys, discardedKeys);
            })
            .then(function () {
                var hiddenKeys = _.filter(allKeys, function (key) {
                    return _
                        .chain(allKeys)
                        .without(key)
                        .any(function (otherKey) { return otherKey.indexOf(key + '.') === 0; /* start with */ })
                        .value();
                });

                if (!_.isEmpty(hiddenKeys)) {
                    var keys = hiddenKeys.join(', ');
                    if (hiddenKeys.length === 1){
                        grunt.fail.warn(format('Following key is not accessible due to namespace usage: {}', keys));
                    }
                    else {
                        grunt.fail.warn(format('Following keys are not accessible due to namespace usage: {}', keys));
                    }
                }
            })
            .then(function () {
                var stats = _
                    .chain(options.lang)
                    .map(function (lang) {
                        var newTranslations;

                        var pathToJsonFile = format('public/{}/{}.json', options.dest, lang);
                        var pathToJSFile = format('public/{}/{}.js', options.dest, lang);

                        newTranslations = _.merge({}, utils.nestify(foundKeys), existingTranslations[lang]);

                        grunt.file.write(pathToJsonFile, JSON.stringify(newTranslations, null, 4));
                        grunt.file.write(pathToJSFile, utils.renderJS({
                            moduleName: options.moduleName,
                            lang: lang,
                            translations: newTranslations
                        }));
                        return [lang, utils.getStats(existingTranslations[lang], foundKeys)];
                    })
                    .zipObject()
                    .value();

                if (options.displayStats){
                    var Table = require('cli-table');
                    var statsTable = new Table({
                        head: ['lang', 'Used', 'New', 'Obsolete', 'Empty'],
                        style: {compact: true}
                    });

                        _.forEach(options.lang, function (lang, i) {
                            var stat = stats[lang];
                            statsTable.push([lang, stat.used, stat.new, stat.obsolete, stat.empty]);

                            if (i < options.lang.length - 1){
                                statsTable.push([]);
                            }
                        });
                    
                    grunt.log.ok('Statistics');
                    grunt.log.writeln(statsTable.toString());
                }
            });
    }

    grunt.registerMultiTask('translate', 'Generate translations for djangularjs projects', function () {
        var options = _.extend({
            src: [
                "public/*[!_]*/*.js",
                "public/*[!_]*/*[!tests]*/*.js",
                "public/*[!_]*/*[!tests]*/*.html"
            ],
            lang: ['en'],
            dest: 'i18n',
            displayStats: true,
            moduleName: 'core'
        }, this.options() || {}, this.data || {});

        return new Q(processTranslations(options))
            .done(this.async());
    });
};
