Grunt tasks to automatically extract translations from your [djangularjs](https://github.com/nicolaspanel/djangularjs) project

##Status

__Stable__

[![Build Status](https://travis-ci.org/nicolaspanel/grunt-djangularjs-translate.png)](https://travis-ci.org/nicolaspanel/grunt-djangularjs-translate)


## Getting Started

`npm install grunt-djangularjs-translate`

__NOTE__: This extraction tool is made to work with the [djangularjs](https://github.com/nicolaspanel/djangularjs) framework.

## Example
The configuration below generates 2 translation files:
 - `public/i18n/en.js`
 - `public/i18n/fr.js` file


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
                lang: ['en', 'fr'],
                dest: 'i18n',
                moduleName: 'core'
            }
        },
        // ...
    });
}
```

```js
// public/i18n/en.js
angular
    .module('core')
    .config(['$translateProvider', function($translateProvider) {
        $translateProvider.translations('en', {
            key1: 'trans1-en',
            // ...
        });
    }]);

```

```js
// public/i18n/fr.js
angular
    .module('core')
    .config(['$translateProvider', function($translateProvider) {
        $translateProvider.translations('fr', {
            key1: 'trans1-fr',
            // ...
        });
    }]);

```


### Options

- [src](#src)
- [lang](#lang)
- [dest](#dest)
- [moduleName](#modulename)

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

Name of the translations folder.

Type: `String`

Default:  `'i18n'`


#### moduleName

Name of the angular module `mainModule`.

Type: `String`

Default:  `'core'`



## Test

You will find the tests files into `test` directory.

To run test use `grunt test`


# Credits

Inspired from [grunt-angular-translate](https://github.com/angular-translate/grunt-angular-translate).

## License

The MIT License (MIT)

Copyright (c) 2015-2016 Nicolas Panel
