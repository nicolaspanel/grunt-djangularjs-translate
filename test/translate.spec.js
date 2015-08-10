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
                'MODULE0_COMMENT_SQ': '',
                'MODULE0_COMMENT_DQ': '',
                'MODULE0_SERVICE_SQ': '',
                'MODULE0_SERVICE_DQ': '',
                'MODULE0_SERVICE_INSTANT_SQ': '',
                'MODULE0_SERVICE_INSTANT_DQ': '',
                'NAMESPACED': {
                    'MODULE0_SERVICE_SQ': '',
                    'MODULE0_SERVICE_DQ': '',
                    'MODULE0_DIRECTIVE_INTERPOLATED': '',
                    'MODULE0_DIRECTIVE_STANDALONE': ''
                },
                'MODULE0_SERVICE_SQ_{name}': '',
                'MODULE0_SERVICE_DQ_{name}': '',
                'MODULE0_SERVICE_MULT_SQ_SL': '',
                'MODULE0_SERVICE_MULT_DQ_SL': '',
                'MODULE0_SERVICE_MULT_SQ_ML': '',
                'MODULE0_SERVICE_MULT_DQ_ML': '',
                'MODULE0_FILTER_QB_DQ': '',
                'MODULE0_FILTER_QB_SQ': '',
                'MODULE0_FILTER_QB_SQ_{name}': '',
                'MODULE0_FILTER_QB_SQ_{}': '',
                'MODULE0_EXPRESSION_SQ': '',
                'MODULE0_EXPRESSION_QB_SQ_{name}': '',
                'MODULE0_EXPRESSION_QB_SQ_{}': '',
                'MODULE0_DIRECTIVE_INTERPOLATED': '',
                'MODULE0_DIRECTIVE_STANDALONE': ''
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
