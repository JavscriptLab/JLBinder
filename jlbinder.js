/*
MIT License
Copyright (c) 2017 JavscriptLab https://github.com/JavscriptLab
*/
"use strict";
var bindmanager = {};
bindmanager.cache = {};
$.binder = {
    clear: function(t) {
        var json = t.attr($.fn.binder.keys.data_json);
        if (bindmanager.cache) {
            $.each(bindmanager.cache,
                function(i, v) {
                    if (i.startsWith(json)) {
                        bindmanager.cache[i] = "";
                    }
                });
        }
    }
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
    $(this).each(function() {
        var t = $(this);
        if (!t.attr('id')) {
            t.attr('id', "Id" + new Date().getTime());
        }
        var tid = t.attr('id');
        var stn = $.extend({}, $.fn.binder.defaults);
        var kv = $.fn.binder.keys;
        var mt = $.extend($.fn.binder.date, $.fn.binder.methods);
        if (typeof opt == 'object') {
            {
                stn = $.extend(stn, opt);
            }
        }
        if (stn.json == "") {
            stn.json = t.attr(kv.data_json);
        }
        var caching = (t.attr('data-caching') && t.attr('data-caching') === 'true');
        var postsinputs = t.attr(kv.data_filterby);
        var requiredinputs = t.attr(kv.data_filterby_required);
        var inputsrequired = $(requiredinputs).add($(requiredinputs).find(kv.inputs));
        $("[data-requiredonfilter" + tid + "]").removeAttr("data-requiredonfilter" + tid);
        inputsrequired.attr("data-requiredonfilter" + tid, true);
        var inputs = $(postsinputs).add($(postsinputs).find(kv.inputs)).add(inputsrequired);
        if (!t.attr("data-binderinit")) {
            if (t.attr('data-order')) {
                var orderbyt = $(t.attr('data-order'));
                orderbyt.attr('data-jlorderby', tid);
                if (!orderbyt.attr('id')) {
                    orderbyt.attr('id', "Id" + new Date().getTime());
                }
                var orderfieldinputid = 'input_orderfield_' + orderbyt.attr('id');
                var orderbyinputid = 'input_orderby_' + orderbyt.attr('id');
                var orderfieldservername = t.attr('data-orderfieldname');
                var ordername = t.attr('data-orderbyname');
                if (!orderfieldservername) {
                    console.log(
                        "Please add a 'data-orderfieldname' attribute for binder initialized element, It is required for sending your sort order field name (#" +
                        t.attr('id') + ")");
                }
                if (!ordername) {
                    console.log(
                        "Please add a 'data-orderbyname' attribute for binder initialized element, It is required for sending your sort order name (#" +
                        t.attr('id') + ")");
                }
                orderbyt.find('[data-orderbyfield]').css('cursor', 'pointer');
                $('body').append('<input type="hidden" id="' + orderfieldinputid + '" name="' + orderfieldservername +
                    '" value="' + orderbyt.find('[data-orderbyfield]:first').attr('data-orderbyfield') + '" />');
                $('body').append('<input type="hidden" id="' + orderbyinputid + '" name="' + ordername +
                    '" value="desc" />');
                t.attr(kv.data_filterby, t.attr(kv.data_filterby) + ",#" + orderfieldinputid + ",#" + orderbyinputid);
                var orderfieldinput = $("#" + orderfieldinputid);
                var orderbyinput = $("#" + orderbyinputid);
                inputs = inputs.add(orderfieldinput).add(orderbyinput);
                $('body').on('click',
                    "[data-jlorderby='" + tid + "'] [data-orderbyfield]",
                    function(e) {
                        e.preventDefault();
                        orderfieldinput.val($(this).attr('data-orderbyfield'));
                        if (!$(this).attr('data-orderby')) {
                            $(this).attr('data-orderby', "asc");
                        }
                        if ($(this).attr('data-orderby') == "asc") {
                            $(this).attr('data-orderby', "desc");
                        } else {
                            $(this).attr('data-orderby', "asc");
                        }
                        orderbyinput.val($(this).attr('data-orderby'));
                        t.binder();
                    });
            }
            if (t.attr(kv.data_pagination)) {
                var paginationt = $(t.attr(kv.data_pagination));
                if (!paginationt.attr('id')) {
                    paginationt.attr('id', "Id" + new Date().getTime());
                }
                var pageinputid = 'input_' + paginationt.attr('id');
                var servername = t.attr('data-pageservername');
                paginationt.children().attr('data-jlpages', true);
                paginationt.attr('data-jlid', tid);
                if (!servername) {
                    console.log(
                        "Please add a 'data-pageservername' attribute for binder initialized element, It is required for sending your page number field name (#" +
                        t.attr('id') + ")");
                }
                var pagestartswith = t.attr('data-pagestartswith');
                $('body').append('<input type="hidden" id="' + pageinputid + '" name="' + servername + '"  value="' +
                    pagestartswith + '" />');
                t.attr(kv.data_filterby, t.attr(kv.data_filterby) + ",#" + pageinputid);
                var pageinput = $("#" + pageinputid);
                inputs = inputs.add(pageinput);
                if (t.attr('data-perpage')) {
                    $('body').on('change',
                        t.attr('data-perpage'),
                        function(e) {
                            e.preventDefault();
                            pageinput.val(pagestartswith);
                            t.binder();
                        });
                }
                $('body').on('click',
                    "[data-jlid='" + tid + "'] [data-jlpages]",
                    function(e) {
                        e.preventDefault();
                        $(this).parent().children().removeClass('active disabled');
                        if ($(this).attr('data-previos')) {
                            pageinput.val(parseInt(pageinput.val()) - 1);
                        } else if ($(this).attr('data-next')) {
                            pageinput.val(parseInt(pageinput.val()) + 1);
                        } else if ($(this).attr('data-first')) { //ToDo
                            pageinput.val(pagestartswith);
                        } else if ($(this).attr('data-last')) { //ToDo
                            pageinput.val(0);
                        } else {
                            var pageno = 0;
                            if ($(this).find('[data-pagenumber]').length > 0) {
                                pageno = $(this).find('[data-pagenumber]').attr('data-pagenumber');
                            } else {
                                pageno = $(this).attr('data-pagenumber');
                            }
                            pageinput.val(pageno);
                        }
                        var currentli = paginationt.find('[data-pagenumber=' + pageinput.val() + ']').closest('li');
                        currentli.addClass('active');
                        if (currentli.find('[data-pagenumber]').attr('data-pagenumber') == paginationt
                            .find('[data-autocreated]:last').find('[data-pagenumber]').attr('data-pagenumber')) {
                            paginationt.find('[data-next]').addClass('disabled');
                        }
                        if (currentli.find('[data-pagenumber]').attr('data-pagenumber') == paginationt
                            .find('[data-autocreated]:first').find('[data-pagenumber]').attr('data-pagenumber')) {
                            paginationt.find('[data-previos]').addClass('disabled');
                        }
                        t.binder();
                    });
            }
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
                    if (!$(this).attr('id')) {
                        $(this).attr('id', "Id" + new Date().getTime());
                    }
                    if (!$(this).attr('data-submiteventinit')) {
                        $(this).attr('data-submiteventinit', true);
                        $('body').on('submit',
                            "#" + $(this).attr('id'),
                            function(e) {
                                e.preventDefault();
                                if ($(this).valid) {
                                    if ($(this).valid() == true) {
                                        t.binder();
                                    }
                                } else {
                                    t.binder();
                                }
                            });
                    }
                });
            }
            if (button.length == 0) {
                $("[data-onchangefilter" + tid + "]").removeAttr("data-onchangefilter" + tid);
                inputs.attr("data-onchangefilter" + tid, "true");
                $('body').on("change blur",
                    "[data-onchangefilter" + tid + "=true]",
                    function(e) {
                        t.binder();
                    });
            }
        }
        var valid = true;
        $("[data-requiredonfilter" + tid + "]").each(function(ri, rv) {
            if (!$(this).val()) {
                return valid = false;
            }
        });
        if (valid) {
            var post = mt.makepostdata(inputs, kv, mt);
            var method = "post";
            if (t.attr('data-requestmethod')) {
                method = t.attr('data-requestmethod');
            }
            
            var uniquepost = stn.json + JSONstringify(post);
            mt.requesthandler(t,method,
                stn.json,
                post,
                function() {
                    if (caching) {
                        if (bindmanager.cache[uniquepost] && bindmanager.cache[uniquepost] !== "") {
                            var data = bindmanager.cache[uniquepost];
                            t.trigger('afterrequest', data);
                            mt.success(t, mt, kv, stn, data);
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
                    t.trigger('afterrequest', data);
                    mt.success(t, mt, kv, stn, data);
                });
        } else {
            mt.success(t, mt, kv, stn, []);
        }
        t.attr("data-binderinit", true);
    });
    return $(this);
};
$.fn.binder.methods = {
    requesthandler: function (t,method, url, post, cachefn, fn, reqi) {
        if (!reqi) {
            reqi = -1;
        }
        if (reqi < 10) {
            if (!cachefn()) {
                t.trigger('beforerequest', post);
                var mt = this;
                if ($.active === 0) {
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
    fetchvalue: {
        radio: function(t) {
            return $("[name='" + t.attr('name') + "']:checked").val();
        },
        checkbox: function(t) {
            return t.prop('checked');
        }
    },
    makepostdata: function(inputs, kv, mt) {
        var post = {};
        inputs.not(kv.disabled).each(function() {
            var tagtype = $(this).attr('type');
            var name = $(this).attr('name');
            if ($(this).attr(kv.data_servername)) {
                name = $(this).attr(kv.data_servername);
            }
            if (name) {
                if (mt.fetchvalue[tagtype]) {
                    post[name] = mt.fetchvalue[tagtype]($(this));
                } else {
                    post[name] = $(this).val();
                }
            }
        });
        return post;
    },
    autofn: function(obj, t, properties) {
        var datas = this.attr(t);
        $.each(properties,
            function(pi, pv) {
                if (typeof pv != 'object') {
                    properties[pi.toLowerCase()] = pv;
                }
            });
        $.each(datas,
            function(di, dv) {
                if (di.startsWith('data-method')) {
                    var pieces = di.split('-');
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
    success: function(t, mt, kv, stn, data) {
        var allowedinputs = kv.inputs.split(",");
        var nochange = "[" + kv.data_follow + "],[" + kv.data_static + "],[" + kv.data_noresult + "]";
        var rows = data.Data;
        var ch = t.find("[" + kv.data_follow + "]");
        ch = ch.add(t.children().not(nochange)).first();
        var html = ch[0].outerHTML;
        var parenttag = t.prop("tagName").toLowerCase();
        ch.attr(kv.data_follow, true);
        var nochangeobj = $(nochange);
        var dynamicobj = t.children().not(nochange);
        nochangeobj.hide();
        $("[" + kv.data_static + "]").show();
        dynamicobj.remove();
        if (data && data.Data && data.Data.length != 0) {
            var triggerdata;
            var triggerdatarow;
            var crow = $("<" + parenttag + ">" + html + "</" + parenttag + ">");
            crow.find("[" + kv.data_follow + "]").removeAttr(kv.data_follow);
            var triggerdataall = {
                rows: data,
                template: crow
            };
            t.trigger("beforeappendcomplete", triggerdataall);
            if (rows.length > 0) {
                var properties = "";
                $.each(rows,
                    function(rowindex, rowobject) {
                        triggerdatarow = {
                            key: rowindex,
                            value: rowobject
                        };
                        var template = crow;
                        var staticfollowtemplate = t.find('[' + kv.data_follow + '][' + kv.data_static + ']');
                        if (staticfollowtemplate.length > 0) {
                            template = staticfollowtemplate;
                        }
                        t.trigger("beforeappendrow", triggerdatarow);
                        $.each(rowobject,
                            function(key, value) {
                                var htmlelements = template.find("." + key + ",#" + key + ",[name='" + key +
                                    "'],[data-key='" + key +
                                    "'],[data-jsonkey='" + key + "']");
                                var attrelements = template.find("[data-" + key.toLowerCase() + "-attr],[data-" +
                                    key.toLowerCase() + "-inline]");
                                var obj = htmlelements.add(attrelements);
                                triggerdata = {
                                    key: key,
                                    value: value
                                };
                                obj.trigger("beforeappend", triggerdata);
                                obj.each(function() {
                                    var tobj = $(this);
                                    $.each(tobj.data(),
                                        function(ob, obv) {
                                            if (mt[ob]) {
                                                value = mt[ob](key, value, obv);
                                            }
                                            var keyname;
                                            if (ob == (key.toLowerCase() + "Attr")) {
                                                keyname = tobj.attr("data-" + key.toLowerCase() + "-attr");
                                                tobj.attr(keyname, value);
                                            }
                                            if (ob == (key.toLowerCase() + "Inline")) {
                                                keyname = tobj.attr("data-" + key.toLowerCase() + "-inline");
                                                var replace = "{" + key + "}";
                                                var re = new RegExp(replace, "g");
                                                tobj.attr(keyname, tobj.attr(keyname).replace(re, value));
                                            }
                                        });
                                    if (htmlelements.length > 0 &&
                                        htmlelements.not(tobj).length != htmlelements.length) {
                                        var tagname = tobj.prop("tagName").toLowerCase();
                                        if ($.inArray(tagname, allowedinputs) !== -1) {
                                            tobj.val(value);
                                            if (tagname == 'select') {
                                                tobj.attr(kv.data_value, value);
                                                if (value !== "") {
                                                    if (tobj.find('option[value="' + value + '"]').length == 0) {
                                                        tobj.find('option:not([data-follow])').first()
                                                            .prop('selected', true);
                                                    }
                                                }
                                            }
                                            var trigger = tobj.attr('data-trigger');
                                            if (trigger) {
                                                tobj.trigger(trigger);
                                            }
                                        } else {
                                            tobj.html(value);
                                        }
                                    }
                                    triggerdata = {
                                        index: key,
                                        value: value
                                    };
                                    tobj.trigger("afterappend", triggerdata);
                                });
                            });
                        if (staticfollowtemplate.length == 0) {
                            t.append(template.html());
                        }
                        var lastrow = t.children().last();
                        lastrow.show();
                        triggerdatarow = {
                            key: rowindex,
                            value: rowobject,
                            row: lastrow
                        };
                        lastrow.trigger("afterappendrow", triggerdatarow);
                    });
                if (parenttag == 'select') {
                    if (t.attr(kv.data_value)) {
                        if (!t.val()) {
                            t.val(t.attr(kv.data_value));
                            if (t.attr(kv.data_value) != "") {
                                if (t.find('option[value="' + t.attr(kv.data_value) + '"]').length == 0) {
                                    t.find('option:not([data-follow])').first().prop('selected', true);
                                }
                            }
                        }
                    }
                }
                properties = $.extend(data, data.Data[0]);
                if (t.attr(kv.data_pagination)) {
                    var paginationt = $(t.attr(kv.data_pagination));
                    paginationt.children().removeClass('disabled');
                    var pagefollow = paginationt.find('[' + kv.data_follow + ']'); //TODO
                    pagefollow.hide();
                    var pagehtml = pagefollow[0].outerHTML;
                    var pagestartswith = parseInt(t.attr('data-pagestartswith'));
                    var pagetag = paginationt.prop("tagName").toLowerCase();
                    var totalrows = parseInt(properties[t.attr('data-pagetotalrows')]);
                    var pagesize = parseInt($(t.attr('data-perpage')).val());
                    var pagenumber = pagestartswith;
                    paginationt.find('[data-autocreated]').remove();
                    for (var i = 0; i < totalrows; i = i + pagesize) {
                        var pagerow = $("<" + pagetag + ">" + pagehtml + "</" + pagetag + ">");
                        if (pagerow.find('[data-pagenumber]')) {
                            pagerow.find('[data-pagenumber]').attr('data-pagenumber', pagenumber).html(pagenumber);
                        }
                        pagerow.find('[' + kv.data_follow + ']').show().removeAttr(kv.data_follow)
                            .attr('data-autocreated', true);
                        pagefollow.after(pagerow.html());
                        pagefollow = pagefollow.next();
                        pagenumber++;
                    }
                    var pageinputid = 'input_' + paginationt.attr('id');
                    var pageinput = $("#" + pageinputid);
                    var currentli = paginationt.find('[data-pagenumber=' + pageinput.val() + ']').closest('li');
                    currentli.addClass('active');
                    if (currentli.find('[data-pagenumber]').attr('data-pagenumber') == paginationt
                        .find('[data-autocreated]:last').find('[data-pagenumber]').attr('data-pagenumber')) {
                        paginationt.find('[data-next]').addClass('disabled');
                    }
                    if (currentli.find('[data-pagenumber]').attr('data-pagenumber') == paginationt
                        .find('[data-autocreated]:first').find('[data-pagenumber]').attr('data-pagenumber')) {
                        paginationt.find('[data-previos]').addClass('disabled');
                    }
                }
                mt.autofn($('body'), t, properties);
            } else {
                t.find("[" + kv.data_noresult + "]").show();
            }
            t.trigger("afterappendcomplete", triggerdataall);
        } else {
            t.find("[" + kv.data_noresult + "]").show();
        }
    }
};
$.fn.binder.date = {
    format: {
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        months: [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
            'November',
            'December'
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
$.fn.binder.keys = {
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
    data_perpage: "data-perpage",
    data_servername: "data-servername",
    data_value: "data-value"
};
$.fn.binder.defaults = {
    json: ""
};
$(document).ready(function() {
    $('[data-json]:visible,[data-json]:hidden').binder();
    $('body').on('click',
        '[data-show]',
        function() {
            $($(this).attr("data-show")).show();
        });
    $('body').on('click',
        '[data-hide]',
        function() {
            $($(this).attr("data-hide")).hide();
        });
    $('body').on('click',
        '[data-toggle]',
        function() {
            $($(this).attr("data-toggle")).toggle();
        });
});
