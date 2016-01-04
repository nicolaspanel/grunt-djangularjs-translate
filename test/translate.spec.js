'use strict';

var expect = require('expect.js');
var rmdir = require('rimraf');
var exec = require('child_process').exec;
var helpers = require('./helpers');
var ncp = require('ncp').ncp;
var assert = require('assert');
var path = require('path');

describe('translate task', function () {
    var execOptions = {
        cwd: path.join(__dirname, '..')
    };
    this.timeout(5000);
    beforeEach(function (done) {
        // duplicate public files
        ncp('test/public', 'public', done);
    });
    afterEach(function (done) {
        // delete public files
        rmdir('public', done);
    });

    describe('with default options', function () {

        beforeEach(function (done) {
            exec('grunt translate:default_options', execOptions, done);
        });

        it('should have generated a json file with EN translations', function () {
            var pathToEN = 'public/i18n/en.json';
            helpers.assertExists(pathToEN);
            var content  = JSON.parse(helpers.readFile(pathToEN).content);
            expect(content).to.eql({
                'YES': 'Yes', // existing in i18n/en.json
                'NO': 'No',   // existing in i18n/en.json
                'ONE_TIME_EXPRESSION':'',
                "LOREM_IPSUM": {
                    "LG": "",
                    "MD": "",
                    "SM": ""
                },
                'COMMENT_SQ': '',
                'COMMENT_DQ': '',
                'SERVICE_SQ': '',
                'SERVICE_DQ': '',
                'SERVICE_INSTANT_SQ': '',
                'SERVICE_INSTANT_DQ': '',
                'NAMESPACED': {
                    'SERVICE_SQ': '',
                    'SERVICE_DQ': '',
                    'DIRECTIVE_INTERPOLATED': '',
                    'DIRECTIVE_STANDALONE': '',
                    'FILTER': '',
                    'EXPRESSION': '',
                    'PLACEHOLDER': ''
                },
                'SERVICE_SQ_{name}': '',
                'SERVICE_DQ_{name}': '',
                'SERVICE_MULT_SQ_SL': '',
                'SERVICE_MULT_DQ_SL': '',
                'SERVICE_MULT_SQ_ML': '',
                'SERVICE_MULT_DQ_ML': '',
                'FILTER_QB_DQ': '',
                'FILTER_QB_SQ': '',
                'FILTER_QB_SQ_{name}': '',
                'FILTER_QB_SQ_{}': '',
                'ONE_TIME_FILTER': '',
                'EXPRESSION_SQ': '',
                'EXPRESSION_QB_SQ_{name}': '',
                'EXPRESSION_QB_SQ_{}': '',
                'DIRECTIVE_INTERPOLATED': '',
                'DIRECTIVE_STANDALONE': '',
                'NESTED_TEXT{:CATEGORY}': '',
                'MY_FORM': {
                    'AVATAR': {
                        'CHANGE_ME': '',
                        'LABEL': ''
                    },
                    'EMAIL': {
                        'LABEL': '',
                        'VISIBLE_LABEL': ''
                    },
                    'PRIVATE_EMAIL{email}': '',
                    'PUBLIC_EMAIL{email}': '',
                    'SAVE_CHANGES': '',
                    'USERNAME': {
                        'LABEL': '',
                        'PLACEHOLDER': '',
                        'REQUIRED': ''
                    },
                    'USER_BLOG': {
                        'BAD_URL_ERROR': '',
                        'LABEL': ''
                    },
                    'USER_DESCRIPTION': {
                        'LABEL': '',
                        'PLACEHOLDER': '',
                        'TOO_LONG_ERROR': ''
                    }
                },
                'MODULE1': {
                    'DESCRIPTION': '',
                    'TITLE': ''
                }

            });
        });

        it('should have generated a js file in new path', function () {
            var jsFile = 'public/i18n/en.js';
            helpers.assertExists(jsFile);
            var expectedContent = '' +
                'angular.module(\'core\')\n' +
                '    .config([\'$translateProvider\', function($translateProvider) {\n' +
                '        $translateProvider.translations(\'en\', translations);\n' +
                '    }]);';
            expect(helpers.readFile(jsFile).content).to.contain(expectedContent);
        });
    });

    describe('with additional FR language options and unsafe mode', function () {
        beforeEach(function (done) {
            exec('grunt translate:en_fr_unsafe', execOptions, done);
        });

        it('should have generated a json file for each language', function () {
            helpers.assertExists('public/i18n/en.json');
            helpers.assertExists('public/i18n/fr.json');
        });

        it('should have generated a json file with EN translations', function () {
            var pathToFR = 'public/i18n/fr.json';
            helpers.assertExists(pathToFR);
            var content  = JSON.parse(helpers.readFile(pathToFR).content);
            expect(content).to.eql({
                'YES': '',
                'NO': '',
                'ONE_TIME_EXPRESSION':'',
                "LOREM_IPSUM": {
                    "LG": "",
                    "MD": "",
                    "SM": ""
                },
                'COMMENT_SQ': '',
                'COMMENT_DQ': '',
                'SERVICE_SQ': '',
                'SERVICE_DQ': '',
                'SERVICE_INSTANT_SQ': '',
                'SERVICE_INSTANT_DQ': '',
                'NAMESPACED': {
                    'SERVICE_SQ': '',
                    'SERVICE_DQ': '',
                    'DIRECTIVE_INTERPOLATED': '',
                    'DIRECTIVE_STANDALONE': '',
                    'FILTER': '',
                    'EXPRESSION': '',
                    'PLACEHOLDER': ''
                },
                'SERVICE_SQ_{name}': '',
                'SERVICE_DQ_{name}': '',
                'SERVICE_MULT_SQ_SL': '',
                'SERVICE_MULT_DQ_SL': '',
                'SERVICE_MULT_SQ_ML': '',
                'SERVICE_MULT_DQ_ML': '',
                'FILTER_QB_DQ': '',
                'FILTER_QB_SQ': '',
                'FILTER_QB_SQ_{name}': '',
                'FILTER_QB_SQ_{}': '',
                'ONE_TIME_FILTER': '',
                'EXPRESSION_SQ': '',
                'EXPRESSION_QB_SQ_{name}': '',
                'EXPRESSION_QB_SQ_{}': '',
                'DIRECTIVE_INTERPOLATED': '',
                'DIRECTIVE_STANDALONE': '',
                'NESTED_TEXT{:CATEGORY}': '',
                'MY_FORM': {
                    'AVATAR': {
                        'CHANGE_ME': '',
                        'LABEL': ''
                    },
                    'EMAIL': {
                        'LABEL': '',
                        'VISIBLE_LABEL': ''
                    },
                    'PRIVATE_EMAIL{email}': '',
                    'PUBLIC_EMAIL{email}': '',
                    'SAVE_CHANGES': '',
                    'USERNAME': {
                        'LABEL': '',
                        'PLACEHOLDER': '',
                        'REQUIRED': ''
                    },
                    'USER_BLOG': {
                        'BAD_URL_ERROR': '',
                        'LABEL': ''
                    },
                    'USER_DESCRIPTION': {
                        'LABEL': '',
                        'PLACEHOLDER': '',
                        'TOO_LONG_ERROR': ''
                    }
                },
                'MODULE1': {
                    'DESCRIPTION': '',
                    'TITLE': ''
                }

            });
        });
    });

    describe('with custom destination options', function () {
        beforeEach(function (done) {
            exec('grunt translate:dest_locales', execOptions, done);
        });
        it('should have generated a json file in new path', function () {
            helpers.assertExists('public/locales/en.json');
            helpers.assertExists('public/locales/en.js');
        });
    });

});
