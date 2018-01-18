/**
* @file - JQuery Based Binder for binding json data/objects
* @license - MIT License
* @copyright - Copyright (c) 2017 JavscriptLab https://github.com/JavscriptLab
* @author - Javascript Lab
* @version - 0.1
*/
"use strict";

/**
 * @module globalvariables
 */
/**
 * detect whether window elements loaded or not
 * @global
 * @var {bool} jlbinderwindowloaded 
 */
var jlbinderwindowloaded = false;
/**
 * @module caching
 */
/**
 * Store all bindmanager caches and htmltemplates locally, it will refresh on next reload
 * @global
 * @var {Object} bindmanager 
 */
var bindmanager = {};
/**
 * Store all bindmanager caches locally, it will refresh on next reload
 * @memberof bindmanager
 * @var {Object} bindmanager.cache 
 */
bindmanager.cache = {};
/**
 * @memberof bindmanager
 * Store all bindmanager htmltemplates locally, it will refresh on next reload
 * @var {Object} bindmanager.htmltemplates 
 */
bindmanager.htmltemplates = {};
bindmanager.htmltemplatewrappers = {};
bindmanager.settings = {};
bindmanager.dynamicrows = {};
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(str) {
        if (this.indexOf(str) === 0) {
            return true;
        } else {
            return false;
        }
    };
}
(/**
  * Detect jquery is loaded or not. 
  * if 'jQuery' object is not allowed first load jquery script page,
  * then rename jquery global object to window.jQueryAlt like example
  * Binder will run through this object
  * This functionality is needed when a website is already using jquery lower version than 2 or angular based light jquery versions
  * @example <caption>How to rename jquery object to alternative object<caption>
  * window.jQueryAlt=window.jQuery;
  * @param {jQuery} $ jQuery Object 
  * @requires jQuery
  * @returns {jQuery}  global jquery variable
  */
    function($) {
        /**Required jQuery for binder
        *@param {jQuery} $ - jQuery $ object
        */
        window.jf = $.fn;
        /** @module public binder functions */
        $.binder = {
            /** Clear the cache of dom objects
            * This function is using only for those elements have data-caching attributes. 
            * It will clear the caches from its variable and it helps to load new data on next call to binder.
            * eg:$.binder.clear($("#mytablebody"));
            * $("#mytablebody").binder(); for getting fresh data
            * @alias $.binder.clear
            * @param {jQueryObject} t - Dom Element used data-json attribute, element must be a jquery object like $("selector")
            */
            clear: function(t) {
                var json = t.attr($.fn.binder.methods.data.data_json);
                $.fn.binder.methods.resetpagination(t);
                if (bindmanager.cache) {
                    $.each(bindmanager.cache,
                        function(i, v) {
                            if (i.startsWith(json)) {
                                bindmanager.cache[i] = "";
                            }
                        });
                }
            },
            insert: function(t, data, opt, removeindex) {
                if (!t.attr("data-binderinit")) {
                    t.binder({});
                }

                var tid = t.attr("id");
                if (bindmanager.settings) {
                    var settings = bindmanager.settings[tid];
                    settings.dynamicinsert = true;
                    if (opt) {
                        settings = $.extend(settings, opt);
                    }
                    var pagestarts = settings.pagestartswith ? parseInt(settings.pagestartswith) : 0;
                    var scrollerpage = 0;
                    var isscroller = false;
                    if ($("#input_scroller_" + tid).length > 0) {
                        isscroller = true;
                        scrollerpage = $("#input_scroller_" + tid).val();
                        $("#input_scroller_" + tid).val(pagestarts - 1);
                    }
                    if (settings) {
                        if (!bindmanager.dynamicrows[tid]) {
                            bindmanager.dynamicrows[tid] = [];
                        }
                        if (data) {
                            bindmanager.dynamicrows[tid].push(data);
                        }
                        if (typeof removeindex !== 'undefined' && removeindex !== true) {
                            delete bindmanager.dynamicrows[tid][removeindex];
                        }
                        if (removeindex === true || bindmanager.dynamicrows[tid].length === 0) {
                            bindmanager.dynamicrows[tid] = [];
                            var paginationt = $(t.attr($.fn.binder.methods.data.data_pagination));
                            if (paginationt.length > 0) {
                                paginationt.find("[data-dynamicrows]").hide();

                                $.fn.binder.methods.resetpagination(t);
                                $.fn.binder.methods.success(t,
                                    settings,
                                    { rows: $.extend({}, bindmanager.dynamicrows[tid]) },
                                    tid);
                            } else {
                                $.fn.binder.methods.success(t,
                                    settings,
                                    { rows: $.extend({}, bindmanager.dynamicrows[tid]) },
                                    tid);
                            }
                            return false;
                        }


                        $.fn.binder.methods.success(t,
                            settings,
                            { rows: $.extend({}, bindmanager.dynamicrows[tid]) },
                            tid);
                    }

                    if (isscroller) {
                        $("#input_scroller_" + tid).val(scrollerpage);
                    }
                }
            },
            cleardynamicrows: function(t) {
                this.insert(t, null, false, true);
            },
            remove: function(t, index, opt) {
                this.insert(t, null, opt, index);
            },
            attr: function(t) {
                var obj = {};
                if (t) {
                    $.each(t[0].attributes,
                        function() {
                            if (this.specified) {
                                obj[this.name] = this.value;
                            }
                        });
                }
                return obj;
            }
        };
        jf.setevent = function(key, value, permanent) {
            var t = $(this);
            if (permanent) {
                if (t.attr("data-binderperminit-" + key, value)) {
                    t.attr("data-binderperminit-" + key, value + "," + t.attr("data-binderperminit-" + key, value));
                } else {
                    t.attr("data-binderperminit-" + key, value);
                }
            } else {
                if (t.attr("data-binderinit-" + key)) {
                    t.attr("data-binderinit-" + key, value + "," + t.attr("data-binderinit-" + key));
                } else {
                    t.attr("data-binderinit-" + key, value);
                }
            }
            var datas = $.fn.binder.methods.attr(t);
            $.fn.binder.methods.initfn($(t), datas);
        };

        window.consoleit = function(msg, type) {

            console.log("%c -----------------------JLBinder Messages-----------------------", "color:Green");
            console.log("%c **********************!!!!!!!!!!!!!!!!!!!!!!!!!!**********************",
                "color:DodgerBlue");
            if (type == "s") {
                console.log("%c" + msg, "color:Green");
            } else if (type == "e") {
                console.log("%c" + msg, "color:red");
            } else {
                console.log("%c" + msg, "color:orange");
            }
            console.log("%c **********************!!!!!!!!!!!!!!!!!!!!!!!!!!**********************",
                "color:DodgerBlue");


        }

        window.JSONstringify = function(str) {
            var obj = "";
            try {
                obj = JSON.stringify(str);
            } catch (e) {
                return "";
            }
            return obj;
        }

        window.JSONparse = function(str) {
            var obj = "";
            try {
                obj = $.parseJSON(str);
            } catch (e) {
                return "";
            }
            return obj;
        }

        window.IsJsonString = function(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        $.fn.binder = function(opt) {
            for (var bi = 0; bi < this.length; bi++) {
                var t = $(this[bi]);
                var mt = $.fn.binder.methods;
                mt.create(t, opt);
            }
            return $(this);
        };
        $.fn.binder.methods = {
            /**
             * Dom Related Common Functions
             */
            attr: function(t) {
                var obj = {};
                if (t && t.length > 0) {
                    $.each(t[0].attributes,
                        function() {
                            if (this.specified) {
                                obj[this.name] = this.value;
                            }
                        });
                }
                return obj;
            },
            fetchvalue: {
                radio: function(t) {
                    return $("[name='" + t.attr("name") + "']:checked").val().trim();
                },
                checkbox: function(t) {
                    return t.prop("checked");
                }
            },
            setid: function(el) {
                if (!el.attr("id")) {
                    el.attr("id",
                        "Id" + new Date().getTime().toString() + "" + Math.random().toString().replace(".", ""));
                }
                return el.attr("id");
            },
            attributevaluetoobject: function(t, attributename) {
                return $(t.attr(attributename));
            },
            attrselector: function(attribute) {
                return "[" + attribute + "]";
            },
            getcommentobj: function(th) {
                if ($(th).contents) {
                    return $(th).contents().map(function() {
                        return (this.nodeType === 8) ? $(this) : false;
                    }).get();
                }
                return false;
            },
            bodyevent: function(events, elements, callback) {
                $("body").on(events, elements, callback);
            },
            windoworelementevent: function(events, callback, elements) {
                if (elements) {
                    $(elements).on(events, callback);
                } else {
                    $(window).on(events, callback);
                }
            },
            windowevent: function(events, callback) {
                $(window).on(events, callback);
            },
            triggerevent: function(obj, eventname, data, callback) {
                if (jlbinderwindowloaded) {
                    obj.trigger(eventname, data);
                } else {
                    var recursivefunction;
                    if (callback) {
                        recursivefunction = callback;
                    } else {
                        recursivefunction = this.triggerevent;
                    }
                    setTimeout(function() {
                            recursivefunction(obj, eventname, data, recursivefunction);
                        },
                        500);
                }
            },
            grandchildren: function(t, selector) {
                return t.find(selector).find(selector);
            },
            wrapwithparent: function(parenttag, html) {
                return $("<" + parenttag + ">" + html + "</" + parenttag + ">");
            },
            getdataattributesforsettings: function(t, attributes) {
                var obj = {};
                for (var attribute in attributes) {
                    if (attributes.hasOwnProperty(attribute)) {
                        if (attribute.startsWith("data-")) {
                            obj[attribute.replace("data-", "").replace(/-/ig, "_")] = attributes[attribute];
                        }
                    }
                }
                return obj;
            },
            /**
             * Dom Related Common Functions End
             */
            /**
             * Object Related Common Functions
             */
            defined: function(t) {
                if (typeof t != "undefined") {
                    return true;
                }
                return false;
            },
            isstring: function(value) {
                if (typeof value == "string") {
                    return true;
                }
                return false;
            },
            trimvalue: function(t) {
                if (this.defined(t) && this.isstring(t.val())) {
                    return t.val().trim();
                }
                return t.val();
            },
            objecttolowercase: function(properties) {
                $.each(properties,
                    function(pi, pv) {
                        if (typeof pv != "object") {
                            properties[pi.toLowerCase()] = pv;
                        }
                    });
                return properties;
            },
            getprototypefunction: function(prototypes, functionname) {
                var propertynames = Object.getOwnPropertyNames(prototypes);
                for (var prototype in propertynames) {
                    if (propertynames.hasOwnProperty(prototype)) {
                        var prototypename = propertynames[prototype];
                        if (prototypename == functionname) {
                            return functionname;
                        } else if (prototypename.toLowerCase() == functionname) {
                            return prototypename;
                        }
                    }
                }
                return functionname;
            },
            getconditionalexpression: function(keyname, key, value) {
                var exp = false;
                if (keyname.toLowerCase().split(key.toLowerCase())
                    .length ==
                    1) {
                    if (typeof value != "boolean" && typeof value != "number") {
                        value = "'" + value.toString() + "'";
                    }
                    if (keyname.toString().match(/[<>!=]/ig)) {
                        exp = value + keyname.toString();
                    } else {
                        exp = value +
                            "==" +
                            keyname.toString();
                    }
                } else {
                    var reg = new RegExp("{" + key + "}.length", "ig");
                    var reg2 = new RegExp("{" + key + "}", "ig");
                    var reg3 = new RegExp("{" + key + "}.toString\\(\\)",
                        "ig");
                    exp = keyname.replace(reg, value.length);
                    exp = exp.replace(reg3, "'" + value.toString() + "'");
                    exp = exp.replace(reg2, value);
                }
                return exp;
            },
            removedataprefix: function(value) {
                return value.replace("data-", "");
            },
            getidobj: function(id) {
                return $("#" + id);
            },
            getinputofthis: function(t) {
                return this.getidobj("input_" + t.attr("id"));
            },

            /**
             * Object Related Common Functions End
             */
            /**
             * Jl Binder Common Methods
             */
            autofn: function(obj, t, properties) {
                var datas = this.attr(t);
                properties = this.objecttolowercase(properties);
                $.each(datas,
                    function(di, dv) {
                        if (di.startsWith("data-method")) {
                            var pieces = di.split("-");
                            var dvobj = obj.find(dv);
                            var keyname = pieces[2];
                            var methodname = pieces[3];
                            var singlemethod = pieces[2];
                            if (pieces.length == 4) {
                                if (keyname && methodname) {
                                    dvobj[methodname](properties[keyname]);
                                }
                            } else if (pieces.length == 3) {
                                dvobj[singlemethod]();
                            }
                        }
                    });
                return obj;
            },
            textautofn: function(attributes, value, t) {
                if (t.length > 0) {
                    for (var di in attributes) {
                        if (attributes.hasOwnProperty(di)) {
                            var dv = attributes[di];
                            if ((typeof value == "string" || typeof value == "number") &&
                            (di.startsWith("data-string-") ||
                                di == ("data-string") ||
                                di == ("data-number") ||
                                di.startsWith("data-number-"))) {
                                var pieces = di.split("-");
                                pieces[pieces.length] = dv;
                                var prototype = pieces[1];
                                var methodname = pieces[2];
                                var param1 = pieces[3];
                                var param2 = pieces[4];
                                if (!value[methodname]) {
                                    if (prototype == "string") {
                                        if (typeof value == "number") {
                                            value = value.toString();
                                        }
                                        methodname = this.getprototypefunction(String.prototype, methodname);
                                    }
                                    if (prototype == "number") {
                                        methodname = this.getprototypefunction(Number.prototype, methodname);
                                    }
                                }
                                var argumentvalues = pieces.splice(3, pieces.length);
                                value = value[methodname].apply(value, argumentvalues);
                            }
                        }
                    }
                }
                return value;
            },
            getfollowwrappers: function(wrappers, tid) {
                bindmanager.htmltemplatewrappers[tid] = [];
                if (wrappers.length > 0) {
                    for (var wrapperi = 0; wrapperi < wrappers.length; wrapperi++) {
                        var wrapper = $(wrappers[wrapperi]);
                        wrapper.attr("data-wrapperlevel", wrapperi);
                        var wrapperhtml = wrapper[0].outerHTML;
                        var wrapperobj = $(wrapperhtml);
                        wrapperobj.find("[" + this.data.data_follow + "],[data-wrapfollow]").remove();
                        var obj = {
                            count: parseInt(wrapperobj.attr("data-wrapfollow")),
                            html: wrapperobj[0].outerHTML

                        }
                        bindmanager.htmltemplatewrappers[tid].push(obj);
                    }
                }

            },
            gettemplatedetails: function(t, tid, dynamicinsert) {
                var obj = {};
                obj.nochange = "[" +
                    this.data.data_follow +
                    "],[" +
                    this.data.data_static +
                    "],[" +
                    this.data.data_noresult +
                    "]";
                if (!dynamicinsert) {
                    obj.nochange += ",[" +
                        this.data.data_dynamicrows +
                        "]";
                }

                obj.nochangedchildrens = t.children().not(obj.nochange);
                if (!bindmanager.htmltemplates[tid]) {
                    var excludedelements = t.find("[data-json],[data-subjson],[data-pagination]")
                        .find("[" + this.data.data_follow + "]");
                    var ch = t.find("[" + this.data.data_follow + "]").not(excludedelements).first();

                    if (ch.length == 0) {
                        ch = ch.add(obj.nochangedchildrens).first();
                    }
                    if (ch.length > 0) {
                        ch.attr(this.data.data_follow, true);
                        obj.html = bindmanager.htmltemplates[tid] = ch[0].outerHTML;
                        var followelements = t
                            .find("[" + this.data.data_follow + "]:not([" + this.data.data_static + "])")
                            .not(excludedelements);
                        var excludedwrappers = t.find("[data-json],[data-subjson],[data-pagination]")
                            .find("[data-wrapfollow]");
                        var wrappes = t.find("[data-wrapfollow]").not(excludedwrappers);

                        if (wrappes.length > 0) {

                            this.getfollowwrappers(wrappes, tid);
                        }

                        if (followelements.length == 1) {
                            followelements.remove();
                        }
                    }
                    return obj;
                } else {
                    obj.html = bindmanager.htmltemplates[tid];
                    return obj;
                }
            },
            finddatarows: function(objrows, resultdata) {
                var rows = null;
                var foundedrows = false;
                if (resultdata != null) {
                    $.each(objrows,
                        function(obji, objv) {
                            if (typeof resultdata[objv] != 'undefined') {
                                foundedrows = true;
                                rows = resultdata[objv];
                            }
                        });
                }
                if (rows === null &&
                    !foundedrows &&
                    typeof resultdata === "object" &&
                    resultdata != null &&
                    ((resultdata instanceof Array && resultdata.length > 0) || (!(resultdata instanceof Array)))) {
                    rows = resultdata;
                }
                return rows;
            },
            setnoresults: function(t) {
                t.find(this.attrselector(this.data.data_noresult)).hide();
            },
            bringvalues: function(t) {
                t.find("[data-jlvalue]").each(function() {
                    $(this).val($(this).attr("data-jlvalue"));
                    $(this).removeAttr("data-jlvalue");
                });
            },
            getcustomattributevalue: function(tobj, mainkey, subkey, key) {
                return tobj.attr(mainkey + "-" + key.toLowerCase() + "-" + subkey)
                    ? tobj.attr(mainkey + "-" + key.toLowerCase() + "-" + subkey)
                    : tobj.attr(mainkey + "-" + subkey + "-" + key.toLowerCase());
            },
            gotoprocess: function(fntodo, th) {
                try {

                    var fntodopieces = fntodo.split("_");
                    var currentobj = th;
                    var isnested = false;
                    var nestedfn = "";
                    var isfncall = false;
                    var fnname = "";
                    var totaltodo = fntodopieces.length;

                    var fnarguments = [];
                    $.each(fntodopieces,
                        function(piecei, piecev) {
                            var fncallend = false;
                            var newfncall = false;
                            if (piecev.startsWith("this")) {
                                fncallend = true;
                                currentobj = th;
                            } else if (!isnested) {
                                if (piecev === 'find' ||
                                    piecev === 'closest' ||
                                    piecev === 'parent' ||
                                    piecev === 'child') {
                                    fncallend = true;
                                    nestedfn = piecev;
                                    isnested = true;
                                } else if (piecev.startsWith("#") ||
                                    piecev.startsWith(".") ||
                                    piecev.startsWith("[")) {
                                    fncallend = true;
                                    currentobj = $(piecev);
                                } else {
                                    if (currentobj[piecev]) {
                                        fncallend = true;
                                        fnname = piecev;
                                        isfncall = true;
                                        newfncall = true;
                                        fnarguments = [];
                                    } else if (isfncall) {
                                        fnarguments.push(piecev);
                                    }

                                    if (!isfncall) {
                                        ////if (currentobj.split("(").length > 1) {
                                        ////    var fnpieces = currentobj.split("(");
                                        ////    var params = fnpieces[1].replace(")", "").split(",");
                                        ////    var fnname = fnpieces[0];
                                        ////    var paramlist = [];
                                        ////    ////TODO
                                        ////}
                                    }
                                }
                            } else {
                                fncallend = true;
                                currentobj = currentobj[nestedfn](piecev);
                                isnested = false;
                            }
                            if (isfncall && fnname) {
                                if (piecei == totaltodo - 1 || (fncallend == true && !newfncall)) {
                                    if (fnarguments[1]) {
                                        currentobj = currentobj[fnname](fnarguments[0], fnarguments[1]);
                                    } else if (fnarguments[0]) {
                                        currentobj = currentobj[fnname](fnarguments[0]);
                                    } else {
                                        currentobj = currentobj[fnname]();
                                    }
                                    fnname = "";
                                    isfncall = false;
                                }

                            }

                        });
                } catch (e) {

                }
            },


            applyobjectascondition: function(exp, tobj, statement, elsestatement) {
                if (exp) {
                    if (eval(exp)) {
                        if (statement) {
                            this.gotoprocess(statement, tobj);
                        } else {
                            tobj.show().attr("data-isactive", true);
                        }
                    } else {
                        if (elsestatement) {
                            this.gotoprocess(elsestatement, tobj);
                        } else {
                            tobj.hide().attr("data-isactive", false);
                        }
                        if (tobj.attr("data-removeinactive")) {
                            tobj.remove();
                        }
                    }
                }
            },
            applyattributesascondition: function(exp, tobj, statement) {
                if (exp) {
                    if (eval(exp)) {
                        tobj.each(function() {
                            eval(statement);
                        });
                    }
                }
            },
            applycontentifcondition: function(ob,
                tobj,
                mainkey,
                subkey,
                key,
                value,
                keyvalue,
                statement,
                elsestatement) {
                //var keyvalue = this.getcustomattributevalue(tobj, mainkey, subkey, key);
                //// if (typeof value === 'boolean') {
                if (value != null) {
                    try {
                        var exp = this.getconditionalexpression(keyvalue, key, value);
                        this.applyobjectascondition(exp, tobj, statement, elsestatement);
                    } catch (e) {
                        consoleit(e.message);
                    }
                }
            },
            applyattributeifcondition: function(ob, tobj, mainkey, subkey, key, value, keyvalue) {
                //var keyvalue = this.getcustomattributevalue(tobj, mainkey, subkey, key);
                //// if (typeof value === 'boolean') {
                if (value != null) {
                    try {
                        var conditionandstatement = keyvalue.split("->");
                        var condition = conditionandstatement[0];
                        var statement = conditionandstatement[1];
                        var exp = this.getconditionalexpression(condition, key, value);
                        if (statement) {
                            this.applyattributesascondition(exp, tobj, statement);
                        }
                    } catch (e) {
                    }
                }
            },
            formatvalueusedatefunctionalities: function(ob, obv, key, value) {
                try {
                    if (this.date[ob]) {

                        return this.date[ob](key, value, obv);
                    }
                } catch (e) {
                    return value;
                }
                return value;
            },

            applydropdownbasedfunctionalities: function(t) {
                if (t.attr(this.data.data_value)) {
                    var val = t.attr(this.data.data_value);
                    if (!t.val() || (t.val() && t.val().length == 0) || t.attr("data-forcesetvalue")) {
                        t.removeAttr("data-forcesetvalue");
                        if (t.attr("multiple")) {
                            val = val.split(",");
                        }
                        t.val(val);
                        if (val != "" && !t.attr("multiple")) {
                            if (t.find('option[value="' + val + '"]').length == 0) {
                                t.find("option:not([data-follow])").first().prop("selected", true);
                            }
                        }
                    } else if (t.attr("data-hasdefaultvalue")) {
                        if (t.find('option[value="' + val + '"]').length > 0) {
                            t.val(val);
                        }
                    }
                } else {
                    if (t.find("option:selected:not([data-follow])").length === 0) {
                        t.find("option:not([data-follow])").first().prop("selected", true);
                    }
                }
            },
            applydatefunctionalitybyattributes: function(attributes, key, value) {
                if (value) {
                    for (var ob in attributes) {
                        if (attributes.hasOwnProperty(ob)) {
                            var obv = attributes[ob];
                            if (ob.startsWith("data-")) {
                                ob = this.removedataprefix(ob);
                                value = this.formatvalueusedatefunctionalities(ob, obv, key, value);
                            }
                        }
                    }
                }
                return value;
            },
            applyconverttobaseattributes: function(obj, key, value) {
                if (key === "data-src" || key === "data-style") {
                    obj.attr(key.replace("data-", ""), value);
                }
            },
            applyfunctionalitybasedonattributes: function(attributes, tobj, key, value) {
                for (var ob in attributes) {
                    if (attributes.hasOwnProperty(ob)) {
                        var obv = attributes[ob];
                        if (ob.startsWith("data-")) {
                            ob = ob.replace("data-", "");
                            var keytolower = key.toLowerCase();
                            var keyname;
                            if (ob === (keytolower + "-inline") ||
                                ob === ("inline-" + keytolower)) {

                                ////keyname = mt.getcustomattributevalue(tobj, "data", "inline", key);
                                keyname = obv;
                                var inlinereplace = "{" + key + "}";
                                var inlinere = new RegExp(inlinereplace, "g");
                                if (keyname == "html") {
                                    tobj.html(tobj.html().replace(inlinere, value));
                                } else if (keyname == "text") {
                                    tobj.text(tobj.text().replace(inlinere, value));
                                } else {
                                    var keynamepieces = keyname.split(",");
                                    for (var keyi = 0; keyi < keynamepieces.length; keyi++) {
                                        var keyv = keynamepieces[keyi];
                                        var attribute = tobj.attr(keyv);
                                        if (keyv && attribute) {

                                            var attributebasedvalue = attribute.replace(inlinere, value);
                                            tobj.attr(keyv, attributebasedvalue);
                                            this.applyconverttobaseattributes(tobj, keyv, attributebasedvalue);


                                        } else {
                                            consoleit("'" +
                                                keyv +
                                                "' not matching any attributes for apply value for inline key 'data-" +
                                                keytolower +
                                                "-inline'");
                                        }
                                    };
                                }
                            }
                            if (ob === (key.toLowerCase() + "-attr") ||
                                ob === ("attr-" + keytolower)) {
                                //keyname = mt.getcustomattributevalue(tobj, "data", "attr", key);
                                keyname = obv;
                                tobj.attr(keyname, value);
                                this.applyconverttobaseattributes(tobj, keyname, value);
                            }
                            if (ob === (keytolower + "-if") ||
                                ob === ("if-" + keytolower)) {
                                var statement;
                                var elsestatement;
                                if (attributes.hasOwnProperty("data-" + ob + "-statement")) {
                                    statement = attributes["data-" + ob + "-statement"];
                                }
                                if (attributes.hasOwnProperty("data-" + ob + "-elsestatement")) {
                                    elsestatement = attributes["data-" + ob + "-elsestatement"];
                                }

                                this.applycontentifcondition(ob,
                                    tobj,
                                    "data",
                                    "if",
                                    key,
                                    value,
                                    obv,
                                    statement,
                                    elsestatement);
                            }
                            if (ob === "attr-" + (keytolower + "-if") ||
                                ob === ("attr-" + "if-" + keytolower)) {
                                this.applyattributeifcondition(ob,
                                    tobj,
                                    "data-attr",
                                    "if",
                                    key,
                                    value,
                                    obv);
                            }
                        }
                    };
                };

            },
            /***
             * Jl Binder Common methods end
             */
            /***
             * Filteration Part
             */
            /**
             * Get filter inputs before request to server by data-filter and data-filter-required attribute
             * @param {DomObject} t html element
             * @param {string} tid id of html element
             * @returns {DomObject} all input elements
             */
            submitandbind: function(t, form) {
                if (form.valid) {
                    if (form.valid() == true) {
                        this.resetpaginationandbind(t);
                    }
                } else {
                    this.resetpaginationandbind(t);
                }
            },
            getfilterbyinputs: function(t, tid) {
                var inputs = null;
                try {
                    var postsinputs = this.attributevaluetoobject(t, this.data.data_filterby);
                    var requiredinputs = this.attributevaluetoobject(t, this.data.data_filterby_required);
                    var inputsrequired = requiredinputs.add(requiredinputs.find(this.data.inputs));
                    $("[data-requiredonfilter" + tid + "]").removeAttr("data-requiredonfilter" + tid);
                    inputsrequired.attr("data-requiredonfilter" + tid, true);
                    inputs = postsinputs.add(postsinputs.find(this.data.inputs)).add(inputsrequired);
                } catch (e) {

                    consoleit("Your filtered inputs for #" + tid + " are not valid", "e");
                    return false;
                }
                return inputs;
            },
            setfilters: function(t, stn, inputs) {
                var mt = this;
                if (!t.attr("data-disablechangeevent")) {
                    this.setfilterevent(t, "change", "change", stn.tid);
                }
                if (t.attr("data-enableblurevent")) {
                    this.setfilterevent(t, "blur", "change", stn.tid);
                }
                this.setfilterevent(t, "click", "reset", stn.tid);
                this.setresponsiveonresize(t, "resize");
                var button = inputs.filter(function() {
                    return ($(this).attr("type") && $(this).attr("type").toLowerCase() === "submit");
                });
                var form = inputs.filter(function() {
                    return ($(this).prop("tagName").toLowerCase() == "form");
                });
                var reset = inputs.filter(function() {
                    return ($(this).attr("type") && $(this).attr("type").toLowerCase() === "reset");
                });
                if (form.length > 0) {
                    form.each(function() {
                        if (!$(this).attr("id")) {
                            $(this).attr("id", "Id" + new Date().getTime());
                        }
                        if (!$(this).attr("data-submiteventinit")) {
                            $(this).attr("data-submiteventinit", true);
                            $("body").on("submit",
                                "#" + $(this).attr("id"),
                                function(e) {
                                    e.preventDefault();
                                    mt.submitandbind(t, $(this));
                                });
                            $("body").on("reset",
                                "#" + $(this).attr("id"),
                                function(e) {
                                    var th = $(this);
                                    setTimeout(function() {
                                            mt.submitandbind(t, th);
                                        },
                                        100);
                                });
                        }
                    });
                } else {
                    if (reset.length > 0) {
                        $("[data-onresetfilter" + stn.tid + "]").removeAttr("data-onresetfilter" + stn.tid);
                        reset.attr("data-onresetfilter" + stn.tid, "true");
                    }
                }
                var outsidefilters = inputs.filter(function() {
                    return ($(this).attr("data-forcefilter"));
                });
                $("[data-onchangefilter" + stn.tid + "]").removeAttr("data-onchangefilter" + stn.tid);
                if (button.length == 0 && inputs.length > 0) {
                    if (stn.perpage) {
                        inputs.not(stn.perpage).attr("data-onchangefilter" + stn.tid, "true");
                    } else {
                        inputs.attr("data-onchangefilter" + stn.tid, "true");
                    }
                }
                //If the input field outside the form and on trigger 
                if (outsidefilters.length > 0) {
                    outsidefilters.attr("data-onchangefilter" + stn.tid, "true");
                }
                return inputs;
            },
            setfilterevent: function(t, events, attributename, tid) {
                var mt = this;
                this.bodyevent(events,
                    "[data-on" + attributename + "filter" + tid + "=true]",
                    function() {
                        if (events == "change" && $(this).attr("data-disablechangeevent")) {
                            return false;
                        }
                        if (events == "blur" && $(this).attr("data-disableblurevent")) {
                            return false;
                        }
                        mt.resetpaginationandbind(t);
                    });
            },
            validaterequiredfilters: function(tid) {
                var valid = true;
                $("[data-requiredonfilter" + tid + "]").each(function(ri, rv) {
                    switch ($(this).attr("type")) {
                    case 'radio':
                    case 'checkbox':
                    {
                        if ($(this).prop("checked") == false) {
                            return valid = false;
                        }
                        break;
                    }
                    default:
                    {
                        if (!$(this).val()) {
                            return valid = false;
                        }
                        break;
                    }
                    }
                });
                return valid;
            },
            /***
             * Filteration Part ends
             */

            /***
             * pagination and its related Part starts ( scrollloader,perpage etc )
             */
            initializepagination: function(t, stn, inputs, pageinputid) {
                t.attr("data-binderpaginationinit", true);
                var paginationt = $(stn.pagination);
                if (!paginationt.attr("id")) {
                    paginationt.attr("id", "Id" + new Date().getTime());
                }
                pageinputid = "input_" + paginationt.attr("id");

                paginationt.children().attr("data-jlpages", true);
                paginationt.attr("data-jlid", stn.tid);
                if (!stn.pageservername) {
                    consoleit(
                        "Please add a 'data-pageservername' attribute for binder initialized element, It is required for sending your page number field name (#" +
                        t.attr("id") +
                        ")");
                }
                if ($("#" + pageinputid).length == 0) {
                    $("body").append('<input type="hidden" id="' +
                        pageinputid +
                        '" name="' +
                        stn.pageservername +
                        '"  value="' +
                        stn.pagestartswith +
                        '" />');
                }
                t.attr(this.data.data_filterby, t.attr(this.data.data_filterby) + ",#" + pageinputid);
                var pageinput = $("#" + pageinputid);
                inputs = inputs.add(pageinput);
                $("body").on("click",
                    "[data-jlid='" + stn.tid + "'] [data-jlpages]",
                    function(e) {
                        if (!$(this).hasClass("disabled")) {
                            e.preventDefault();
                            var isdynamicrows = false;
                            if ($(this).attr("data-dynamicrows")) {
                                $(this).parent().children().removeClass("active");
                            } else {
                                $(this).parent().children().removeClass("active disabled");
                            }
                            if ($(this).attr("data-previos")) {
                                pageinput.val(parseInt(pageinput.val()) - 1);
                            } else if ($(this).attr("data-next")) {
                                pageinput.val(parseInt(pageinput.val()) + 1);
                            } else if ($(this).attr("data-first")) { //ToDo
                                pageinput.val(stn.pagestartswith);
                            } else if ($(this).attr("data-last")) { //ToDo
                                pageinput.val(0);
                            } else if ($(this).attr("data-nextrow")) {
                                var nextli = paginationt.find(".jlvisiblepage[data-autocreated]:last").next();
                                pageinput.val(nextli.find("[data-pagenumber]").attr("data-pagenumber"));
                            } else if ($(this).attr("data-previosrow")) {
                                var prevli = paginationt.find(".jlvisiblepage[data-autocreated]:first").prev();
                                pageinput.val(prevli.find("[data-pagenumber]").attr("data-pagenumber"));
                            } else if ($(this).attr("data-dynamicrows")) {
                                var dynamicli = paginationt.find("[data-dynamicrows]:first");
                                dynamicli.addClass("active");
                                isdynamicrows = true;
                                $.binder.insert(t, null, null);
                            } else {
                                var pageno = 0;
                                if ($(this).find("[data-pagenumber]").length > 0) {
                                    pageno = $(this).find("[data-pagenumber]").attr("data-pagenumber");
                                } else {
                                    pageno = $(this).attr("data-pagenumber");
                                }
                                pageinput.val(pageno);
                            }
                            if (!isdynamicrows) {
                                var currentli = paginationt.find('[data-pagenumber="' + pageinput.val() + '"]')
                                    .closest("li");
                                currentli.addClass("active");
                                //if (currentli.find('[data-pagenumber]').attr('data-pagenumber') == paginationt
                                //    .find('[data-autocreated]:last').find('[data-pagenumber]').attr('data-pagenumber')) {
                                //    paginationt.find('[data-next]').addClass('disabled');
                                //}
                                //if (currentli.find('[data-pagenumber]').attr('data-pagenumber') == paginationt
                                //    .find('[data-autocreated]:first').find('[data-pagenumber]').attr('data-pagenumber')) {
                                //    paginationt.find('[data-previos]').addClass('disabled');
                                //}
                                //if (paginationt.find('[data-autocreated]:visible:last').find('[data-pagenumber]').attr('data-pagenumber') == paginationt
                                //    .find('[data-autocreated]:last').find('[data-pagenumber]').attr('data-pagenumber')) {
                                //    paginationt.find('[data-nextrow]').addClass('disabled');
                                //}
                                //if (paginationt.find('[data-autocreated]:visible:first').find('[data-pagenumber]').attr('data-pagenumber') == paginationt
                                //    .find('[data-autocreated]:first').find('[data-pagenumber]').attr('data-pagenumber')) {
                                //    paginationt.find('[data-previosrow]').addClass('disabled');
                                //}
                                t.binder();
                            }
                        }
                    });
                return inputs;
            },
            resetpaginationandbind: function(t) {
                this.resetpagination(t);
                t.binder();
            },
            setresponsiveonresize: function(t, events) {
                var mt = this;
                this.windowevent(events,
                    function() {
                        mt.responsivepagination(t);
                    });
            },
            appendpages: function(t, paginationt, properties, kv, stn, pagesize) {
                if (!stn.dynamicinsert) {
                    paginationt.children().removeClass("disabled");
                }
                var pagestartswith = parseInt(t.attr("data-pagestartswith"));
                var pagefollow = paginationt.find("[" + kv.data_follow + "]"); //TODO
                pagefollow.hide();
                if (pagefollow[0]) {
                    var pagehtml = pagefollow[0].outerHTML;
                    var pagetag = paginationt.prop("tagName").toLowerCase();
                    var totalrows = parseInt(properties[t.attr("data-pagetotalrows")]);
                    var pagenumber = pagestartswith;
                    if (!stn.dynamicinsert) {
                        paginationt.find("[data-autocreated]").remove();
                    }
                    /////paginationmaxcolumns * pagesize
                    var pagerow;
                    /**
                     * It is using for checking the rows are inseted dynamically via $.binder.insert function
                     * if inserted via this method this will show a page labeled as value of stn.dynamicrowstext( [data-dynamicrowstext] in main json element )
                     * @param stn.dynamicinsert
                     */
                    if (stn.dynamicinsert) {
                        /**
                         * Checking condition that if not existing already added dynamic rows box
                         */
                        if (paginationt.find("[data-dynamicrows]").length === 0 &&
                            t.find("[data-dynamicrows]").length !== 0) {
                            pagerow = this.wrapwithparent(pagetag, pagehtml);
                            pagerow.children().hide();
                            if (pagerow.find("[data-pagenumber]")) {
                                pagerow.find("[data-pagenumber]").attr("data-pagenumber", stn.dynamicrowsvalue)
                                    .html(stn.dynamicrowstext);
                            }
                            pagerow.find("[" + kv.data_follow + "]").show().removeAttr(kv.data_follow)
                                .attr("data-dynamicrows", true);
                            pagefollow.after(pagerow.html());
                            pagefollow = pagefollow.next();

                        } else if (t.find("[data-dynamicrows]").length === 0) {
                            paginationt.find("[data-dynamicrows]").remove();
                        }
                        /**
                         * If already have a design for dynamic rows show it
                         * it must be hide on default page loading or document ready
                         * it will also hide on clear dynamic rows
                         */
                        paginationt.find("[data-dynamicrows]").show().addClass("active");
                    }
                    if (paginationt.find("[data-dynamicrows]").length > 0) {
                        pagefollow = paginationt.find("[data-dynamicrows]");
                    }
                    if (!stn.dynamicinsert) {
                        for (var i = 0; i < totalrows; i = i + pagesize) {
                            pagerow = this.wrapwithparent(pagetag, pagehtml);
                            pagerow.children().hide();
                            if (pagerow.find("[data-pagenumber]")) {
                                pagerow.find("[data-pagenumber]").attr("data-pagenumber", pagenumber)
                                    .html(pagenumber);
                            }
                            pagerow.find("[" + kv.data_follow + "]").show().removeAttr(kv.data_follow)
                                .attr("data-autocreated", true);
                            pagefollow.after(pagerow.html());
                            pagefollow = pagefollow.next();
                            pagenumber++;
                        }
                    }
                }
            },
            managepagination: function(kv, t, stn, properties) {
                if (t.attr(kv.data_pagination)) {
                    var pagesize = parseInt($(t.attr("data-perpage")).val());
                    var paginationt = $(t.attr(kv.data_pagination));
                    if (paginationt.length > 0) {
                        this.appendpages(t, paginationt, properties, kv, stn, pagesize);
                        var pageinput = this.getidobj("input_" + paginationt.attr("id"));
                        var currentli = paginationt.find('[data-pagenumber="' + pageinput.val() + '"]')
                            .closest("li");
                        currentli.addClass("active");
                        if (!stn.dynamicinsert) {
                            if (currentli.find("[data-pagenumber]").attr("data-pagenumber") ==
                                paginationt
                                .find("[data-autocreated]:last").find("[data-pagenumber]").attr("data-pagenumber")) {
                                paginationt.find("[data-next]").addClass("disabled");
                            }
                            if (currentli.find("[data-pagenumber]").attr("data-pagenumber") ==
                                paginationt
                                .find("[data-autocreated]:first").find("[data-pagenumber]").attr("data-pagenumber")) {
                                paginationt.find("[data-previos]").addClass("disabled");
                            }
                            var pagevalue = parseInt(pageinput.val());
                            if (t.attr(kv.data_showingpagefrom)) {
                                $(t.attr(kv.data_showingpagefrom)).text((pagevalue * pagesize) - (pagesize) + 1);
                            }
                            if (t.attr(kv.data_showingpageto)) {
                                $(t.attr(kv.data_showingpageto))
                                    .text((pagevalue * pagesize) - (pagesize) + rows.length);
                            }
                        } else if (paginationt
                            .find("[data-autocreated]").length ==
                            0) {
                            paginationt.find("[data-next]").addClass("disabled");
                            paginationt.find("[data-previos]").addClass("disabled");

                        }
                        this.responsivepagination(t);
                    } else {
                        consoleit("Kindly include your pagination element " + t.attr(kv.data_pagination));
                    }
                }
                return this;
            },
            resetpagination: function(t) {
                var pagestartswith = t.attr("data-pagestartswith");
                if (t.attr(this.data.data_pagination)) {
                    var paginationt = $(t.attr(this.data.data_pagination));
                    var pageinputid = this.getinputofthis(paginationt);
                    pageinputid.val(pagestartswith);
                }
                if (t.attr(this.data.data_scrollloader)) {
                    $("#input_scroller_" + this.setid(t)).val(pagestartswith);
                }
            },
            responsivepagination: function(t) {
                if (t.attr(this.data.data_pagination)) {

                    var paginationt = this.attributevaluetoobject(t, this.data.data_pagination);
                    var maxrows = false;
                    if (t.attr("data-maxpaginationcolumns")) {
                        maxrows = parseInt(t.attr("data-maxpaginationcolumns"));
                    } else if (paginationt.attr("data-maxpaginationcolumns")) {
                        maxrows = parseInt(paginationt.attr("data-maxpaginationcolumns"));
                    }
                    var columnscount = 0;
                    var alllists = paginationt.find("li[data-autocreated='true']");
                    if (alllists.length > 0 || paginationt.find("[data-dynamicrows='true']").length > 0) {
                        alllists.hide().removeClass("jlvisiblepage");
                        var pageinput = this.getinputofthis(paginationt);
                        setTimeout(function() {
                                var appliedwidth = 0;
                                var totalwidth = paginationt.outerWidth();
                                var pagepositiontop = paginationt.position().top;
                                var totalheight = paginationt.outerHeight();
                                var pagenumbervalue = parseInt(pageinput.val());
                                var loopli;
                                var toppositioninner;
                                var breaked = false;
                                paginationt.find("[data-dynamicrows='true']").show().addClass("jlvisiblepage");
                                for (var i = 0; i < alllists.length; i++) {
                                    if (breaked == true) {
                                        break;
                                    }
                                    var currentpagenumbers = [(pagenumbervalue - i), (pagenumbervalue + i)];
                                    for (var j = 0; j < currentpagenumbers.length; j++) {
                                        var cpagenumber = currentpagenumbers[j];
                                        loopli =
                                            paginationt.find("[data-pagenumber=" + cpagenumber + "]").closest("li");
                                        if (loopli.length > 0) {

                                            loopli.show().addClass("jlvisiblepage");
                                            appliedwidth += loopli.outerWidth();
                                            if (totalheight == 0) {
                                                totalheight = paginationt.outerHeight();
                                            }
                                            if (totalwidth == 0) {
                                                totalwidth = paginationt.outerWidth();
                                            }
                                            var totalheightinner = paginationt.outerHeight();
                                            toppositioninner = paginationt.position().top;
                                            if (maxrows && columnscount > maxrows) {
                                                loopli.hide().removeClass("jlvisiblepage");
                                                breaked = true;
                                                break;
                                            } else if (totalheightinner > totalheight) {
                                                loopli.hide().removeClass("jlvisiblepage");
                                                breaked = true;
                                                break;
                                            }
                                            if (toppositioninner != pagepositiontop) {
                                                loopli.hide().removeClass("jlvisiblepage");
                                                breaked = true;
                                                break;
                                            }
                                            columnscount++;
                                        }
                                    }
                                }

                                if (paginationt
                                    .find(".jlvisiblepage[data-autocreated],.jlvisiblepage[data-dynamicrows]").last()
                                    .find("[data-pagenumber]")
                                    .attr("data-pagenumber") ==
                                    paginationt
                                    .find("[data-autocreated],[data-dynamicrows]").last().find("[data-pagenumber]")
                                    .attr("data-pagenumber")) {
                                    paginationt.find("[data-nextrow]").addClass("disabled");
                                } else {
                                    paginationt.find("[data-nextrow]").removeClass("disabled");
                                }
                                if (paginationt
                                    .find(".jlvisiblepage[data-autocreated],.jlvisiblepage[data-dynamicrows]").first()
                                    .find("[data-pagenumber]")
                                    .attr("data-pagenumber") ==
                                    paginationt
                                    .find("[data-autocreated],[data-dynamicrows]").first().find("[data-pagenumber]")
                                    .attr("data-pagenumber")) {
                                    paginationt.find("[data-previosrow]").addClass("disabled");
                                } else {
                                    paginationt.find("[data-previosrow]").removeClass("disabled");
                                }
                                toppositioninner = paginationt.position().top;
                                if (toppositioninner != pagepositiontop) {
                                    loopli.hide().removeClass("jlvisiblepage");
                                }
                            },
                            10);
                    }
                }
            },
            initializeperpage: function(t, stn, inputs) {
                var mt = this;
                t.attr("data-binderperpageinit", true);
                var perpaget = $(stn.perpage);
                if (perpaget.length > 0) {
                    if (!perpaget.attr("id")) {
                        perpaget.attr("id", "Id" + new Date().getTime());
                    }
                    var perpageinputid = perpaget.attr("id");
                    t.attr(this.data.data_filterby, t.attr(this.data.data_filterby) + ",#" + perpageinputid);
                    var perpageinput = $("#" + perpageinputid);
                    inputs = inputs.add(perpageinput);
                    $("body").on("change",
                        t.attr("data-perpage"),
                        function(e) {
                            e.preventDefault();
                            mt.resetpaginationandbind(t);
                        });
                } else {
                    consoleit("Kindly include Per Page input " + t.attr("data-perpage"));
                }
                return inputs;
            },
            initializeorderby: function(t, stn, inputs) {
                var mt = this;
                t.attr("data-binderorderinit", true);
                var orderbyt = $(stn.order);
                orderbyt.attr("data-jlorderby", stn.tid);
                if (!orderbyt.attr("id")) {
                    orderbyt.attr("id", "Id" + new Date().getTime());
                }
                var orderfieldinputid = "input_orderfield_" + orderbyt.attr("id") + "_" + stn.tid;
                var orderbyinputid = "input_orderby_" + orderbyt.attr("id") + "_" + stn.tid;
                if (!stn.orderfieldname) {
                    consoleit(
                        "Please add a 'data-orderfieldname' attribute for binder initialized element, It is required for sending your sort order field name (#" +
                        t.attr("id") +
                        ")");
                }
                if (!stn.orderbyname) {
                    consoleit(
                        "Please add a 'data-orderbyname' attribute for binder initialized element, It is required for sending your sort order name (#" +
                        t.attr("id") +
                        ")");
                }
                orderbyt.find("[data-orderbyfield]").css("cursor", "pointer");
                var orderbylist = orderbyt.find("[data-orderbyfield][data-orderbydefault]");
                if (orderbylist.length === 0) {
                    orderbylist = orderbyt.find("[data-orderbyfield]:first");
                }
                if (stn.orderbyascendingicon &&
                    orderbyt.find("[data-orderbyfield]").find("[data-orderbyascicon]")
                    .length ===
                    0) {
                    //    orderbyt.find("[data-orderbyfield]")[stn.orderbyiconinsertmethod](stn.orderbyascendingicon);
                }
                if (stn.orderbydescendingicon &&
                    orderbyt.find("[data-orderbyfield]").find("[data-orderbydescicon]")
                    .length ===
                    0) {
                    //   orderbyt.find("[data-orderbyfield]")[stn.orderbyiconinsertmethod](stn.orderbydescendingicon);
                }
                var firstone = orderbylist.first();
                stn.orderby = stn.orderby ? stn.orderby.toLowerCase() : stn.defaultorderby;
                // this.setorderbyicon(orderbyt);
                $("body").append('<input type="hidden" id="' +
                    orderfieldinputid +
                    '" name="' +
                    stn.orderfieldname +
                    '" value="' +
                    firstone.attr("data-orderbyfield") +
                    '" />');
                $("body").append('<input type="hidden" id="' +
                    orderbyinputid +
                    '" name="' +
                    stn.orderbyname +
                    '" value="' +
                    stn.orderby +
                    '" />');
                if (!t.attr(this.data.data_filterby)) {
                    t.attr(this.data.data_filterby, "");
                }
                t.attr(this.data.data_filterby,
                    t.attr(this.data.data_filterby) +
                    (t.attr(this.data.data_filterby) ? "," : "") +
                    "#" +
                    orderfieldinputid +
                    ",#" +
                    orderbyinputid);
                var orderfieldinput = $("#" + orderfieldinputid);
                var orderbyinput = $("#" + orderbyinputid);
                inputs = inputs.add(orderfieldinput).add(orderbyinput);
                this.bodyevent("click",
                    "[data-jlorderby='" + stn.tid + "'] [data-orderbyfield]",
                    function(e) {
                        e.preventDefault();
                        orderfieldinput.val($(this).attr("data-orderbyfield"));
                        if (!$(this).attr("data-orderby")) {
                            $(this).attr("data-orderby", "asc");
                        }
                        if ($(this).attr("data-orderby") == "asc") {
                            $(this).attr("data-orderby", "desc");
                        } else {
                            $(this).attr("data-orderby", "asc");
                        }
                        var orderbyvalue = $(this).attr("data-orderby");
                        orderbyinput.val(orderbyvalue);
                        // mt.setorderbyicon(orderbyt, $(this), orderbyvalue);
                        mt.resetpaginationandbind(t);
                    });
                return inputs;
            },
            setorderbyicon: function(allorderobjects, ordert, ordervalue) {
                allorderobjects.find("[data-orderbydescicon],[data-orderbyascicon]").hide();
                if (ordert && ordervalue) {
                    ordert.find("[data-orderby" + ordervalue + "icon]").show();
                }
            },
            initializescrollloader: function(t, stn, inputs, pageinputid) {

                t.attr("data-binderscrollloaderinit", true);
                pageinputid = "input_scroller_" + stn.tid;
                if ($("#" + pageinputid).length == 0) {
                    $("body").append('<input type="hidden" id="' +
                        pageinputid +
                        '" name="' +
                        stn.pageservername +
                        '"  value="' +
                        stn.pagestartswith +
                        '" />');
                }
                t.attr(this.data.data_filterby, t.attr(this.data.data_filterby) + ",#" + pageinputid);
                var scrollerpageinput = $("#" + pageinputid);
                inputs = inputs.add(scrollerpageinput);
                var scrollbyelement = $(window);
                var isscrollbyelement = false;
                var scrollbyelementselector = stn.scrollbyelement;
                if (stn.scrollbyelement) {

                    if (stn.scrollbyelement == "this") {
                        scrollbyelement = t;
                        scrollbyelementselector = "#" + stn.tid;
                    } else {
                        scrollbyelement = $(stn.scrollbyelement);
                    }
                    isscrollbyelement = true;
                }


                t.attr("data-jlpagecount", parseInt(scrollerpageinput.val()) + 1);

                this.windoworelementevent("scroll",
                    function(e) {


                        if (stn.scrollloader && !t.attr("data-disablescrollevents")) {

                            scrollbyelement.attr("data-lastscrolledupto", t[0].scrollHeight - (t.scrollTop()));

                            var currentpage;

                            if (stn.scrolldirection && stn.scrolldirection == "up") {

                                if (t.children(":visible").first().not("[data-jlscrollerhitted]").length > 0) {
                                    var childbottom = t.children(":visible").first().offset().top;
                                    currentpage = parseInt(scrollerpageinput.val());
                                    if (childbottom > -50 &&
                                        currentpage < parseInt(t.attr("data-jlpagecount"))) {
                                        scrollerpageinput.val(parseInt(scrollerpageinput.val()) + 1);
                                        if ($.active == 0) {
                                            t.children(":visible").first().attr("data-jlscrollerhitted", true);
                                            t.binder();
                                        }
                                    }
                                }

                            } else {
                                var top = (scrollbyelement.scrollTop() || $("body").scrollTop()) +
                                    (scrollbyelement.height() || $("body").height());
                                if (t.children(":visible").last().not("[data-jlscrollerhitted]").length > 0) {
                                    // -t.children(":visible").last().height()

                                    var childtop = t.children(":visible").last().offset().top -
                                        scrollbyelement.height();
                                    if (isscrollbyelement) {
                                        childtop = t.children(":visible").last().position().top -
                                            scrollbyelement.height();
                                    }
                                    currentpage = parseInt(scrollerpageinput.val());
                                    if (top > childtop && currentpage < parseInt(t.attr("data-jlpagecount"))) {
                                        scrollerpageinput.val(parseInt(scrollerpageinput.val()) + 1);
                                        if ($.active == 0) {
                                            t.children(":visible").last().attr("data-jlscrollerhitted", true);
                                            t.binder();
                                        }
                                    }
                                }
                            }
                        }

                    },
                    scrollbyelementselector);
                return inputs;
            },
            initscrollevent: function(t, eventname, dv, datas) {
                var fn = this;
                $(window).one(eventname,
                    function(e) {
                        var top = ($(window).scrollTop() || $("body").scrollTop()) +
                            ($(window).height() || $("body").height());
                        var elementtop = t.offset().top;
                        if (elementtop > top || elementtop == 0) {
                            fn.initscrollevent(t, eventname, dv, datas);
                        } else {
                            fn.binderinitialization(t, "data-binderinit-" + eventname, datas);
                        }
                    });
            },
            managescrollloading: function(t, properties) {
                if (t.attr(this.data.data_scrollloader)) {
                    ////var pagestartswith = parseInt(t.attr("data-pagestartswith"));
                    var pagesize = parseInt($(t.attr("data-perpage")).val());
                    var totalrows = parseInt(properties[t.attr("data-pagetotalrows")]);
                    t.attr("data-jlpagecount", Math.ceil(totalrows / pagesize));
                }
            },
            /***
             * pagination ends
             */
            /**
             * Bind Manager Work Flow
             */
            binderinitialization: function(t, attributename, datas) {
                if (t.attr(attributename)) {
                    $.each(datas,
                        function(canceli, cancelv) {
                            if (canceli.startsWith("data-binderinit")) {
                                t.removeAttr(canceli);
                            }
                        });
                    t.binder();
                }
            },
            initfn: function(t, datas) {
                try {
                    var fn = this;
                    var containsunwantedcharacters = false;
                    var initby = false;
                    $.each(datas,
                        function(di, dv) {
                            if (di.split("if").length == 1 && dv.split("{").length > 1) {
                                containsunwantedcharacters = true;

                            } else if (di.startsWith("data-binderinit") || di.startsWith("data-binderperminit")) {
                                //If there is an upcoming event or ajax request but you no need to block that request and bind after a custom event you can use it. It using for remove unwanted lists loading and improve page loading performance.
                                var pieces = di.split("-");
                                var eventname = pieces[2];
                                var initializewithoutelement = true;
                                if (t.attr("data-binderinitrequired") == true) {
                                    initializewithoutelement = false;
                                }
                                var allowinit = false;
                                if ($(dv).length > 0 || (dv == "window")) {
                                    allowinit = true;
                                } else {
                                    if (initializewithoutelement == true) {
                                        allowinit = true;
                                    }
                                }
                                if (pieces.length === 3 && allowinit) {
                                    $(dv).attr("data-initby-" + t.attr("id"));
                                    if (di.startsWith("data-binderperminit") &&
                                        !t.attr("data-binderperminitinitiated")) {
                                        initby = true;
                                        t.attr("data-binderperminitinitiated", true);
                                        $("body").on(eventname,
                                            dv,
                                            function(e) {
                                                if (t.attr("data-binderperminit-" + eventname)) {
                                                    t.binder();
                                                }
                                            });
                                    } else if (di.startsWith("data-binderinit")) {
                                        initby = true;
                                        if (eventname == "scroll") {
                                            fn.initscrollevent(t, eventname, dv, datas);
                                            $(window).trigger(eventname);
                                        } else {
                                            $("body").one(eventname,
                                                dv,
                                                function(e) {
                                                    fn.binderinitialization(t, "data-binderinit-" + eventname, datas);
                                                });
                                        }
                                    }
                                }
                            }
                        });
                    if (containsunwantedcharacters) {
                        initby = true;
                    }
                    return initby;
                } catch (e) {
                    return false;
                }
            },
            create: function(t, opt) {
                this.triggerevent(t, "beforeinitialize");
                var stn = $.extend({}, this.defaults);
                stn.tid = this.setid(t);

                this.setnoresults(t);
                var dataattributes = this.attr(t);
                if (typeof opt == "object") {
                    stn = $.extend(stn, opt);
                } else if (typeof opt == "string" && opt == "refresh") {
                    stn.refresh = true;
                }
                var datastn = this.getdataattributesforsettings(t, dataattributes);
                if (typeof datastn == "object") {
                    stn = $.extend(stn, datastn);
                }
                bindmanager.settings[stn.tid] = stn;
                stn.caching = ((stn.caching) && stn.caching === "true");
                if (this.initfn(t, dataattributes) === false) {
                    this.gettemplatedetails(t, stn.tid);
                    var inputs = this.getfilterbyinputs(t, stn.tid);
                    if (!t.attr("data-binderorderinit") && stn.order) {
                        inputs = this.initializeorderby(t, stn, inputs);
                    }
                    var pageinputid = "";
                    var pageinput;
                    if (!t.attr("data-binderperpageinit") && stn.perpage) {
                        inputs = this.initializeperpage(t, stn, inputs);
                    }
                    if (!t.attr("data-binderscrollloaderinit") && stn.scrollloader) {
                        inputs = this.initializescrollloader(t, stn, inputs, pageinputid);
                    }

                    if (!t.attr("data-binderpaginationinit") && stn.pagination) {
                        inputs = this.initializepagination(t, stn, inputs, pageinputid);
                    }
                    var paginationt;
                    if (stn.scrollloader && stn.pagination) {

                        paginationt = $(stn.pagination);
                        pageinputid = "input_" + paginationt.attr("id");
                        pageinput = $("#" + pageinputid).prop("disabled", true);
                    } else {
                        if (stn.scrollloader) {
                            pageinputid = "input_scroller_" + stn.tid;
                            pageinput = $("#" + pageinputid).prop("disabled", false);
                        }
                        if (stn.pagination) {
                            paginationt = $(stn.pagination);
                            pageinputid = "input_" + paginationt.attr("id");
                            pageinput = $("#" + pageinputid).prop("disabled", false);
                        }
                    }
                    if (!t.attr("data-binderinit")) {
                        this.setfilters(t, stn, inputs);
                    }
                    var valid = this.validaterequiredfilters(stn.tid);
                    if (valid) {
                        this.processrequest(t, stn, inputs, opt);
                    } else {
                        this.success(t, stn, []);
                    }
                    t.attr("data-binderinit", true);
                }
            },
            makepostdata: function(inputs) {
                var post = {};
                var filteredinputs = inputs.not(this.data.disabled);
                for (var inputi = 0; inputi < filteredinputs.length; inputi++) {
                    var th = $(filteredinputs[inputi]);
                    var tagtype = th.attr("type");
                    var name = th.attr("name");
                    if (th.attr(this.data.data_servername)) {
                        name = th.attr(this.data.data_servername);
                    }

                    if (th.attr(this.data.data_servernames)) {
                        var servernameieces = th.attr(this.data.data_servernames).split(",");
                        for (var servername in servernameieces) {
                            if (servernameieces.hasOwnProperty(servername)) {
                                var servernameobj = servernameieces[servername];
                                if (this.fetchvalue[tagtype]) {
                                    post[servernameobj] = this.fetchvalue[tagtype](th);
                                } else {
                                    post[servernameobj] = this.trimvalue(th);
                                }
                            }
                        }
                    }
                    if (name) {
                        if (this.fetchvalue[tagtype]) {
                            post[name] = this.fetchvalue[tagtype](th);
                        } else {
                            post[name] = this.trimvalue(th);
                        }
                    }
                }
                return post;
            },
            processrequest: function(t, stn, inputs, opt) {
                var mt = this;
                if (typeof stn.json == "string" && stn.json != "") {
                    var post = this.makepostdata(inputs);
                    if (!stn.requestmethod) {
                        stn.requestmethod = stn.defaultrequestmethod;
                    }
                    var uniquepost = stn.json + JSONstringify(post);
                    this.requesthandler(t,
                        stn.requestmethod,
                        stn.json,
                        post,
                        function() {
                            if (stn.caching) {
                                if (!stn.refresh &&
                                    bindmanager.cache[uniquepost] &&
                                    bindmanager.cache[uniquepost] !== "") {
                                    var data = $.extend({}, bindmanager.cache[uniquepost]);
                                    mt.triggerevent(t, "afterrequest", data);
                                    mt.success(t, stn, data);
                                    return true;
                                }
                                return false;
                            }
                            return false;
                        },
                        function(data) {
                            if (stn.caching) {
                                bindmanager.cache[uniquepost] = $.extend({}, data);
                            }
                            mt.triggerevent(t, "afterrequest", data);
                            mt.success(t, stn, data);
                        });
                } else {
                    if (typeof stn.json == "object") {
                        mt.success(t, stn, stn.json);
                    } else if (typeof opt == "object") {
                        mt.success(t, stn, opt);
                    }
                }
            },
            requesthandler: function(t, method, url, post, cachefn, fn, reqi) {
                if (!reqi) {
                    reqi = -1;
                }
                if (reqi < 10) {
                    if (!cachefn()) {
                        this.triggerevent(t, "beforerequest", post);
                        var mt = this;
                        if ($.active <= 1) {
                            t.attr("data-binderrequested", true);
                            $[method](url,
                                post,
                                fn
                            ).fail(function() {
                            });
                        } else {
                            setTimeout(function() {
                                    reqi++;
                                    mt.requesthandler(t, method, url, post, cachefn, fn, reqi);
                                },
                                100);
                        }
                    }
                }
            },
            success: function(t, stn, result) {
                var data = result;
                //Notify element that got result from server
                t.attr("data-bindersuccess", true);
                var triggerdataall = {
                    rows: data
                };
                if (!stn.nobind && stn.nobind !== true) {
                    if (stn.foreach) {
                        stn.dataobject = stn.foreach;
                    }
                    var objrows = stn.dataobject.split(",");
                    var foreachi = false;
                    if (stn.dataobject.split(" in ").length == 2) {
                        var objrowspieces = stn.dataobject.split(" in ");
                        objrows = [objrowspieces[1]];
                        foreachi = objrowspieces[0];
                    }
                    var rowsobject = this.finddatarows(objrows, data);
                    var rows = rowsobject;
                    if (stn.objecttoarray) {
                        rows = [rowsobject];
                    }

                    var allowedinputs = this.data.inputs.split(",");
                    var templatedetailsobj = this.gettemplatedetails(t, stn.tid, stn.dynamicinsert);
                    var html = templatedetailsobj.html;
                    //ch.attr(kv.data_follow, true);
                    var parenttag = t.prop("tagName").toLowerCase();
                    /**
                     * Following elements excluded from current binding
                     * inner [data-json] elements,[data-subjson] elements,[data-static-free] elements
                     * [data-static-free] elements only using for [data-static] elements and if not used it binder will show static elemetns before bind results.
                     */
                    var excludedelements = t.find("[data-json],[data-subjson],[data-pagination]")
                        .find(templatedetailsobj.nochange);
                    var nochangeobj = t.find(templatedetailsobj.nochange).not(excludedelements);
                    var dynamicobj = templatedetailsobj.nochangedchildrens;
                    nochangeobj.hide();
                    /**
                     * Show all static elements before binding results
                     * To avoid show static elements use data-static-free="true" attribute in static element
                     */
                    t.find("[" + this.data.data_static + "]:not([data-static-free])").not(excludedelements).show();
                    var followedelements = t.find("[" + this.data.data_follow + "]").not(excludedelements);
                    if (followedelements.length > 1) {
                        followedelements.show();
                    }
                    var paginationt;
                    var pageinputid;
                    var pagestartswith;
                    if (t.attr("data-pagestartswith")) {
                        pagestartswith = parseInt(t.attr("data-pagestartswith"));
                    }
                    var isbindingfreshdata = false;
                    if (!stn.uniquekey) {
                        if (!stn.scrollloader) {
                            if (!stn.pagination && stn.dynamicinsert) {
                                t.find("[data-dynamicrows]").not(excludedelements).remove();
                            } else {
                                dynamicobj.remove();
                                isbindingfreshdata = true;
                            }
                        } else {
                            t.attr("data-jlpagecount", 0);
                            if ($("#input_scroller_" + this.setid(t)).val() == pagestartswith) {
                                dynamicobj.remove();
                                isbindingfreshdata = true;
                            }
                        }
                    } else {
                        dynamicobj.attr("data-uniquerowsvalid", false);
                    }
                    var totalrowsperpage = rows ? rows.length : 0;


                    if (rows && totalrowsperpage != 0) {
                        var pagevalue;
                        var pageinput;
                        var pagesize;
                        if (t.attr(this.data.data_pagination)) {
                            paginationt = $(t.attr(this.data.data_pagination));
                            pageinputid = "input_" + paginationt.attr("id");
                            pageinput = $("#" + pageinputid);
                            pagevalue = parseInt(pageinput.val());
                            pagesize = parseInt($(stn.perpage).val());
                        }
                        this.triggerevent(t, "beforeappendcomplete", triggerdataall);
                        var kv = this.data;
                        var mt = this;

                        if (totalrowsperpage > 0 || typeof rows == "object") {
                            var properties = "";
                            var rowindex;
                            var rowobject;
                            var loopindex = 0;

                            var isArray = false;
                            if (totalrowsperpage > 0) {
                                isArray = true;
                            }

                            for (rowindex in rows) {
                                if (rows.hasOwnProperty(rowindex) && (!isArray || isNaN(rowindex) == false)) {
                                    rowobject = rows[rowindex];
                                    if (rowobject != null) {
                                        loopindex++;
                                        this.loopandsetvalues(t,
                                            stn,
                                            loopindex,
                                            totalrowsperpage,
                                            rowindex,
                                            rowobject,
                                            foreachi,
                                            allowedinputs,
                                            excludedelements,
                                            templatedetailsobj,
                                            html,
                                            parenttag,
                                            pagesize,
                                            pagevalue,
                                            isbindingfreshdata);
                                    }
                                }
                            }


                            if (parenttag == "select" && !t.attr("data-disablevalue")) {
                                this.applydropdownbasedfunctionalities(t);
                            }

                            var datatrigger = t.attr("data-trigger");
                            if (datatrigger) {
                                this.triggerevent(t, datatrigger);
                            }
                            properties = $.extend(data, rows[0]);
                            this.managepagination(kv, t, stn, properties).managescrollloading(t, properties);
                            mt.autofn($("body"), t, properties);
                        } else {
                            this.showhideboxes(t);
                        }
                    } else {
                        this.showhideboxes(t);
                    }
                }
                this.triggerevent(t, "afterappendcomplete", triggerdataall);
                //Find all grand childrens
                var grandchildrenrows = this.grandchildren(t, "[data-json]");
                //Checking not inactive json elements and also not child elements of allowed elements
                var allowedjsontoinit =
                    t.find(
                            "[data-json]:not([data-parent],[data-parent],[data-binderrequested],[data-bindersuccess],[data-isactive=false])")
                        .not(grandchildrenrows);
                if (allowedjsontoinit.length > 0) {
                    allowedjsontoinit.binder();
                }
                //Only supported id
                $("[data-parent='#" + stn.tid + "'][data-json]").binder();
                if ($.active <= 1) {
                    $('[id]').each(function() {
                        if ($("[id='" + $(this).attr("id") + "']").length > 1) {
                            ////consoleit("Dulpicate id found this will make issues if it is used in binder - '" +
                            ////    $(this).attr("id") +
                            ////    "'",
                            ////    "e");
                        }
                    });
                }
            },
            loopandsetvalues: function(t,
                stn,
                loopindex,
                totalrowsperpage,
                rowindex,
                rowobject,
                foreachi,
                allowedinputs,
                excludedelements,
                templatedetailsobj,
                html,
                parenttag,
                pagesize,
                pagevalue,
                isbindingfreshdata) {
                var tempvalue, triggerdatarow, triggerdata;
                if (typeof rowobject != "object") {
                    tempvalue = rowobject;
                    rowobject = {};
                    rowobject.jlvalue = tempvalue;
                }
                if (t.attr(this.data.data_pagination)) {
                    rowobject.pagesize = pagesize;
                    rowobject.pagenumber = pagevalue;
                }
                rowobject.jlindex = rowindex;
                rowobject.jlrownumber = loopindex + 1;
                triggerdatarow = {
                    key: rowindex,
                    value: rowobject
                };
                var subjsonrows = [];
                /**
                 * template variable is contains the html object of followable html template row
                 */
                var template = this.wrapwithparent(parenttag, html);
                excludedelements =
                    t.find("[data-json],[data-subjson],[data-pagination]").find(templatedetailsobj.nochange);
                /**
                 * If a form have an edit view and add view the jlbinder fill data on it without remove the rows
                 * also it will show the row if there have no data.
                 * So user can enter new data on it.
                 * if found a single row from json jlbinder will fill its values
                 * Its happened when add data-static and data-follow to a row element
                 */
                var staticfollowtemplate = t.find("[" + this.data.data_follow + "][" + this.data.data_static + "]")
                    .not(excludedelements);
                var followhtml = t.find("[" + this.data.data_follow + "]").not(excludedelements);
                if (staticfollowtemplate.length == 1) {
                    template = staticfollowtemplate;
                } else if (followhtml.eq(0).length > 0) {
                    template = this.wrapwithparent(parenttag, followhtml.eq(0)[0].outerHTML);
                    // followhtml.eq(rowindex).remove();
                }
                var excludedblocks = template.find("[data-json],[data-subjson],[data-pagination]");
                excludedelements = excludedblocks
                    .find(templatedetailsobj.nochange);
                var followedelements = template.find("[" + this.data.data_follow + "]").not(excludedelements);
                followedelements.removeAttr(this.data.data_follow);
                this.triggerevent(t, "beforeappendrow", triggerdatarow);


                for (var key in rowobject) {
                    if (rowobject.hasOwnProperty(key)) {
                        if (key == "IsValidateBrand") {

                        }
                        var value = rowobject[key];
                        if (foreachi) {
                            var templatehtml = template.html();
                            var replace = "{" + foreachi + "." + key + "}";
                            var re = new RegExp(replace, "gmi");
                            templatehtml = templatehtml.replace(re, value);
                            template = this.wrapwithparent(parenttag, templatehtml);
                        }
                        if (stn.dynamicinsert) {
                            template.children().attr(this.data.data_dynamicrows, true);
                        }
                        if (template.find("[data-subjson='" + key + "']").length > 0) {
                            subjsonrows.push({ key: key, value: value });
                        }
                        ////var externalsubjsonelements = $("[data-subjson='" + key + "'][data-parent='#" + stn.tid + "']");
                        ////if (externalsubjsonelements.length > 0) {
                        ////    for (var extsubi = 0; extsubi < externalsubjsonelements.length; extsubi++) {
                        ////        var extth = $(externalsubjsonelements[extsubi]);
                        ////        var extvalue = this.textautofn(this.attr(extth), value, extth);
                        ////        extth.binder({ json: { Rows: extvalue } });
                        ////    }
                        ////}

                        var htmlelements = template.find("." +
                            key +
                            ",#" +
                            key +
                            ",[name='" +
                            key +
                            "'],[data-key='" +
                            key +
                            "'],[data-jsonkey='" +
                            key +
                            "']");
                        var attrelements = template.find("[data-" +
                            key.toLowerCase() +
                            "-inline],[data-inline-" +
                            key.toLowerCase() +
                            "],[data-" +
                            key.toLowerCase() +
                            "-attr],[data-attr-" +
                            key.toLowerCase() +
                            "],[data-" +
                            key.toLowerCase() +
                            "-if],[data-if-" +
                            key.toLowerCase() +
                            "],[data-attr-" +
                            key.toLowerCase() +
                            "-if],[data-attr-if-" +
                            key.toLowerCase() +
                            "]");
                        var obj = htmlelements.add(attrelements);
                        var disabledelements = template.find("[data-" +
                            key.toLowerCase() +
                            "-disable],[data-disable-" +
                            key.toLowerCase() +
                            "],[data-disablejlbind]");
                        obj = obj.not(disabledelements);
                        triggerdata = {
                            key: key,
                            value: value
                        };
                        this.triggerevent(obj, "beforeappend", triggerdata);
                        var commentobj = this.getcommentobj(template.children());
                        if (commentobj.length > 0) {
                            $.each(commentobj,
                                function(cmi, cmv) {
                                    if (cmv !== false) {
                                        var parentname = cmv.next().parent().prop("tagName");
                                        var bindobj =
                                            $("<" +
                                                parentname +
                                                " " +
                                                cmv[0].nodeValue +
                                                ">" +
                                                cmv.next()[0].outerHTML +
                                                "</" +
                                                parentname +
                                                ">");
                                        if (bindobj.attr("data-subjson") ==
                                            key) {
                                            // subjsonrows.push({ key: key, value: value, commentobj: cmv });
                                            bindobj.binder({ json: { Rows: value } });
                                            cmv.next().after(bindobj.html());
                                            cmv.next().remove();
                                        }
                                    }
                                });
                        }
                        tempvalue = value;
                        for (var obji = 0; obji < obj.length; obji++) {

                            var tobj = $(obj[obji]);
                            value = tempvalue;
                            var attributes = this.attr(tobj);
                            value = this.textautofn(attributes, value, tobj);
                            value = this.applydatefunctionalitybyattributes(attributes, key, value);
                            this.applyfunctionalitybasedonattributes(attributes, tobj, key, value);

                            if (htmlelements.length > 0 &&
                                htmlelements.not(tobj).length != htmlelements.length) {
                                var tagname = tobj.prop("tagName").toLowerCase();
                                if ($.inArray(tagname, allowedinputs) !== -1) {
                                    if (typeof value === "boolean") {
                                        value = value.toString();
                                    }
                                    tobj.val(value).attr("data-jlvalue", value);
                                    if (tagname === "select") {
                                        tobj.attr(this.data.data_value, value);
                                        if (value !== "") {
                                            if (tobj.find('option[value="' + value + '"]').length ==
                                                0) {
                                                tobj.find("option:not([data-follow])").first()
                                                    .prop("selected", true);
                                            }
                                        }
                                    }
                                    var trigger = tobj.attr("data-trigger");
                                    if (trigger) {
                                        this.triggerevent(tobj, trigger);
                                    }
                                } else {
                                    if (typeof value === "boolean") {
                                        tobj.html(value.toString());
                                    } else {
                                        tobj.html(value);
                                    }
                                }
                            }
                            triggerdata = {
                                index: key,
                                value: value
                            };
                            this.triggerevent(tobj, "afterappend", triggerdata); //TODO Its not working
                        }
                    }
                };
                var wrapper = t;
                if (staticfollowtemplate.length == 1) {
                } else if (followhtml.eq(0).length > 0) {
                    followhtml.eq(0).after(template.html());
                    followhtml.eq(0).remove();
                    this.bringvalues(t);
                } else if (staticfollowtemplate.length == 0 &&
                    (staticfollowtemplate.eq(loopindex).length == 0)) {
                    if (stn.uniquekey && rowobject[stn.uniquekey]) {
                        /**
                         * This function not work properly with sorting data
                         * This static template already binded by jlbinder and reusing it by find use uniquekey 
                         * 
                         */
                        var exthtml = t.find("[data-jluniquekeyvalue='" + rowobject[stn.uniquekey] + "']");

                        if (exthtml.length > 0) {

                            if (exthtml[0].outerHTML === template.html()) {
                                exthtml.show();
                            } else {
                                exthtml.replaceWith(template.html());
                            }
                        } else {
                            followedelements.attr("data-jluniquekeyvalue", rowobject[stn.uniquekey]);
                        }
                        exthtml.attr("data-uniquerowsvalid", true);

                    }


                    if (bindmanager.htmltemplatewrappers[stn.tid] &&
                        bindmanager.htmltemplatewrappers[stn.tid].length > 0) {

                        for (var ti = 0; ti < bindmanager.htmltemplatewrappers[stn.tid].length; ti++) {
                            var wrapperobj = bindmanager.htmltemplatewrappers[stn.tid][ti];
                            var allowappend = false;
                            var lastappenedwrapper = t.find("[data-wrapperlevel=" + ti + "]:last");
                            if (lastappenedwrapper.length > 0) {
                                var excludedjlelements = t.find("[data-json],[data-subjson],[data-pagination]")
                                    .find("[data-jlelements]");
                                var jlelements = lastappenedwrapper.find("[data-jlelements]").not(excludedjlelements);
                                if (jlelements.length == wrapperobj.count) {
                                    allowappend = true;
                                } else {
                                    wrapper = lastappenedwrapper;
                                }
                            } else {
                                allowappend = true;
                            }
                            if (allowappend) {
                                wrapper.append(wrapperobj.html);
                                wrapper = t.find("[data-wrapfollow]").last();
                            }
                        }

                    }

                    var templateoutput = template.html();

                    if (stn.bindmethod) {
                        wrapper[stn.bindmethod](templateoutput);
                    } else {
                        wrapper.append(templateoutput);
                    }

                    if (stn.scrolldirection == "up") {
                        t.attr("data-disablescrollevents", true);

                        var scrollto = t.attr("data-lastscrolledupto");
                        if (!scrollto) {
                            scrollto = 0;
                        }

                        setTimeout(function() {

                                var lastbottomposition = t[0].scrollHeight - scrollto;

                                t.scrollTop(lastbottomposition);
                                if (totalrowsperpage == loopindex) {
                                    t.removeAttr("data-disablescrollevents");
                                }
                            },
                            500);


                    }
                    this.bringvalues(t);
                }
                var lastrow;
                if (stn.bindmethod) {
                    lastrow = wrapper.children().first();
                } else {

                    lastrow = wrapper.children().last();
                }

                lastrow.not("[data-isactive=false]").show().attr("data-jlelements", true);
                triggerdatarow = {
                    key: rowindex,
                    value: rowobject,
                    row: lastrow
                };
                this.triggerevent(lastrow, "afterappendrow", triggerdatarow);
                for (var ji = 0; ji < subjsonrows.length; ji++) {
                    var jv = subjsonrows[ji];
                    var subjsonelements = lastrow.find("[data-subjson='" + jv.key + "']");
                    if (subjsonelements.length > 0) {
                        for (var subi = 0; subi < subjsonelements.length; subi++) {
                            var th = $(subjsonelements[subi]);
                            jv.value = this.textautofn(this.attr(th), jv.value, th);
                            th.binder({ json: { Rows: jv.value } });
                        }
                    }
                }
            },
            showhideboxes: function(t) {
                var grandchildrens = t.find("[" + this.data.data_json + "] [" + this.data.data_noresult + "]");
                t.find("[" + this.data.data_noresult + "]").not(grandchildrens).show();
                if (t.attr("data-method-show")) {
                    $(t.attr("data-method-show")).hide();
                }
                if (t.attr("data-method-hide")) {
                    $(t.attr("data-method-hide")).show();
                }
            },
            /**
              * Bind Manager Work Flow Ends
              */
        };
        $.fn.binder.methods.data = {
            inputs: "input,select,textarea,button",
            disabled: "[disabled]",
            data_json: "data-json",
            data_filterby: "data-filterby",
            data_filterby_required: "data-filterby-required",
            data_noresult: "data-noresult",
            data_static: "data-static",
            data_follow: "data-follow",
            data_form: "data-form",
            data_pagination: "data-pagination",
            data_scrollloader: "data-scrollloader",
            data_scrollbyelement: "data-scrollbyelement",
            data_perpage: "data-perpage",
            data_servername: "data-servername",
            data_servernames: "data-servernames",
            data_value: "data-value",
            data_showingpagefrom: "data-showingpagefrom",
            data_showingpageto: "data-showingpageto",
            data_dynamicrows: "data-dynamicrows"
        };
        //Reference go to https://docs.microsoft.com/en-us/dotnet/standard/base-types/custom-date-and-time-format-strings
        window.jlfn = $.fn.binder.methods;
        $.fn.binder.methods.date = {
            now: function() {
                return new Date().getTime();
            },
            format: {
                days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                months: [
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
                    "November",
                    "December"
                ],
                d: function(dv, dd, date) {
                    return parseInt(dd[2]);
                },
                dd: function(dv, dd, date) {
                    return dd[2];
                },
                ddd: function(dv, dd, date) {
                    return date.getDay();
                },
                D: function(dv, dd, date) {
                    return dd[0];
                },
                DD: function(dv, dd, date) {
                    return this.days[date.getDay()];
                },
                dddd: function(dv, dd, date) {
                    return this.days[date.getDay()];
                },
                M: function(dv, dd, date) {
                    return (date.getMonth() + 1);
                },
                MM: function(dv, dd, date) {
                    return ("0" + (date.getMonth() + 1)).slice(-2);
                },
                MMM: function(dv, dd, date) {
                    return dd[1];
                },
                MMMM: function(dv, dd, date) {
                    return this.months[date.getMonth()];
                },
                twelvehours: function(date) {
                    return (date.getHours() > 12) ? date.getHours() - 12 : date.getHours();
                },
                h: function(dv, dd, date) {
                    return this.twelvehours(date);
                },
                hh: function(dv, dd, date) {
                    return ("0" + this.twelvehours(date)).slice(-2);
                },
                H: function(dv, dd, date) {
                    return date.getHours();
                },
                HH: function(dv, dd, date) {
                    return ("0" + date.getHours()).slice(-2);
                },
                m: function(dv, dd, date) {
                    return date.getMinutes();
                },
                mm: function(dv, dd, date) {
                    return ("0" + date.getMinutes()).slice(-2);
                },
                s: function(dv, dd, date) {
                    return date.getSeconds();
                },
                ss: function(dv, dd, date) {
                    return ("0" + date.getSeconds()).slice(-2);
                },
                y: function(dv, dd, date) {
                    return dd[3].slice(-1);
                },
                yy: function(dv, dd, date) {
                    return dd[3].slice(-2);
                },
                yyy: function(dv, dd, date) {
                    return dd[3].slice(-3);
                },
                yyyy: function(dv, dd, date) {
                    return dd[3];
                },
                tt: function(dv, dd, date) {
                    return (date.getHours() >= 12) ? "pm" : "am";
                },
                TT: function(dv, dd, date) {
                    return (date.getHours() >= 12) ? "PM" : "AM";
                }
            },
            dateto: function(pattern, date) {
                var regex = /(\/)|( )|(:)|(,)|(\|)|(\+)|(-)/g;
                var splitpattern = pattern.split(regex);
                var dd = (date + date.toLocaleTimeString()).split(" ");
                var t = this;
                var string = "";
                $.each(splitpattern,
                    function(d, dv) {
                        if (dv && t.format[dv]) {
                            var datevalue = t.format[dv](dv, dd, date);
                            pattern = pattern.replace(dv, datevalue);
                            var pieces = pattern.split(datevalue);
                            string += pieces[0] + datevalue;
                            pieces = pieces.splice(1, pieces.length);
                            pattern = pieces.join(datevalue);
                        }
                    });
                return string;
            },
            formatdate: function(key, value, attributevalue) {
                var date = this.jsontodate(key, value);
                date = this.dateto(attributevalue, date);
                return date;
            },
            utctolocal: function(key, value, attributevalue) {

                var date = this.jsontodate(key, value);
                //// var datestring = date.toLocaleDateString() + " " + date.toLocaleTimeString() + ' UTC';
                //// date = new Date(datestring);
                date = this.dateto(attributevalue, date);
                return date;
            },
            jsontodate: function(key, value, attributevalue) {
                try {
                    if (value && value.toLowerCase().split("date").length > 1) {
                        return new Date(parseInt(value.substr(6)));
                    } else {
                        return new Date(value);
                    }
                } catch (e) {
                    return "";
                }
            }
        };
        $.fn.binder.methods.defaults = {
            dynamicrowstext: "new",
            dynamicrowsvalue: -1,
            json: "",
            defaultorderby: "desc",
            defaultrequestmethod: "post",
            dataobject: "Rows,Data,rows,Results",
            paginationmaxcolumns: 20,
            orderbyascendingicon:
                '<span class="fa fa-sort-asc table-sort" data-orderbyascicon="true" aria-hidden="true"></span>',
            orderbydescendingicon:
                '<span class="fa fa-sort-desc table-sort" data-orderbydescicon="true" aria-hidden="true"></span>',
            orderbyiconinsertmethod: "append"
        };
        //hide all elements which not yet initialized
        $("body").append("<style>.binderhideonload[data-json]:not([data-binderinit]){ display:none; }</style>");
        $(window).on("load",
            function() {
                jlbinderwindowloaded = true;
            });

        $(document).ready(function() {
            setTimeout(function() {
                    jlbinderwindowloaded = true;
                },
                2000);
            $("[data-json]:visible,[data-json]:hidden").not("[data-parent],[data-template]").binder();
            $("body").on("click",
                "[data-show]",
                function() {
                    $($(this).attr("data-show")).show();
                });
            $("body").on("click",
                "[data-hide]",
                function() {
                    $($(this).attr("data-hide")).hide();
                });
            $("body").on("click",
                "[data-toggle]",
                function() {
                    $($(this).attr("data-toggle")).toggle();
                });

            var fneventsallowed = ["click", "change", "keyup", "keydown", "blur"];


            $.each(fneventsallowed,
                function(fni, fnv) {
                    $("body").on(fnv,
                        "data-fn-" + fnv,
                        function(e) {
                            var fntodo = $(this).attr("data-fn-" + fnv);
                            jlfn.gotoprocess(fntodo, $(this));


                        });
                });


        });


    })((window.jQueryAlt) ? window.jQueryAlt : (window.jQuery) ? window.jQuery : null);