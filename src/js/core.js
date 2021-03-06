define(['backbone', 'events', 'globals','views/login/loginView','models/login/loginModel','views/defaultAction/accessForbiden','underscore','jqueryCookie'],
    function(Backbone, Events, Globals,LoginView,LoginModel,AccessForbidenView){

    _.extend(Backbone.Model , {
        gateWayUrl:Globals.gateWayUrl
    });

    var views = {},
        user = ['UserAssesmentPage', 'DashboardPage', 'userPage'];

    var create = function (context, name, View, options) {
        /*
            View clean up isn't actually implemented yet,
            but will simply call .clean, .remove and .unbind
        */
        if(typeof views[name] !== 'undefined') {
            views[name].undelegateEvents();
            if(typeof views[name].clean === 'function') {
                views[name].clean();
            }
        }
        var skipAuthCheck=false;
        if(options!==undefined){
            if(options.skipAuthCheck){
                skipAuthCheck=true;
            }
        }
        var accesslevel = $.cookie('accesslevel');
        if(!$.cookie('isAuthenticated') && !skipAuthCheck){
            var loginModel=new LoginModel(),
            view = new LoginView({model:loginModel,authorizationFailed:!skipAuthCheck,targetView:View,targetOptions:options});
        } else if((accesslevel === "admin" && name === "userPage") || (accesslevel === "user" && _.contains(user, name))){
            view = new AccessForbidenView();
            Events.trigger("view:navigate", {
                path: "accessForbiden",
                options: {
                    trigger: true
                }
            });
        } else {
            var view = new View(options);
        }

        views[name] = view;

        if(typeof context.children === 'undefined'){
            context.children = {};
            context.children[name] = view;
        } else {
            context.children[name] = view;
        }

        Events.trigger('viewCreated');
        return view;
    };

    return {
        create: create
    };


});
