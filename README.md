# grunt-djangularjs-translate

Grunt tasks to automatically extract translations from your [djangularjs](https://github.com/nicolaspanel/djangularjs) project

##Status

Under active development

[![NPM](https://nodei.co/npm/grunt-djangularjs-translate.png)](https://nodei.co/npm/grunt-djangularjs-translate/)

## Getting Started

`npm install grunt-djangularjs-translate`

__NOTE__: This extraction tool is made to work with the [djangularjs][https://github.com/nicolaspanel/djangularjs] framework

## Default configuration

```js
// gruntfile.js example
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
                dest: 'i18n'
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

#### src

Type: `Array`

Default: 
```
[
  "public/*[!_]*/*.js",
  "public/*[!_]*/*[!tests]*/*.js",
  "public/*[!_]*/*[!tests]*/*.html
]
```


List files containing the translations.


#### lang

Type: `Array`

Default: `['en']`


Define used languages.

#### dest

Type: `String`

Default:  `i18n`

Name of the output folder.


## Test

You will find the tests files into `test` directory.

To run test use `grunt test`


# Credits

Inspired from [grunt-angular-translate](https://github.com/angular-translate/grunt-angular-translate).

## License

The MIT License (MIT)

Copyright (c) 2015 Nicolas Panel
