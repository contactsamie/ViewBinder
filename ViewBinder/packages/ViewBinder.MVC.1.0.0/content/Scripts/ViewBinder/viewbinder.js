
/*
By Samuel Bamgboye v1.0.0 | 2013
*/
$ && (function() {

    var bootstrap = "data-viewbind-boot";
    var modelAttr = "data-viewbind-model";
    var effectsOnLoad = "data-viewbind-effect";
    var identity = "data-viewbind-identity";
    var nodeParent = "data-viewbind-parent";
    var nodeChild = "data-viewbind-child";
    var nodeMe = "data-viewbind-me";
    var broadcastAttr = "data-viewbind-cast";
    var eventAttr = "data-viewbind-event";
    var callBackAttr = "data-viewbind-call";
    var refAtLocator = "data-viewbind-view";
    var refviewdelay = "data-viewbind-viewdelay";
    var refExLocator = refAtLocator + "-x";
    var refErrLocator = refAtLocator + "-error";
    var igniter = "viewbind";

    var selector = "*"; // "."+igniter;

    var rootUrl = "";


   

    var identityGenerator = function() {
        identityGenerator.id = identityGenerator.id ? (identityGenerator.id + 1) : 1;
        return identityGenerator.id;
    };
    var delayViewTrigger = function(view) {
        if (view) {
            $("[" + refAtLocator + "='" + view + "']").removeAttr(refviewdelay);
            $viewbinderViewLoader("selector");
        }
    };

    var unloadView = function(view) {
        if (view) {
            $("[" + refAtLocator + "='" + view + "']").html("");
            $viewbinderViewLoader(selector);
        }
    };

    var reloadView = function(view) {
        if (view) {
            $("[" + refAtLocator + "='" + view + "']").removeAttr(refviewdelay);
            $("[" + refAtLocator + "='" + view + "']").removeAttr(refExLocator);
            $("[" + refAtLocator + "='" + view + "']").html("");
            $viewbinderViewLoader(selector);
        }
    };
    var viewControl = {
        load: delayViewTrigger,
        unload: unloadView,
        reload: reloadView
    };


    var loadViewWithEffect = function(destinationRef, viewUrl, callback, effect) {
        if (destinationRef && viewUrl) {
            effect && $(destinationRef).css("display", "none");
            $.get(viewUrl,
                function(data) {
                    $(destinationRef).html(data);
                    effect ? $(destinationRef)[effect]("fast", function() { typeof callback === "function" && callback(data, "", ""); }) :
                        (typeof callback === "function" && callback(data, "", ""));

                },
                "html"
            );
        }

    };

    var bCastObject = {        
        
    };
    var viewLinking = [];
    var methodArgExtrator = function(modelRef, context) {
        var MetArg = {};

        if (modelRef) {
            var parts = modelRef.split("=");
            if (parts[0] === "target") {
                if (parts[1]) {
                    MetArg = parts[3] ? $(parts[1])[parts[2]](parts[3]) : $(parts[1])[parts[2]]();
                } else {
                    console.error("target not well specified for :");
                    console.error(context);
                }

            } else {
                MetArg = parts[1] ? $(context)[parts[0]](parts[1]) : $(context)[parts[0]]();
            }

        }
        return MetArg;
    };
    var getFunctionFromString = function(string) {
        var scope = window;
        var scopeSplit = string.split('.');

        var length1 = scopeSplit.length - 1;
        for (i = 0; i < length1; i++) {
            scope = scope[scopeSplit[i]];

            if (scope == undefined) return;
        }


        return {
            method: scope[scopeSplit[scopeSplit.length - 1]],
            context: scope,
        };
    };
    var eventSetup = function(_setting, element, modelRef) {
        if (_setting) {
            var allSettings = _setting.split(",");
            var allSettingsLength = allSettings.length;
            for (var i = 0; i < allSettingsLength; i++) {
                var setting = allSettings[i];
                if (setting) {
                    var arr = setting.split("=");
                    if (arr.length === 2) {
                        var ev = arr[0];
                        var fun = arr[1];
                        var fn = getFunctionFromString(fun).method;

                        typeof fn === "function" && element && ev && $(element).on(ev, function(e) {
                            var MetArg = methodArgExtrator(modelRef, this);


                            fn.apply(this, [e, viewControl, MetArg]);
                            $viewbinderViewLoader(selector);
                        });


                    }
                }
            }
        }
    };


    var broadcastSetup = function(_setting, element, isMethodbroadcast, bCastArg, modelRef) {
        if (_setting) {
            var allSettings = _setting.split(",");
            var allSettingsLength = allSettings.length;
            for (var i = 0; i < allSettingsLength; i++) {
                var setting = allSettings[i];
                if (setting) {
                    var arr = setting.split("=");
                    if (arr.length === 2) {
                        var ev = arr[0];
                        var fun = arr[1];

                        //   var fn = getFunctionFromString(fun).method;
                        if (bCastObject[fun]) {
                            console.warn("A broad Cast Setup Already exist for this element");
                            console.warn(element);
                        }
                        bCastObject[fun] = bCastObject[fun] || [];

                        if (isMethodbroadcast) {
                            var bcasts = bCastObject[fun];
                            var bcastsLength = bcasts.length;
                            for (var i = 0; i < bcastsLength; i++) {
                                typeof bcasts[i] === "function" && bcasts[i].apply(this, [{}, viewControl, bCastArg]);
                            }
                            $viewbinderViewLoader(selector);
                        } else {

                            element && ev && $(element).on(ev, function(e) {
                                var bcasts = bCastObject[fun];
                                var MetArg = methodArgExtrator(modelRef, this);
                                var bcastsLength = bcasts.length;

                                for (var i = 0; i < bcastsLength; i++) {


                                    typeof bcasts[i] === "function" && bcasts[i].apply(this, [e, viewControl, MetArg]);
                                }
                                $viewbinderViewLoader(selector);
                            });
                        }


                    }
                }
            }
        }

    };

    var stringMethodCall = function(_method, context, modelRef) {
        if (_method) {
            var allSettings = _method.split(",");
            var allSettingsLength = allSettings.length;
            for (var i = 0; i < allSettingsLength; i++) {
                var method = allSettings[i];
                if (method) {
                    try {
                        var fn = getFunctionFromString(method);
                        context = fn ? (fn.context || context) : context;

                        var MetArg = methodArgExtrator(modelRef, this);

                        fn && typeof fn.method === "function" && fn.method.apply(context, [{}, viewControl, MetArg]);

                    } catch(execp) {
                        console.error("could not invoke method " + method + " found in " + _method);
                        execp.message && console.error(execp.message);
                        console.error(execp);
                    }
                }
            }
        }


    };
    var broadcastMehtod = function(bCastName, bCastObject) {
        bCastName && broadcastSetup("bcast=" + bCastName, {}, true, bCastObject || "");
    };
    window.viewbinder = {
        init: function(settings) {
            if (settings) {
                rootUrl = settings.rootUrl || rootUrl;
            }
            $(function() {


                window.$viewbinderViewLoader = function(ref, mapingObject, prevLev, curLev) {

                    $(ref).each(function() {
                        if ($(this).is("[" + refviewdelay + "]") || $(this).attr(refExLocator)) {

                        } else {
                            try {
                                var level = curLev || identityGenerator();
                                var nextLevel = identityGenerator();
                                var id = identityGenerator();
                                $(this).attr(identity, id);
                                $(this).attr(nodeChild, nextLevel);
                                $(this).attr(nodeMe, level);
                                $(this).attr(nodeParent, prevLev);

                                viewLinking.push({
                                    parent: prevLev || "0",
                                    child: nextLevel,
                                    me: level,
                                    ref: "[" + nodeMe + "]"
                                });


                                var url = $(this).attr(refAtLocator);
                                var effectToLoadWith = $(this).attr(effectsOnLoad);
                                var context = this;
                                var loadEventHandler = function(response, status, xhr) {

                                    if (status == "error") {
                                        console.error("failure loading view - " + url + ":");
                                        console.error(response);
                                        console.error(xhr);
                                        $(this).attr(refErrLocator, true);
                                    }

                                    var subViews = $(context).find(selector);
                                    if (subViews.size() > 0) {
                                        subViews.each(function() {

                                            $viewbinderViewLoader(this, level, nextLevel);
                                        });
                                    } else {
                                        (function(context) {
                                            setTimeout(function() {
                                                var callback = $(context).attr(callBackAttr);
                                                var eventSet = $(context).attr(eventAttr);
                                                var bCastSet = $(context).attr(broadcastAttr);
                                                var modelRef = $(context).attr(modelAttr);
                                                callback && stringMethodCall(callback, context, modelRef);
                                                eventSet && eventSetup(eventSet, context, modelRef);
                                                bCastSet && broadcastSetup(bCastSet, context, false, false, modelRef);
                                            }, 100);
                                        })(context);
                                    }
                                };

                                loadEventHandler("element is just enabled with no view to load", "success", {});
                                if (url) {
                                    loadViewWithEffect(this, rootUrl + url, loadEventHandler, effectToLoadWith || "");
                                    //: $(this).load(rootUrl + url, loadEventHandler);
                                }
                                $(this).attr(refExLocator, true);

                            } catch(exc) {
                                console.error("failure loading view - " + url + ":");
                                console.error(exc);
                                $(this).attr(refErrLocator, true);
                            }
                        }

                    });
                };

                $viewbinderViewLoader(selector);
            });
        },
        on: function(bCastName, f) {
            if (typeof f === "function" && bCastName) {

                bCastObject[bCastName] = bCastObject[bCastName] || [];
                bCastObject[bCastName].push(f);

            } else {
                console.error("Problem Registering Listener for:");
                console.error(bCastName);
                console.error("with method:");
                console.error(f);
            }
        },
        broadcast: broadcastMehtod,
        view: viewControl,
        mappings: function() {

            return {
                broadcast: bCastObject,
                views: viewLinking
            };
        }
    };
})();