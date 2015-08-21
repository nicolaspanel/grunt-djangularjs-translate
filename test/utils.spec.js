'use strict';

var utils = require('../tasks/utils');
var helpers = require('./helpers');
var expect = require('expect.js');

describe('utils', function () {

    describe('translations finder', function(){
       it('can find commented translations', function () {
           var content = helpers.readFile('test/public/module0/module0.module.js');

           var translations = utils.findKeys(content);
           expect(translations).to.contain('COMMENT_SQ');
           expect(translations).to.contain('COMMENT_DQ');
       });

       it('can find service with single translations', function () {
           var content = helpers.readFile('test/public/module0/module0.module.js');

           var translations = utils.findKeys(content);
           expect(translations).to.contain('SERVICE_SQ');
           expect(translations).to.contain('SERVICE_DQ');
           expect(translations).to.contain('SERVICE_INSTANT_SQ');
           expect(translations).to.contain('SERVICE_INSTANT_DQ');
           expect(translations).to.contain('SERVICE_SQ_{name}');
           expect(translations).to.contain('SERVICE_DQ_{name}');
           expect(translations).to.contain('NAMESPACED.SERVICE_DQ');
           expect(translations).to.contain('NAMESPACED.SERVICE_DQ');
       });

       it('can find service with multiple translations in single line', function () {
           var content = helpers.readFile('test/public/module0/module0.module.js');

           var translations = utils.findKeys(content);
           expect(translations).to.contain('SERVICE_MULT_SQ_SL');
           expect(translations).to.contain('SERVICE_MULT_DQ_SL');
       });

       it('can find service with multiple translations in multiple lines', function () {
           var content = helpers.readFile('test/public/module0/module0.module.js');

           var translations = utils.findKeys(content);
           expect(translations).to.contain('SERVICE_MULT_SQ_ML');
           expect(translations).to.contain('SERVICE_MULT_DQ_ML');
       });

       it('can find filter inside curly-brackets', function () {
           var content = helpers.readFile('test/public/module0/views/filters.html');

           expect(utils.findKeys(content)).to.eql([
               'FILTER_QB_DQ',
               'FILTER_QB_SQ',
               'FILTER_QB_SQ_{name}',
               'FILTER_QB_SQ_{}',
               'NAMESPACED.FILTER',
               'ONE_TIME_FILTER',
               'NAMESPACED.PLACEHOLDER'
           ]);
       });

       it('can find filter inside an expression', function () {
           var content = helpers.readFile('test/public/module0/views/expressions.html');
           expect(utils.findKeys(content)).to.eql([
               'EXPRESSION_SQ',
               'EXPRESSION_QB_SQ_{name}',
               'EXPRESSION_QB_SQ_{}',
               'NAMESPACED.EXPRESSION',
               'ONE_TIME_EXPRESSION'
           ]);
       });

       it('can find from interpolated directive', function () {
           var content = helpers.readFile('test/public/module0/views/interpolations.html');
           expect(utils.findKeys(content)).to.eql(['DIRECTIVE_INTERPOLATED',
                                                         'NAMESPACED.DIRECTIVE_INTERPOLATED']);
       });

       it('can find from standalone directive', function () {
           var content = helpers.readFile('test/public/module0/views/directives.html');

           expect(utils.findKeys(content)).to.eql(['DIRECTIVE_STANDALONE',
                                                         'NAMESPACED.DIRECTIVE_STANDALONE']);
       });
    });

    describe('nestifycation', function(){
        it('should group translations into a nested object', function () {
            expect(utils.nestify(['a', 'b', 'c.a', 'c.b'], '')).to.eql({
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
            expect(utils.getModuleName('public/module0/my-file.js')).to.equal('module0');
        });
        it('should work if file in a sub-folder of the module', function () {
            expect(utils.getModuleName('public/module0/views/index.html')).to.equal('module0');
        });
    });

    describe('stats', function () {
        it('should compute stats based on existing and newly found translations', function(){
            var json = {a: '', b: 'b', c: {b: 'b', c: '', d: ''}};
            var foundKeys = ['b', 'c.a', 'c.b', 'c.c', 'd' ];

            expect(utils.getStats(json, foundKeys)).to.eql({
                used: foundKeys.length,
                new: 2, // c.a, d
                obsolete: 2, // a, c.d
                empty: 3, // c.a, c.c, d
                obsoletesList: ['a', 'c.d']
            });
        });
    });

    describe('delete property', function () {
        it('should delete the property if it exists', function () {
            var obj = {foo: {bar: '123'}};
            expect(obj.foo).to.have.key('bar');
            utils.deleteProperty(obj, 'foo.bar');
            expect(obj.foo).to.not.have.key('bar');
        });
        it('should fail silently if property it do not exists', function () {
            var obj = {foo: {foo: '123'}};
            expect(obj.foo).to.not.have.key('bar');
            utils.deleteProperty(obj, 'foo.bar');
            expect(obj.foo).to.not.have.key('bar');
        });
    });

    describe('assign property', function () {
        it('should assign the property if it exists', function () {
            var obj = {foo: {bar: '123'}};
            expect(obj.foo).to.have.key('bar');
            utils.assignProperty(obj, 'foo.bar', '234');
            expect(obj.foo.bar).to.equal('234');
        });

        it('should assign property it do not exists', function () {
            var obj = {foo: {foo: '123'}};
            expect(obj.foo).to.not.have.key('bar');
            utils.assignProperty(obj, 'foo.bar', '234');
            expect(obj.foo).to.have.key('bar');
            expect(obj.foo.bar).to.equal('234');
        });
    });

});