/*
MIT License
Copyright (c) 2017 JavscriptLab https://github.com/JavscriptLab
*/
"use strict";
$.fn.binder = function(opt) {
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
    var postsinputs = t.attr(kv.data_filterby);
    var requiredinputs = t.attr(kv.data_filterby_required);
    var inputsrequired = $(requiredinputs).add($(requiredinputs).find(kv.inputs));
    $("[data-requiredonfilter" + tid + "]").removeAttr("data-requiredonfilter" + tid);
    inputsrequired.attr("data-requiredonfilter" + tid, true);
    var inputs = $(postsinputs).add($(postsinputs).find(kv.inputs)).add(inputsrequired);
    if (!t.attr("data-binderinit")) {
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
                            if ($(this).validate) {
                                if ($(this).validate() == true) {
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
        var post = mt.makepostdata(inputs, kv, mt, t);
        $.post(stn.json,
            post,
            function(data) {
                mt.success(t, mt, kv, stn, data);
            });
    } else {
        mt.success(t, mt, kv, stn, "");
    }
    t.attr("data-binderinit", true);
    return $(this);
};
$.fn.binder.methods = {
    fetchvalue: {
        radio: function(t) {
            return $("[name='" + t.attr('name') + "']:checked").val();
        },
        checkbox: function(t) {
            return t.prop('checked');
        }
    },
    makepostdata: function(inputs, kv, mt, t) {
        var post = {};
        inputs.not(kv.disabled).each(function() {
            var tagtype = $(this).attr('type');
            var name = $(this).attr('name');
            if ($(this).attr('data-servername')) {
                name = $(this).attr('data-servername');
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
    success: function(t, mt, kv, stn, data) {
        var nochange = "[" + kv.data_follow + "],[" + kv.data_static + "],[" + kv.data_noresult + "]";
        var rows = data.Data;
        var ch = t.find("[" + kv.data_follow + "]");
        ch = ch.add(t.children().not(nochange)).first();
        var html = ch[0].outerHTML;
        var parenttag = t.prop("tagName");
        ch.attr(kv.data_follow, true);
        var nochangeobj = $(nochange);
        var dynamicobj = t.children().not(nochange);
        nochangeobj.hide();
        $("[" + kv.data_static + "]").show();
        dynamicobj.remove();
        if (data && data.Data) {
            var triggerdata;
            var triggerdatarow;
            var crow = $("<" + parenttag + ">" + html + "</" + parenttag + ">");
            crow.find("[" + kv.data_follow + "]").removeAttr(kv.data_follow);
            var triggerdataall = {
                rows: data,
                template: crow
            };
            obj.trigger("beforeappendcomplete", triggerdataall);
            if (rows.length > 0) {
                $.each(rows,
                    function(rowindex, rowobject) {
                        triggerdatarow = {
                            key: rowindex,
                            value: rowobject
                        };
                        obj.trigger("beforeappendrow", triggerdatarow);
                        $.each(rowobject,
                            function(key, value) {
                                var obj = crow.find("." + key + ",#" + key + ",[name='" + key + "'],[data-key='" + key +
                                    "'],[data-jsonkey='" + key + "'],[data-" + key.toLowerCase() + "-attr]");
                                triggerdata = {
                                    key: key,
                                    value: value
                                };
                                obj.trigger("beforeappend", triggerdata);
                                $.each(obj.data(),
                                    function(ob, obv) {
                                        if (mt[ob]) {
                                            value = mt[ob](key, value, obv);
                                        }
                                        var keyname;
                                        if (ob == (key.toLowerCase() + "Attr")) {
                                            keyname = obj.attr("data-" + key.toLowerCase() + "-attr");
                                            obj.attr(keyname, value);
                                        }
                                        if (ob == (key.toLowerCase() + "Inline")) {
                                            keyname = obj.attr("data-" + key.toLowerCase() + "-inline");
                                            var replace = "{" + key + "}";
                                            var re = new RegExp(replace, "g");
                                            obj.attr(keyname, obj.attr(keyname).replace(re, value));
                                        }
                                    });
                                if (obj.attr('data-key') || obj.attr('data-jsonkey')) {
                                    obj.html(value);
                                }
                                triggerdata = {
                                    index: key,
                                    value: value
                                };
                                obj.trigger("afterappend", triggerdata);
                            });
                        t.append(crow.html());
                        var lastrow = t.children().last();
                        lastrow.show();
                        triggerdatarow = {
                            key: rowindex,
                            value: rowobject,
                            row: lastrow
                        };
                        obj.trigger("afterappendrow", triggerdatarow);
                    });
            } else {
                t.find("[" + kv.data_noresult + "]").show();
            }
            obj.trigger("afterappendcomplete", triggerdata);
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
            return date.getMonth();
        },
        MM: function(dv, dd, date) {
            return ("0" + date.getMonth()).slice(-2);
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
    data_json: "data-json",
    data_filterby: "data-filterby",
    data_filterby_required: "data-filterby-required",
    inputs: "input,select,textarea,button",
    disabled: "[disabled]",
    data_noresult: "data-noresult",
    data_static: "data-static",
    data_follow: "data-follow"
};
$.fn.binder.defaults = {
    json: ""
};
$(document).ready(function() {
    $('[data-json]').each(function() {
        $(this).binder();
    });
});
