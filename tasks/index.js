'use strict';

module.exports = function (grunt) {

    var utils = require('./utils');
    var format = require('string-format');
    var stringify = require('stringify-object');
    var _ = require('lodash');
    var Q = require('q');
    var inquirer = require('inquirer');

    function askUserWhichTranslationToUse(key, choices, lang) {
        var deferred = Q.defer();
        inquirer.prompt([{
            name: 'duplicatedKey',
            message: format('Multiple definitions found for key "{}" and language "{}". Select the one you want to keep', key, lang),
            default: choices[0],
            type: 'list',
            choices: choices
        }], function (answers) {
            deferred.resolve(answers.duplicatedKey);
        });

        return deferred.promise;
    }

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

        var allModules = _
            .chain(files)
            .map(utils.getModuleName)
            .uniq()
            .value();

        var existingTranslations = _
            .chain(allModules)
            .reduce(function (memo, moduleName) {
                // create pairs for each language
                return memo.concat(_.map(options.lang, function (lang) { return [moduleName, lang];  }));
            }, [])
            .reduce(function (memo, pair) {
                var moduleName = pair[0], lang = pair[1];

                memo[moduleName] = memo[moduleName] || {};
                memo[moduleName][lang] =  {};

                var pathToJsonFile = format('public/{}/{}/{}.json', moduleName, options.dest, lang);
                if (grunt.file.exists(pathToJsonFile)){
                    memo[moduleName][lang] = grunt.file.readJSON(pathToJsonFile);
                }
                return memo;
            }, {})
            .value();


        var perModuleFoundKeys =  _
            .reduce(files, function (memo, file) {
                var moduleName = utils.getModuleName(file);
                memo[moduleName] = _.union(memo[moduleName] || [], utils.findKeys({content: grunt.file.read(file), path: file}));
                return memo;
            }, {});

        var perModuleAllKeys = _
            .reduce(allModules, function (memo, moduleName) {
                memo[moduleName] =  _
                    .reduce(options.lang, function (keys, lang) {
                        return _.union(keys, _.keys(utils.flattenObject(existingTranslations[moduleName][lang])));
                    }, perModuleFoundKeys[moduleName]);
                return memo;
            }, {});

        var foundKeys =  _
            .chain(perModuleFoundKeys)
            .values()
            .reduce(function (memo, keys) { return _.union(memo, keys); }, [])
            .value();

        // check for hidden keys
        var allKeys = _
            .chain(perModuleAllKeys)
            .values()
            .reduce(function (memo, keys) { return _.union(memo, keys); }, [])
            .value();

        var unusedKeys = _.difference(allKeys, foundKeys);

        return new Q()
            .then(function () {
                if (_.isEmpty(unusedKeys)){
                    return [];
                }
                else {
                    return askUserWhichKeysToDiscard(unusedKeys);
                }
            })
            .then(function (discardedKeys) {
                // TODO: discard keys
                allModules.forEach(function (moduleName) {
                    perModuleFoundKeys[moduleName] = _.difference(perModuleFoundKeys[moduleName], discardedKeys);
                    perModuleAllKeys[moduleName] = _.difference(perModuleFoundKeys[moduleName], discardedKeys);
                    discardedKeys.forEach(function (key) {
                        options.lang.forEach(function (lang) {
                            utils.deleteProperty(existingTranslations[moduleName][lang], key);
                        });
                    });
                });
                allKeys = _.difference(allKeys, discardedKeys);
                foundKeys = _.difference(allKeys, foundKeys);
            })
            .then(function () {
                var hiddenKeys = _.filter(allKeys, function (key) {
                    return _
                        .chain(allKeys)
                        .without(key)
                        .any(function (otherKey) {
                            return otherKey.indexOf(key + '.') === 0; // start with
                        })
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
                    throw new Error();
                }
            })
            .then(function () {
                var doneAsking = new Q();

                // list keys used in multiple modules
                var duplicatedKeys = _
                    .chain(allKeys)
                    .map(function (key) {
                        return {
                            modules: _.filter(allModules, function (moduleName) {
                                return _.contains(perModuleAllKeys[moduleName], key);
                            }),
                            key: key
                        };
                    })
                    .filter(function (item) {
                        return item.modules.length > 1;
                    })
                    .value();

                // move duplicates to mainModule
                _.chain(duplicatedKeys)
                    .reduce(function (memo, item) {
                        return memo.concat(_.map(item.modules, function (moduleName) { return {module: moduleName, key: item.key};  }));
                    }, [])
                    .groupBy(function (item) { return item.module; })
                    .mapValues(function (items) {
                        return _.pluck(items, 'key');
                    })
                    .pairs()
                    .forEach(function (pair) {
                        var moduleName = pair[0], keys = pair[1];
                        // rm keys from module
                        if (moduleName !== options.mainModule) {
                            perModuleFoundKeys[moduleName] = _.difference(perModuleFoundKeys[moduleName], keys);
                        }
                        // add keys to `mainModule`
                        perModuleFoundKeys[options.mainModule] = _.union(perModuleFoundKeys[options.mainModule] || [], keys);
                    });

                var flattenedTranslations = utils.flattenObject(existingTranslations);

                _.forEach(duplicatedKeys, function (item) {
                    _.forEach(options.lang, function (lang) {
                        var foundTranslations = _
                            .chain(item.modules)
                            .reduce(function (memo, moduleName) {
                                var keyPath = format('{}.{}.{}', moduleName, lang, item.key);
                                if (_.has(flattenedTranslations, keyPath) && !_.isEmpty(flattenedTranslations[keyPath])){
                                    memo.push(flattenedTranslations[keyPath]);
                                }
                                return memo;
                            }, [])
                            .uniq()
                            .value();

                        // rm this translations since the have moved to mainModule
                        _.forEach(item.modules, function(moduleName){
                            utils.deleteProperty(existingTranslations[moduleName][lang], item.key);
                        });

                        if (foundTranslations.length <= 1){
                            utils.assignProperty(existingTranslations[options.mainModule][lang], item.key, foundTranslations[0] || '');
                        }
                        else {
                            // ask user witch translation should be used
                            doneAsking = doneAsking
                                .then(function () {
                                    return askUserWhichTranslationToUse(item.key, foundTranslations, lang);
                                })
                                .then(function (keeped) {
                                    utils.assignProperty(existingTranslations[options.mainModule][lang], item.key, keeped);
                                });
                        }
                    });
                });
                return doneAsking;
            })
            .then(function () {
                var report = _
                    .chain(perModuleFoundKeys)
                    .pairs()
                    .reduce(function (memo, pair) {
                        // create pairs for each language
                        var moduleName = pair[0], foundKeys = pair[1];
                        return memo.concat(_.map(options.lang, function (lang) { return [moduleName, foundKeys, lang];  }));
                    }, [])
                    .map(function (pair) {
                        var moduleName = pair[0], foundKeys = pair[1], lang = pair[2], newTranslations;

                        var pathToJsonFile = format('public/{}/{}/{}.json', moduleName, options.dest, lang);
                        var pathToJSFile = format('public/{}/{}/{}.js', moduleName, options.dest, lang);

                        newTranslations = _.merge({}, utils.nestify(foundKeys), existingTranslations[moduleName][lang]);
                        grunt.file.write(pathToJsonFile, JSON.stringify(newTranslations, null, 4));
                        grunt.file.write(pathToJSFile, utils.renderJS({
                            moduleName: moduleName,
                            lang: lang,
                            translations: newTranslations,
                            moduleNamePrefix: options.moduleNamePrefix || ''
                        }));
                        return [moduleName, utils.getStats(existingTranslations[moduleName][lang], foundKeys), lang];
                    })
                    .reduce(function (memo, pair) {
                        var moduleName = pair[0], stats = pair[1], lang = pair[2];
                        memo[moduleName] = memo[moduleName] || {};
                        memo[moduleName][lang] = memo[moduleName].__stats = stats;
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
            mainModule: 'core',
            moduleNamePrefix: ''
        }, this.options() || {}, this.data || {});
        return new Q(processTranslations(options)).done(this.async());
    });
};
