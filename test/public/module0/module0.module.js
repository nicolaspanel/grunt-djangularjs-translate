'use strict';

ApplicationConfiguration.registerModule('module0')
    .config(function($stateProvider){
        $stateProvider
            .state('home', {  // main page once logged in
                url: '/',
                resolve: {
                    trans1: function ($translate) {return $translate('SERVICE_SQ'); },
                    trans2: function ($translate) {return $translate("SERVICE_DQ"); },
                    trans3: function ($translate) {return $translate.instant('SERVICE_INSTANT_SQ'); },
                    trans4: function ($translate) {return $translate.instant("SERVICE_INSTANT_DQ"); },
                    trans5: function ($translate) {return $translate('NAMESPACED.SERVICE_SQ'); },
                    trans6: function ($translate) {return $translate("NAMESPACED.SERVICE_DQ"); }
                },
                data: {
                    pageTitleSimple: /* translate */'COMMENT_SQ',
                    pageTitleDouble: /* translate */"COMMENT_DQ"
                }
            });
    })
    .factory('someService', function ($translate) {
        $translate('SERVICE_SQ_{name}', {name: 'name'}).then(function (module0Js03) {});
        $translate("SERVICE_DQ_{name}", {name: 'name'}).then(function (module0Js04) {});

        $translate(['SERVICE_MULT_SQ_SL', "SERVICE_MULT_DQ_SL"]).then(function () {});
        $translate([
            'SERVICE_MULT_SQ_ML',
            "SERVICE_MULT_DQ_ML"
        ]).then(function () {});
        return function () {

        };
    });
