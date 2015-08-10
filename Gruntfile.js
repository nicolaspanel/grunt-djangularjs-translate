/**
 * grunt-djangularjs-translate
 * https://github.com/nicolaspanel/grunt-djangularjs-translate
 *
 * Copyright (c) 2013 "firehist" Benjamin Longearet, contributors
 * Copyright (c) 2015 Nicolas Panel, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/**/*.js',
                'src/**/*.js',
                'test/*[!public]*/*.js',
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        translate: {
            // Provide fr_FR language
            default_options: {},
            en_fr_unsafe: {
                lang: ['en', 'fr']
            },
            dest_locales: {
                dest: 'locales'
            }
        },
        simplemocha: {
            options: {
                reporter: 'dot',
                timeout: '5000'
            },
            all: {
                src: ['test/**/*.spec.js']
            }
        }

    });

    grunt.loadTasks('tasks');

    // By default, lint and run all tests.
    grunt.registerTask('test', ['jshint', 'simplemocha']);
    grunt.registerTask('default', ['test']);

};