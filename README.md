Grunt tasks to automatically extract translations from your [djangularjs](https://github.com/nicolaspanel/djangularjs) project

##Status

Under active development

[![Build Status](https://travis-ci.org/nicolaspanel/grunt-djangularjs-translate.png)](https://travis-ci.org/nicolaspanel/grunt-djangularjs-translate)


## Getting Started

`npm install grunt-djangularjs-translate`

__NOTE__: This extraction tool is made to work with the [djangularjs][https://github.com/nicolaspanel/djangularjs] framework

## Default configuration

```js
// gruntfile.js 
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        // ...
        translate: {
            all: {
                src: [
                    "public/*[!_]*/*.js",
                    "public/*[!_]*/*[!tests]*/*.js",
                    "public/*[!_]*/*[!tests]*/*.html"
                ],
                lang: ['en'],
                dest: 'i18n',
                mainModule: 'core',
                moduleNamePrefix: ''
            }
        },
        // ...
    });
}
```

### Options

- [src](#src)
- [lang](#lang)
- [dest](#dest)
- [mainModule](#mainModule)
- [moduleNamePrefix](#moduleNamePrefix)

#### src

List files containing the translations.

Type: `Array`

Default: 
```
[
  "public/*[!_]*/*.js",
  "public/*[!_]*/*[!tests]*/*.js",
  "public/*[!_]*/*[!tests]*/*.html
]
```


#### lang

Define used languages.

Type: `Array`

Default: `['en']`


#### dest

Name of the output folder.

Type: `String`

Default:  `i18n`


#### mainModule

Translations found in multiple modules will be moved into `mainModule`.

Type: `String`

Default:  `core`

#### moduleNamePrefix

Prepend module name with given prefix

Type: `String`

Default:  `''` (no prefix)

__Example__:
Configuration below
```js
// gruntfile.js example
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        // ...
        translate: {
            all: {
                moduleNamePrefix: 'my-app.'
            }
        },
        // ...
    });
}
```

will generate following translation files:
```js
// public/<module-name>/i18n/<lang>.js
...
angular.module('my-app.<module-name>')
    .config(['$translateProvider', function($translateProvider) {
        $translateProvider.translations('<lang>', translations);
    }]);
...
```


## Test

You will find the tests files into `test` directory.

To run test use `grunt test`


# Credits

Inspired from [grunt-angular-translate](https://github.com/angular-translate/grunt-angular-translate).

## License

The MIT License (MIT)

Copyright (c) 2015 Nicolas Panel
