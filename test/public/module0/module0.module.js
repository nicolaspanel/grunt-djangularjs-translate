'use strict';

ApplicationConfiguration.registerModule('module0')
    .config(function($stateProvider){
        $stateProvider
            .state('home', {  // main page once logged in
                url: '/',
                resolve: {
                    trans1: function ($translate) {return $translate('MODULE0_SERVICE_SQ'); },
                    trans2: function ($translate) {return $translate("MODULE0_SERVICE_DQ"); },
                    trans3: function ($translate) {return $translate.instant('MODULE0_SERVICE_INSTANT_SQ'); },
                    trans4: function ($translate) {return $translate.instant("MODULE0_SERVICE_INSTANT_DQ"); },
                    trans5: function ($translate) {return $translate('NAMESPACED.MODULE0_SERVICE_SQ'); },
                    trans6: function ($translate) {return $translate("NAMESPACED.MODULE0_SERVICE_DQ"); }
                },
                data: {
                    pageTitleSimple: /* translate */'MODULE0_COMMENT_SQ',
                    pageTitleDouble: /* translate */"MODULE0_COMMENT_DQ"
                }
            });
    })
    .factory('someService', function ($translate) {
        $translate('MODULE0_SERVICE_SQ_{name}', {name: 'name'}).then(function (module0Js03) {});
        $translate("MODULE0_SERVICE_DQ_{name}", {name: 'name'}).then(function (module0Js04) {});

        $translate(['MODULE0_SERVICE_MULT_SQ_SL', "MODULE0_SERVICE_MULT_DQ_SL"]).then(function () {});
        $translate([
            'MODULE0_SERVICE_MULT_SQ_ML',
            "MODULE0_SERVICE_MULT_DQ_ML"
        ]).then(function () {});
        return function () {

        };
    });
