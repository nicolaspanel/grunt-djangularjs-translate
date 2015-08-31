'use strict';

/***
 NOTE: This file as been generated automatically by grunt-djangularjs-translate
       Do NOT update it manually, use `grunt translate` command instead
***/
(function () {

var translations = {{{json translations}}};

angular.module('{{moduleName}}')
    .config(['$translateProvider', function($translateProvider) {
        $translateProvider.translations('{{lang}}', translations);
}]);
})();

