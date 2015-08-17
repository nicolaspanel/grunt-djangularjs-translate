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
    this.timeout(3000);
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

        it('should have generated a json file for module0', function () {
            var pathToEN = 'public/module0/i18n/en.json';
            helpers.assertExists(pathToEN);
            var content  = JSON.parse(helpers.readFile(pathToEN));
            expect(content).to.eql({
                'YES': '',
                'NO': '',
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
                    'EXPRESSION': ''
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
                }
            });
        });

        it('should have updated json file for module1 and leaved previously declared keys', function () {
            var pathToEN = 'public/module1/i18n/en.json';
            helpers.assertExists(pathToEN);
            var content  = JSON.parse(helpers.readFile(pathToEN));
            expect(content).to.eql({
                'MODULE1': {
                    'DESCRIPTION': '',
                    'TITLE': ''
                },
                'MODULE1_TITLE': 'Some Title'
            });
        });

    });

    describe('with additional FR language options and unsafe mode', function () {
        beforeEach(function (done) {
            exec('grunt translate:en_fr_unsafe', execOptions, done);
        });

        it('should have generated a json file for each module | language', function () {
            helpers.assertExists('public/module0/i18n/en.json');
            helpers.assertExists('public/module0/i18n/fr.json');
            helpers.assertExists('public/module1/i18n/en.json');
            helpers.assertExists('public/module1/i18n/fr.json');
        });
    });

    describe('with custom destination options', function () {
        beforeEach(function (done) {
            exec('grunt translate:dest_locales', execOptions, done);
        });
        it('should have generated a json file in new path', function () {
            helpers.assertExists('public/module0/locales/en.json');
        });
    });

});
