'use strict';

var lib = require('../src');
var helpers = require('./helpers');
var expect = require('expect.js');

describe('lib', function () {

    describe('translations finder', function(){
       it('can find commented translations', function () {
           var content = helpers.readFile('test/public/module0/module0.module.js');

           var translations = lib.findTranslations(content);
           expect(translations).to.contain('MODULE0_COMMENT_SQ');
           expect(translations).to.contain('MODULE0_COMMENT_DQ');
       });

       it('can find service with single translations', function () {
           var content = helpers.readFile('test/public/module0/module0.module.js');

           var translations = lib.findTranslations(content);
           expect(translations).to.contain('MODULE0_SERVICE_SQ');
           expect(translations).to.contain('MODULE0_SERVICE_DQ');
           expect(translations).to.contain('MODULE0_SERVICE_INSTANT_SQ');
           expect(translations).to.contain('MODULE0_SERVICE_INSTANT_DQ');
           expect(translations).to.contain('MODULE0_SERVICE_SQ_{name}');
           expect(translations).to.contain('MODULE0_SERVICE_DQ_{name}');
           expect(translations).to.contain('NAMESPACED.MODULE0_SERVICE_DQ');
           expect(translations).to.contain('NAMESPACED.MODULE0_SERVICE_DQ');
       });

       it('can find service with multiple translations in single line', function () {
           var content = helpers.readFile('test/public/module0/module0.module.js');

           var translations = lib.findTranslations(content);
           expect(translations).to.contain('MODULE0_SERVICE_MULT_SQ_SL');
           expect(translations).to.contain('MODULE0_SERVICE_MULT_DQ_SL');
       });

       it('can find service with multiple translations in multiple lines', function () {
           var content = helpers.readFile('test/public/module0/module0.module.js');

           var translations = lib.findTranslations(content);
           expect(translations).to.contain('MODULE0_SERVICE_MULT_SQ_ML');
           expect(translations).to.contain('MODULE0_SERVICE_MULT_DQ_ML');
       });

       it('can find filter inside curly-brackets', function () {
           var content = helpers.readFile('test/public/module0/views/index.html');

           var translations = lib.findTranslations(content);
           expect(translations).to.contain('MODULE0_FILTER_QB_DQ');
           expect(translations).to.contain('MODULE0_FILTER_QB_SQ');
           expect(translations).to.contain('MODULE0_FILTER_QB_SQ_{name}');
           expect(translations).to.contain('MODULE0_FILTER_QB_SQ_{}');
       });

       it('can find filter inside an expression', function () {
           var content = helpers.readFile('test/public/module0/views/index.html');

           var translations = lib.findTranslations(content);
           expect(translations).to.contain('MODULE0_EXPRESSION_SQ');
           expect(translations).to.contain('MODULE0_EXPRESSION_QB_SQ_{name}');
           expect(translations).to.contain('MODULE0_EXPRESSION_QB_SQ_{}');
       });

       it('can find from interpolated directive', function () {
           var content = helpers.readFile('test/public/module0/views/index.html');

           var translations = lib.findTranslations(content);
           expect(translations).to.contain('MODULE0_DIRECTIVE_INTERPOLATED');
           expect(translations).to.contain('NAMESPACED.MODULE0_DIRECTIVE_INTERPOLATED');
       });

       it('can find from standalone directive', function () {
           var content = helpers.readFile('test/public/module0/views/index.html');

           var translations = lib.findTranslations(content);
           expect(translations).to.contain('MODULE0_DIRECTIVE_STANDALONE');
           expect(translations).to.contain('NAMESPACED.MODULE0_DIRECTIVE_STANDALONE');
       });
    });

    describe('nestifycation', function(){
        it('should group translations into a nested object', function () {
            expect(lib.nestify(['a', 'b', 'c.a', 'c.b'], '')).to.eql({
                a: '',
                b: '',
                c: {
                    a: '',
                    b: ''
                }
            });
        });

    });

    describe('module name extraction', function () {
        it('should work if file at the root of the module', function () {
            expect(lib.getModuleName('public/module0/my-file.js')).to.equal('module0');
        });
        it('should work if file in a sub-folder of the module', function () {
            expect(lib.getModuleName('public/module0/views/index.html')).to.equal('module0');
        });
    });

    describe('stats', function () {
        it('should compute stats based on existing and newly found translations', function(){
            var json = {a: '', b: 'b', c: {b: 'b', c: '', d: ''}};
            var foundKeys = ['b', 'c.a', 'c.b', 'c.c', 'd' ];

            expect(lib.getStats(json, foundKeys)).to.eql({
                used: foundKeys.length,
                new: 2, // c.a, d
                obsolete: 2, // a, c.d
                empty: 3, // c.a, c.c, d
                obsoletesList: ['a', 'c.d']
            });
        });
    });

});