/*
MIT License
Copyright (c) 2017 JavscriptLab https://github.com/JavscriptLab
*/
"use strict";
///(function($) {
var bindmanager = {};
bindmanager.cache = {};
bindmanager.htmltemplates = {};
var jf = $.fn;
$.binder = {
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
    attr: function(t) {
        var obj = {};
        $.each(t[0].attributes,
            function() {
                if (this.specified) {
                    obj[this.name] = this.value;
                }
            });
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
    $.fn.binder.methods.initfn($(t));
};

function consoleit(msg) {
    console.log(msg);
}

function JSONstringify(str) {
    var obj = "";
    try {
        obj = JSON.stringify(str);
    } catch (e) {
        return "";
    }
    return obj;
}

function JSONparse(str) {
    var obj = "";
    try {
        obj = $.parseJSON(str);
    } catch (e) {
        return "";
    }
    return obj;
}

function IsJsonString(str) {
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
    setid: function(el) {
        if (!el.attr("id")) {
            el.attr("id", "Id" + new Date().getTime());
        }
        return el.attr("id");
    },
    ////Major Functions
    bodyevent: function(events, elements, callback) {
        $("body").on(events, elements, callback);
    },
    resetpaginationandbind: function(t) {
        this.resetpagination(t);
        t.binder();
    },
    setfilterevent: function(t, events, attributename, tid) {
        var mt = this;
        this.bodyevent(events,
            "[data-on" + attributename + "filter" + tid + "=true]",
            function() {
                mt.resetpaginationandbind(t);
            });
    },
    windowevent: function(events, callback) {
        $(window).on(events, callback);
    },
    setresponsiveonresize: function(t, events) {
        var mt = this;
        this.windowevent(events,
            function() {
                mt.responsivepagination(t);
            });
    },
    attributevaluetoobject: function(t, attributename) {
        return $(t.attr(attributename));
    },
    getfilterbyinputs: function(t, tid) {
        var postsinputs = this.attributevaluetoobject(t, this.data.data_filterby);
        var requiredinputs = this.attributevaluetoobject(t, this.data.data_filterby_required);
        var inputs = null;
        try {
            var inputsrequired = requiredinputs.add(requiredinputs.find(this.data.inputs));
            $("[data-requiredonfilter" + tid + "]").removeAttr("data-requiredonfilter" + tid);
            inputsrequired.attr("data-requiredonfilter" + tid, true);
            inputs = postsinputs.add(postsinputs.find(this.data.inputs)).add(inputsrequired);
        } catch (e) {
            console.log("Your filtered inputs for #" + tid + " are not valid");
            return false;
        }
        return inputs;
    },
    attrselector: function(attribute) {
        return "[" + attribute + "]";
    },
    setnoresults: function(t) {
        t.find(this.attrselector(this.data.data_noresult)).hide();
    },
    getdataattributes: function(t) {
        var obj = {};
        var attributes = this.attr(t);
        for (var attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                if (attribute.startsWith("data-")) {
                    obj[attribute.replace("data-", "").replace(/-/ig, "_")] = attributes[attribute];
                }
            }
        }
        return obj;
    },
    setorderbyicon: function (allorderobjects,ordert,ordervalue) {
        allorderobjects.find("[data-orderbydescicon],[data-orderbyascicon]").hide();
        if (ordert&&ordervalue) {
            ordert.find("[data-orderby" + ordervalue + "icon]").show();
        }
    },
    create: function(t, opt) {
        t.trigger("beforeinitialize");
        var tid = this.setid(t);
        var mt = this;
        var stn = $.extend({}, this.defaults);
        this.gettemplatedetails(t, tid);
        this.setnoresults(t);
        if (this.initfn(t) === false) {
            if (typeof opt == "object") {
                stn = $.extend(stn, opt);
            }
            var datastn = this.getdataattributes(t);
            if (typeof datastn == "object") {
                stn = $.extend(stn, datastn);
            }
            var caching = ((stn.caching) && stn.caching === "true");
            var inputs = this.getfilterbyinputs(t, tid);
            if (!t.attr("data-binderorderinit") && t.attr("data-order")) {
                t.attr("data-binderorderinit", true);
                var orderbyt = $(t.attr("data-order"));
                orderbyt.attr("data-jlorderby", tid);
                if (!orderbyt.attr("id")) {
                    orderbyt.attr("id", "Id" + new Date().getTime());
                }
                var orderfieldinputid = "input_orderfield_" + orderbyt.attr("id");
                var orderbyinputid = "input_orderby_" + orderbyt.attr("id");
                var orderfieldservername = t.attr("data-orderfieldname");
                var ordername = t.attr("data-orderbyname");
                if (!orderfieldservername) {
                    console.log(
                        "Please add a 'data-orderfieldname' attribute for binder initialized element, It is required for sending your sort order field name (#" +
                        t.attr("id") + ")");
                }
                if (!ordername) {
                    console.log(
                        "Please add a 'data-orderbyname' attribute for binder initialized element, It is required for sending your sort order name (#" +
                        t.attr("id") + ")");
                }
                orderbyt.find("[data-orderbyfield]").css("cursor", "pointer");
                var orderbylist = orderbyt.find("[data-orderbyfield][data-orderbydefault]");
                if (orderbylist.length == 0) {
                    orderbylist = orderbyt.find("[data-orderbyfield]:first");
                }
                if (stn.orderbyascendingicon && orderbyt.find("[data-orderbyfield]").find("[data-orderbyascicon]").length == 0) {
                //    orderbyt.find("[data-orderbyfield]")[stn.orderbyiconinsertmethod](stn.orderbyascendingicon);
                }
                if (stn.orderbydescendingicon && orderbyt.find("[data-orderbyfield]").find("[data-orderbydescicon]").length == 0) {
                 //   orderbyt.find("[data-orderbyfield]")[stn.orderbyiconinsertmethod](stn.orderbydescendingicon);
                }
              
                var firstone = orderbylist.first();
                var orderbyvalue = firstone.attr("data-orderby");
                orderbyvalue = orderbyvalue ? orderbyvalue.toLowerCase() : "desc";
               // this.setorderbyicon(orderbyt);

                $("body").append('<input type="hidden" id="' + orderfieldinputid + '" name="' +
                    orderfieldservername +
                    '" value="' + firstone.attr("data-orderbyfield") + '" />');
                $("body").append('<input type="hidden" id="' + orderbyinputid + '" name="' + ordername +
                    '" value="' + orderbyvalue + '" />');
                t.attr(this.data.data_filterby,
                    t.attr(this.data.data_filterby) + (t.attr(this.data.data_filterby) ? "," : "") + "#" +
                    orderfieldinputid +
                    ",#" + orderbyinputid);
                var orderfieldinput = $("#" + orderfieldinputid);
                var orderbyinput = $("#" + orderbyinputid);
                inputs = inputs.add(orderfieldinput).add(orderbyinput);
                this.bodyevent("click",
                    "[data-jlorderby='" + tid + "'] [data-orderbyfield]",
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
            }
            var pageinputid;
            var pagestartswith;
            var servername;
            var pageinput;
            if (!t.attr("data-binderperpageinit") && t.attr("data-perpage")) {
                t.attr("data-binderperpageinit", true);
                var perpaget = $(t.attr("data-perpage"));
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
            }
            if (!t.attr("data-binderscrollloaderinit") && t.attr(this.data.data_scrollloader)) {
                t.attr("data-binderscrollloaderinit", true);
                pageinputid = "input_scroller_" + tid;
                pagestartswith = t.attr("data-pagestartswith");
                servername = t.attr("data-pageservername");
                if ($("#" + pageinputid).length == 0) {
                    $("body").append('<input type="hidden" id="' + pageinputid + '" name="' + servername +
                        '"  value="' +
                        pagestartswith + '" />');
                }
                t.attr(this.data.data_filterby, t.attr(this.data.data_filterby) + ",#" + pageinputid);
                var scrollerpageinput = $("#" + pageinputid);
                inputs = inputs.add(scrollerpageinput);
                var scrollloaderattribute = this.data.data_scrollloader;
                t.attr("data-jlpagecount", parseInt(scrollerpageinput.val()) + 1);
                this.windowevent("scroll",
                    function(e) {
                        if (t.attr(scrollloaderattribute)) {
                            var top = ($(window).scrollTop() || $("body").scrollTop()) +
                                ($(window).height() || $("body").height());
                            if (t.children(":visible").last().not("[data-jlscrollerhitted]").length > 0) {
                                // -t.children(":visible").last().height()
                                var childtop = t.children(":visible").last().offset().top - $(window).height();
                                var currentpage = parseInt(scrollerpageinput.val());
                                if (top > childtop && currentpage < parseInt(t.attr("data-jlpagecount"))) {
                                    scrollerpageinput.val(parseInt(scrollerpageinput.val()) + 1);
                                    if ($.active == 0) {
                                        t.children(":visible").last().attr("data-jlscrollerhitted", true);
                                        t.binder();
                                    }
                                }
                            }
                        }
                    });
            }
            var paginationt;
            if (!t.attr("data-binderpaginationinit") && t.attr(this.data.data_pagination)) {
                t.attr("data-binderpaginationinit", true);
                paginationt = $(t.attr(this.data.data_pagination));
                if (!paginationt.attr("id")) {
                    paginationt.attr("id", "Id" + new Date().getTime());
                }
                pageinputid = "input_" + paginationt.attr("id");
                servername = t.attr("data-pageservername");
                paginationt.children().attr("data-jlpages", true);
                paginationt.attr("data-jlid", tid);
                if (!servername) {
                    console.log(
                        "Please add a 'data-pageservername' attribute for binder initialized element, It is required for sending your page number field name (#" +
                        t.attr("id") + ")");
                }
                pagestartswith = t.attr("data-pagestartswith");
                if ($("#" + pageinputid).length == 0) {
                    $("body").append('<input type="hidden" id="' + pageinputid + '" name="' + servername +
                        '"  value="' +
                        pagestartswith + '" />');
                }
                t.attr(this.data.data_filterby, t.attr(this.data.data_filterby) + ",#" + pageinputid);
                pageinput = $("#" + pageinputid);
                inputs = inputs.add(pageinput);
                $("body").on("click",
                    "[data-jlid='" + tid + "'] [data-jlpages]",
                    function(e) {
                        e.preventDefault();
                        $(this).parent().children().removeClass("active disabled");
                        if ($(this).attr("data-previos")) {
                            pageinput.val(parseInt(pageinput.val()) - 1);
                        } else if ($(this).attr("data-next")) {
                            pageinput.val(parseInt(pageinput.val()) + 1);
                        } else if ($(this).attr("data-first")) { //ToDo
                            pageinput.val(pagestartswith);
                        } else if ($(this).attr("data-last")) { //ToDo
                            pageinput.val(0);
                        } else if ($(this).attr("data-nextrow")) {
                            var nextli = paginationt.find(".jlvisiblepage[data-autocreated]:last").next();
                            pageinput.val(nextli.find("[data-pagenumber]").attr("data-pagenumber"));
                        } else if ($(this).attr("data-previosrow")) {
                            var prevli = paginationt.find(".jlvisiblepage[data-autocreated]:first").prev();
                            pageinput.val(prevli.find("[data-pagenumber]").attr("data-pagenumber"));
                        } else {
                            var pageno = 0;
                            if ($(this).find("[data-pagenumber]").length > 0) {
                                pageno = $(this).find("[data-pagenumber]").attr("data-pagenumber");
                            } else {
                                pageno = $(this).attr("data-pagenumber");
                            }
                            pageinput.val(pageno);
                        }
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
                    });
            }
            if (t.attr(this.data.data_scrollloader) && t.attr(this.data.data_pagination)) {
                paginationt = $(t.attr(this.data.data_pagination));
                pageinputid = "input_" + paginationt.attr("id");
                pageinput = $("#" + pageinputid).prop("disabled", true);
            } else {
                pageinput = $("#" + pageinputid).prop("disabled", false);
            }
            if (!t.attr("data-binderinit")) {
                this.setfilterevent(t, "change blur", "change", tid);
                this.setfilterevent(t, "click", "reset", tid);
                this.setresponsiveonresize(t, "resize");
                var button = inputs.filter(function() {
                    return ($(this).attr("type") && $(this).attr("type").toLowerCase() == "submit");
                });
                var form = inputs.filter(function() {
                    return ($(this).prop("tagName").toLowerCase() == "form");
                });
                var reset = inputs.filter(function() {
                    return ($(this).attr("type") && $(this).attr("type").toLowerCase() == "reset");
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
                                    if ($(this).valid) {
                                        if ($(this).valid() == true) {
                                            mt.resetpaginationandbind(t);
                                        }
                                    } else {
                                        mt.resetpaginationandbind(t);
                                    }
                                });
                            $("body").on("reset",
                                "#" + $(this).attr("id"),
                                function(e) {
                                    var th = $(this);
                                    setTimeout(function() {
                                            if (th.valid) {
                                                if (th.valid() == true) {
                                                    mt.resetpaginationandbind(t);
                                                }
                                            } else {
                                                mt.resetpaginationandbind(t);
                                            }
                                        },
                                        100);
                                });
                        }
                    });
                } else {
                    if (reset.length > 0) {
                        $("[data-onresetfilter" + tid + "]").removeAttr("data-onresetfilter" + tid);
                        reset.attr("data-onresetfilter" + tid, "true");
                    }
                }
                var outsidefilters = inputs.filter(function() {
                    return ($(this).attr("data-forcefilter"));
                });
                $("[data-onchangefilter" + tid + "]").removeAttr("data-onchangefilter" + tid);
                if (button.length == 0 && inputs.length > 0) {
                    if (t.attr("data-perpage")) {
                        inputs.not(t.attr("data-perpage")).attr("data-onchangefilter" + tid, "true");
                    } else {
                        inputs.attr("data-onchangefilter" + tid, "true");
                    }
                }
                //If the input field outside the form and on trigger 
                if (outsidefilters.length > 0) {
                    outsidefilters.attr("data-onchangefilter" + tid, "true");
                }
            }
            var valid = true;
            $("[data-requiredonfilter" + tid + "]").each(function(ri, rv) {
                if (!$(this).val()) {
                    return valid = false;
                }
            });
            if (valid) {
                if (typeof stn.json == "string") {
                    var post = this.makepostdata(inputs);
                    var method = "post";
                    if (t.attr("data-requestmethod")) {
                        method = t.attr("data-requestmethod");
                    }
                    var uniquepost = stn.json + JSONstringify(post);
                    this.requesthandler(t,
                        method,
                        stn.json,
                        post,
                        function() {
                            if (caching) {
                                if (bindmanager.cache[uniquepost] && bindmanager.cache[uniquepost] !== "") {
                                    var data = bindmanager.cache[uniquepost];
                                    t.trigger("afterrequest", data);
                                    mt.success(t, stn, data, tid);
                                    return true;
                                }
                                return false;
                            }
                            return false;
                        },
                        function(data) {
                            if (caching) {
                                bindmanager.cache[uniquepost] = data;
                            }
                            t.trigger("afterrequest", data);
                            mt.success(t, stn, data, tid);
                        });
                } else {
                    mt.success(t, stn, stn.json, tid);
                }
            } else {
                mt.success(t, stn, [], tid);
            }
            t.attr("data-binderinit", true);
        }
    },
    requesthandler: function(t, method, url, post, cachefn, fn, reqi) {
        if (!reqi) {
            reqi = -1;
        }
        if (reqi < 10) {
            if (!cachefn()) {
                t.trigger("beforerequest", post);
                var mt = this;
                if ($.active <= 1) {
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
    attr: function(t) {
        var obj = {};
        $.each(t[0].attributes,
            function() {
                if (this.specified) {
                    obj[this.name] = this.value;
                }
            });
        return obj;
    },
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
    fetchvalue: {
        radio: function(t) {
            return $("[name='" + t.attr("name") + "']:checked").val().trim();
        },
        checkbox: function(t) {
            return t.prop("checked");
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
    initfn: function(t) {
        try {
            var fn = this;
            var datas = this.attr(t);
            var initby = false;
            $.each(datas,
                function(di, dv) {
                    if (di.startsWith("data-binderinit") || di.startsWith("data-binderperminit")) {
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
                            if (di.startsWith("data-binderperminit") && !t.attr("data-binderperminitinitiated")) {
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
            return initby;
        } catch (e) {
            return false;
        }
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
        for (var prototype in prototypes) {
            if (prototypes.hasOwnProperty(prototype)) {
                if (prototype == functionname) {
                } else if (prototype.toLowerCase() == functionname) {
                    prototype.functionname = prototype;
                }
            }
        }
    },
    textautofn: function(value, t) {
        if (t.length > 0) {
            var datas = this.attr(t);
            for (var di in datas) {
                if (datas.hasOwnProperty(di)) {
                    var dv = datas[di];
                    if (di.startsWith("data-string-") || di == ("data-string")||di == ("data-number") ||di.startsWith("data-number-")) {
                        var pieces = di.split("-");
                        pieces[pieces.length] = dv;
                        var prototype = pieces[1];
                        var methodname = pieces[2];
                        var param1 = pieces[3];
                        var param2 = pieces[4];
                      
                        if (!value[methodname]) {
                            if (prototype == "string") {
                                this.getprototypefunction(String.prototype, methodname);
                            }
                            if (prototype == "number") {
                                this.getprototypefunction(Number.prototype, methodname);
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
    gettemplatedetails: function(t, tid) {
        var obj = {};
        obj.nochange = "[" + this.data.data_follow + "],[" + this.data.data_static + "],[" +
            this.data.data_noresult +
            "]";
        obj.nochangedchildrens = t.children().not(obj.nochange);
        if (!bindmanager.htmltemplates[tid]) {
            var excludedelements = t.find("[data-json],[data-subjson]").find("[" + this.data.data_follow + "]");
            var ch = t.find("[" + this.data.data_follow + "]").not(excludedelements).first();
            if (ch.length == 0) {
                ch = ch.add(obj.nochangedchildrens).first();
            }
            if (ch.length > 0) {
                ch.attr(this.data.data_follow, true);
                obj.html = bindmanager.htmltemplates[tid] = ch[0].outerHTML;
                var followelements = t.find("[" + this.data.data_follow + "]:not([" + this.data.data_static + "])")
                    .not(excludedelements);
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
    success: function(t, stn, data, tid) {
        var triggerdataall = {
            rows: data
        };
        if (!t.attr("data-nobind") && t.attr("data-nobind") !== true) {
            var rows = null;
            var objrows = stn.dataobject.split(",");
            $.each(objrows,
                function(obji, objv) {
                    if (data[objv]) {
                        rows = data[objv];
                    }
                });
            var allowedinputs = this.data.inputs.split(",");
            var obj = this.gettemplatedetails(t, tid);
            var html = obj.html;
            //ch.attr(kv.data_follow, true);
            var parenttag = t.prop("tagName").toLowerCase();
            var excludedelements = t.find("[data-json],[data-subjson]").find(obj.nochange);
            var nochangeobj = t.find(obj.nochange).not(excludedelements);
            var dynamicobj = obj.nochangedchildrens;
            nochangeobj.hide();
            t.find("[" + this.data.data_static + "]").not(excludedelements).show();
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
            if (!t.attr(this.data.data_scrollloader)) {
                dynamicobj.remove();
            } else {
                t.attr("data-jlpagecount", 0);
                if ($("#input_scroller_" + this.setid(t)).val() == pagestartswith) {
                    dynamicobj.remove();
                }
            }
            if (rows && rows.length != 0) {
                var triggerdata;
                var triggerdatarow;
                var pagevalue;
                var pageinput;
                var pagesize;
                if (t.attr(this.data.data_pagination)) {
                    paginationt = $(t.attr(this.data.data_pagination));
                    pageinputid = "input_" + paginationt.attr("id");
                    pageinput = $("#" + pageinputid);
                    pagevalue = parseInt(pageinput.val());
                    pagesize = parseInt($(t.attr("data-perpage")).val());
                }
                t.trigger("beforeappendcomplete", triggerdataall);
                var kv = this.data;
                var mt = this;
                if (rows.length > 0) {
                    var properties = "";
                    for (var rowindex = 0; rowindex < rows.length; rowindex++) {
                        var rowobject = rows[rowindex];
                        if (typeof rowobject != "object") {
                            var tempvalue = rowobject;
                            rowobject = {};
                            rowobject.jlvalue = tempvalue;
                        }
                        if (t.attr(kv.data_pagination)) {
                            rowobject.pagesize = pagesize;
                            rowobject.pagenumber = pagevalue;
                        }
                        rowobject.jlindex = rowindex;
                        rowobject.jlrownumber = rowindex + 1;
                        triggerdatarow = {
                            key: rowindex,
                            value: rowobject
                        };
                        var template = $("<" + parenttag + ">" + html + "</" + parenttag + ">");
                        excludedelements = t.find("[data-json],[data-subjson]").find(obj.nochange);
                        var staticfollowtemplate = t.find("[" + kv.data_follow + "][" + kv.data_static + "]")
                            .not(excludedelements);
                        var followhtml = t.find("[" + kv.data_follow + "]").not(excludedelements);
                        if (staticfollowtemplate.length == 1) {
                            template = staticfollowtemplate;
                        } else if (followhtml.eq(0).length > 0) {
                            template =
                                $("<" + parenttag + ">" + followhtml.eq(0)[0].outerHTML + "</" + parenttag + ">");
                            // followhtml.eq(rowindex).remove();
                        }
                        excludedelements = template.find("[data-json],[data-subjson]").find(obj.nochange);
                        template.find("[" + kv.data_follow + "]").not(excludedelements).removeAttr(kv.data_follow);
                        t.trigger("beforeappendrow", triggerdatarow);
                        var subjsonrows = [];
                        $.each(rowobject,
                            function(key, value) {
                                if (template.find("[data-subjson='" + key + "']").length > 0) {
                                    subjsonrows.push({ key: key, value: value });
                                }
                                var htmlelements = template.find("." + key + ",#" + key + ",[name='" + key +
                                    "'],[data-key='" + key +
                                    "'],[data-jsonkey='" + key + "']");
                                var attrelements = template.find("[data-" +
                                    key.toLowerCase() + "-inline],[data-inline-" +
                                    key.toLowerCase() + "],[data-" + key.toLowerCase() +
                                    "-attr],[data-attr-" + key.toLowerCase() + "],[data-" + key.toLowerCase() +
                                    "-if],[data-if-" +
                                    key.toLowerCase() + "]");
                                var obj = htmlelements.add(attrelements);
                                triggerdata = {
                                    key: key,
                                    value: value
                                };
                                obj.trigger("beforeappend", triggerdata);
                                value = mt.textautofn(value, obj);
                                var commentobj = mt.getcommentobj(template.children());
                                if (commentobj.length > 0) {
                                    $.each(commentobj,
                                        function(cmi, cmv) {
                                            if (cmv !== false) {
                                                var parentname = cmv.next().parent().prop("tagName");
                                                var bindobj =
                                                    $("<" + parentname + " " + cmv[0].nodeValue + ">" +
                                                        cmv.next()[0].outerHTML + "</" + parentname + ">");
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
                                obj.each(function() {
                                    var tobj = $(this);
                                    $.each(mt.attr(tobj),
                                        function(ob, obv) {
                                            ob = ob.replace("data-", "");
                                            if (mt[ob]) {
                                                value = mt[ob](key, value, obv);
                                            }
                                            if (mt.date[ob]) {
                                                value = mt.date[ob](key, value, obv);
                                            }
                                            var keyname;
                                            if (ob === (key.toLowerCase() + "-inline") ||
                                                ob === ("inline-" + key.toLowerCase())) {
                                                keyname =
                                                    tobj.attr("data-" + key.toLowerCase() + "-inline")
                                                    ? tobj.attr("data-" + key.toLowerCase() + "-inline")
                                                    : tobj.attr("data-inline-" + key.toLowerCase());
                                                var replace = "{" + key + "}";
                                                var re = new RegExp(replace, "g");
                                                if (keyname == "html") {
                                                    tobj.html(tobj.html().replace(re, value));
                                                } else if (keyname == "text") {
                                                    tobj.text(tobj.text().replace(re, value));
                                                } else {
                                                    var attribute = tobj.attr(keyname);
                                                    if (attribute) {
                                                        tobj.attr(keyname, attribute.replace(re, value));
                                                    } else {
                                                        console.log("'" + keyname +
                                                            "' not matching any attributes for apply value for inline key 'data-" +
                                                            key.toLowerCase() +
                                                            "-inline'");
                                                    }
                                                }
                                            }
                                            if (ob === (key.toLowerCase() + "-attr") ||
                                                ob === ("attr-" + key.toLowerCase())) {
                                                keyname =
                                                    tobj.attr("data-" + key.toLowerCase() + "-attr")
                                                    ? tobj.attr("data-" + key.toLowerCase() + "-attr")
                                                    : tobj.attr("data-attr-" + key.toLowerCase());
                                                tobj.attr(keyname, value);
                                            }
                                            if (ob === (key.toLowerCase() + "-if") ||
                                                ob === ("if-" + key.toLowerCase())) {
                                                var keyvalue =
                                                    tobj.attr("data-" + key.toLowerCase() + "-if")
                                                        ? tobj.attr("data-" + key.toLowerCase() + "-if")
                                                        : tobj.attr("data-if-" + key.toLowerCase());
                                                //// if (typeof value === 'boolean') {
                                                if (value != null) {
                                                    try {
                                                        var exp;
                                                        if (keyvalue.toLowerCase().split(key.toLowerCase())
                                                            .length == 1) {
                                                            if (keyvalue.toString().match(/[<>!=]/ig)) {
                                                                exp = "'" + value + "'" + keyvalue.toString();
                                                            } else {
                                                                exp = "'" + value.toString() + "'" + "==" +
                                                                    keyvalue.toString();
                                                            }
                                                        } else {
                                                            var reg = new RegExp("{" + key + "}.length", "ig");
                                                            var reg2 = new RegExp("{" + key + "}", "ig");
                                                            var reg3 = new RegExp("{" + key + "}.toString\\(\\)",
                                                                "ig");
                                                            exp = keyvalue.replace(reg, value.length);
                                                            exp = exp.replace(reg3, "'" + value.toString() + "'");
                                                            exp = exp.replace(reg2, value);
                                                        }
                                                        if (exp) {
                                                            if (eval(exp)) {
                                                                tobj.show().attr("data-isactive", true);
                                                            } else {
                                                                tobj.hide().attr("data-isactive", false);
                                                                if (tobj.attr("data-removeinactive")) {
                                                                    tobj.remove();
                                                                }
                                                            }
                                                        }
                                                    } catch (e) {
                                                    }
                                                }
                                            }
                                        });
                                    if (htmlelements.length > 0 &&
                                        htmlelements.not(tobj).length != htmlelements.length) {
                                        var tagname = tobj.prop("tagName").toLowerCase();
                                        if ($.inArray(tagname, allowedinputs) !== -1) {
                                            tobj.val(value).attr("data-jlvalue", value);
                                            if (tagname === "select") {
                                                tobj.attr(kv.data_value, value);
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
                                                tobj.trigger(trigger);
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
                                    tobj.trigger("afterappend", triggerdata); //TODO Its not working
                                });
                            });
                        if (staticfollowtemplate.length == 1) {
                        } else if (followhtml.eq(0).length > 0) {
                            followhtml.eq(0).after(template.html());
                            followhtml.eq(0).remove();
                            this.bringvalues(t);
                        } else if (staticfollowtemplate.length == 0 &&
                            (staticfollowtemplate.eq(rowindex).length == 0)) {
                            t.append(template.html());
                            this.bringvalues(t);
                        }
                        var lastrow = t.children().last();
                        lastrow.not("[data-isactive=false]").show();
                        triggerdatarow = {
                            key: rowindex,
                            value: rowobject,
                            row: lastrow
                        };
                        lastrow.trigger("afterappendrow", triggerdatarow);
                        for (var ji = 0; ji < subjsonrows.length; ji++) {
                            var jv = subjsonrows[ji];
                            var subjsonelements = lastrow.find("[data-subjson='" + jv.key + "']");
                            if (subjsonelements.length > 0) {
                                for (var subi = 0; subi < subjsonelements.length; subi++) {
                                    var th = $(subjsonelements[subi]);
                                    jv.value = this.textautofn(jv.value, th);
                                    th.binder({ json: { Rows: jv.value } });
                                }
                            }
                        }
                    }
                    if (parenttag == "select" && !t.attr("data-disablevalue")) {
                        if (t.attr(kv.data_value)) {
                            var val = t.attr(kv.data_value);
                            if (!t.val() || (t.val() && t.val().length == 0)) {
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
                        var trigger = t.attr("data-trigger");
                        if (trigger) {
                            t.trigger(trigger);
                        }
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
        t.trigger("afterappendcomplete", triggerdataall);
        var childjsonrows = t.find("[data-json]:not([data-isactive=false])");
        if (t.find("[data-json]:not([data-isactive=false])").not(childjsonrows.find("[data-json]")).length > 0) {
            t.find("[data-json]").binder();
        }
    },
    bringvalues: function(t) {
        t.find("[data-jlvalue]").each(function() {
            $(this).val($(this).attr("data-jlvalue"));
            $(this).removeAttr("data-jlvalue");
        });
    },
    showhideboxes: function(t) {
        t.find("[" + this.data.data_noresult + "]").show();
        if (t.attr("data-method-show")) {
            $(t.attr("data-method-show")).hide();
        }
        if (t.attr("data-method-hide")) {
            $(t.attr("data-method-hide")).show();
        }
    },
    getcommentobj: function(th) {
        if ($(th).contents) {
            return $(th).contents().map(function() {
                return (this.nodeType === 8) ? $(this) : false;
            }).get();
        }
        return false;
    },
    managescrollloading: function(t, properties) {
        if (t.attr(this.data.data_scrollloader)) {
            ////var pagestartswith = parseInt(t.attr("data-pagestartswith"));
            var pagesize = parseInt($(t.attr("data-perpage")).val());
            var totalrows = parseInt(properties[t.attr("data-pagetotalrows")]);
            t.attr("data-jlpagecount", Math.ceil(totalrows / pagesize));
        }
    },
    wrapwithparent: function(parenttag, html) {
        return $("<" + parenttag + ">" + html + "</" + parenttag + ">");
    },
    appendpages: function(t, paginationt, properties, kv, stn, pagesize) {
        var paginationmaxcolumns = parseInt(stn.paginationmaxcolumns);
        paginationt.children().removeClass("disabled");
        var pagestartswith = parseInt(t.attr("data-pagestartswith"));
        var pagefollow = paginationt.find("[" + kv.data_follow + "]"); //TODO
        pagefollow.hide();
        var pagehtml = pagefollow[0].outerHTML;
        var pagetag = paginationt.prop("tagName").toLowerCase();
        var totalrows = parseInt(properties[t.attr("data-pagetotalrows")]);
        var pagenumber = pagestartswith;
        paginationt.find("[data-autocreated]").remove();
        /////paginationmaxcolumns * pagesize
        for (var i = 0; i < totalrows; i = i + pagesize) {
            var pagerow = this.wrapwithparent(pagetag, pagehtml);
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
    },
    getidobj: function(id) {
        return $("#" + id);
    },
    getinputofthis: function(t) {
        return this.getidobj("input_" + t.attr("id"));
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
                if (currentli.find("[data-pagenumber]").attr("data-pagenumber") == paginationt
                    .find("[data-autocreated]:last").find("[data-pagenumber]").attr("data-pagenumber")) {
                    paginationt.find("[data-next]").addClass("disabled");
                }
                if (currentli.find("[data-pagenumber]").attr("data-pagenumber") == paginationt
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
            var alllists = paginationt.find("li[data-autocreated='true']");
            if (alllists.length > 0) {
                alllists.hide().removeClass("jlvisiblepage");
                var pageinput = this.getinputofthis(paginationt);
                setTimeout(function() {
                        var appliedwidth = 0;
                        var totalwidth = paginationt.outerWidth();
                        var pagepositiontop = paginationt.position().top;
                        var totalheight = paginationt.outerHeight();
                        var pagenumbervalue = parseInt(pageinput.val());
                        var currentli = paginationt.find('[data-pagenumber="' + pageinput.val() + '"]')
                            .closest("li");
                        var loopli;
                        var toppositioninner;
                        var breaked = false;
                        for (var i = 0; i < alllists.length; i++) {
                            if (breaked == true) {
                                break;
                            }
                            var currentpagenumbers = [(pagenumbervalue - i), (pagenumbervalue + i)];
                            for (var j = 0; j < currentpagenumbers.length; j++) {
                                var cpagenumber = currentpagenumbers[j];
                                loopli = paginationt.find("[data-pagenumber=" + cpagenumber + "]").closest("li");
                                if (loopli.length > 0) {
                                    loopli.show().addClass("jlvisiblepage");
                                    appliedwidth += loopli.outerWidth();
                                    if (totalheight == 0) {
                                        totalheight = paginationt.outerHeight();
                                    }
                                    if (totalwidth == 0) {
                                        totalwidth = paginationt.outerWidth();
                                    }
                                    var totalwidthinner = paginationt.outerWidth();
                                    var totalheightinner = paginationt.outerHeight();
                                    toppositioninner = paginationt.position().top;
                                    if (totalheightinner > totalheight) {
                                        loopli.hide().removeClass("jlvisiblepage");
                                        breaked = true;
                                        break;
                                    }
                                    if (toppositioninner != pagepositiontop) {
                                        loopli.hide().removeClass("jlvisiblepage");
                                        breaked = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (paginationt.find(".jlvisiblepage[data-autocreated]:last").find("[data-pagenumber]")
                            .attr("data-pagenumber") == paginationt
                            .find("[data-autocreated]:last").find("[data-pagenumber]").attr("data-pagenumber")) {
                            paginationt.find("[data-nextrow]").addClass("disabled");
                        } else {
                            paginationt.find("[data-nextrow]").removeClass("disabled");
                        }
                        if (paginationt.find(".jlvisiblepage[data-autocreated]:first").find("[data-pagenumber]")
                            .attr("data-pagenumber") == paginationt
                            .find("[data-autocreated]:first").find("[data-pagenumber]").attr("data-pagenumber")) {
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
    }
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
    data_perpage: "data-perpage",
    data_servername: "data-servername",
    data_value: "data-value",
    data_showingpagefrom: "data-showingpagefrom",
    data_showingpageto: "data-showingpageto"
};
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
        dddd: this.DD,
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
            return dd[9];
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
    jsontodate: function(key, value, attributevalue) {
        return new Date(parseInt(value.substr(6)));
    }
};
$.fn.binder.methods.defaults = {
    json: "",
    dataobject: "Rows,Data",
    paginationmaxcolumns: 20,
    orderbyascendingicon: '<span class="fa fa-sort-asc table-sort" data-orderbyascicon="true" aria-hidden="true"></span>',
    orderbydescendingicon: '<span class="fa fa-sort-desc table-sort" data-orderbydescicon="true" aria-hidden="true"></span>',
    orderbyiconinsertmethod:"append"
};
$(document).ready(function() {
    $("[data-json]:visible,[data-json]:hidden").binder();
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
});
//})(jQuery);
