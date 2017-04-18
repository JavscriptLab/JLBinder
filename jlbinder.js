
"use strict";
$.fn.binder = function(opt) {
    var t = $(this);
    var stn = $.extend({}, $.fn.binder.defaults);
    var kv = $.fn.binder.keys;
    var mt = $.fn.binder.methods;
    if (typeof opt == 'object') {
        {
            stn = $.extend(stn, opt);
        }
    }
    if (stn.json == "") {
        stn.json = t.attr(kv.data_json);
    }
    var post = {};
    var postsinputs = t.attr(kv.data_filter);
    var inputs = $(postsinputs).add($(postsinputs).find(kv.inputs));
    inputs.not(kv.disabled).each(function() {
        var tagtype = $(this).attr('type');
        switch (tagtype) {
        case "checkbox":
            {
                post[$(this).attr('name')] = $(this).prop('checked');
                break;
            }
        //Radio Button
        case "radio":
            {
                post[$(this).attr('name')] = $("[name='" + $(this).attr('name') + "']:checked").val();
                break;
            }
        case "submit":
            {
                break;
            }
        default:
            {
                post[$(this).attr('name')] = $(this).val();
                break;
            }
        }
    });
    $.post(stn.json,
        post,
        function(data) {
            if (data && data.Data) {
                var rows = data.Data;
                var ch = t.children().not("[data-static]").first();
                ch.attr("data-follow", true);
                ch.hide();
                var html = ch[0].outerHTML;
                $.each(rows,
                    function(rowindex, rowobject) {
                       
                       
                        var crow = $(html);
                        $.each(rowobject,
                            function (key, value) {


                                var obj = crow.find("." + key + ",#" + key + ",[name='" + key + "'],[data-key='" + key + "']");
                                $.each(obj.data(),
                                    function (ob, obv) {
                                        if (mt[ob]) {
                                            value = mt[ob](key, value, obv);
                                        }
                                    });
                                obj.html(value);
                                var triggerdata = { key: key, value: value };
                                obj.trigger("afterappend", triggerdata);

                            });
                        t.append(crow[0].outerHTML);
                        var lastrow = t.children().last();
                        lastrow.show();
                    });
            }
        });
    return $(this);
};

$.fn.binder.methods = {
    dateto: function(pattern) {
        var splitters = [",", "|", "-", "/"];
        $.each(pattern.split(splitters),
            function() {
            });
    },
    formatdate:function(key, value,attributevalue) {
        var date = this.jsontodate(key, value);
        return date;
    },
    jsontodate:function(key, value,attributevalue) {
        return new Date(parseInt(value.substr(6)));
    }
};
$.fn.binder.keys = {
    data_json: "data-json",
    data_filter: "data-filter",
    inputs: "input,select,textarea",
    disabled: "[disabled]"
};
$.fn.binder.defaults = {
    json: ""
};
$(document).ready(function() {
    $('[data-json]').binder();
});
