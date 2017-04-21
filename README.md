# JLBinder
## Javascript Easy Binding By Jquery
It is an alternative for angular js binding functionality by jquery
JLBinder Main focused on manipulating with json data.
For appending some data inside a grid view or table rows. Follow these steps.
* First initialize the plugin. - Add data-json attribute for your outer element like below example
```html
<div class="outerlayer" data-json="myjson/getcountries">
<div class="innerlayer">//This is the repitative layer
<span data-key="countrycode"></span>
<span data-key="countryId"></span>
<span data-key="countryName"></span>
<a data-countryId-inline="href" href="gotocountry/{countryId}"></a>
<input data-countryId-attr="value" />
</div>
</div>
```
It will fetch json from getcountries and append as rows and its output looks like
```html
<div class="outerlayer" data-json="myjson/getcountries">
<div class="innerlayer">
<span data-key="countrycode">IND</span>
<span data-key="countryId">34</span>
<span data-key="countryName">INDIA</span>
<a data-countryId-inline="href" href="gotocountry/34"></a>
<input data-countryId-attr="value" value="34"  />
</div>
<div class="innerlayer">
<span data-key="countrycode">USA</span>
<span data-key="countryId">64</span>
<span data-key="countryName">UNITED STATES</span>
<a data-countryId-inline="href" href="gotocountry/64"></a>
<input data-countryId-attr="value" value="64"  />
</div>
<div class="innerlayer">
<span data-key="countrycode">UAE</span>
<span data-key="countryId">74</span>
<span data-key="countryName">UNITED STATES OF AMERICA</span>
<a data-countryId-inline="href" href="gotocountry/74"></a>
<input data-countryId-attr="value" value="74"  />
</div>

</div>
```
## Functionalities
* data-json : The Url of json data - Your Json data must be looks like 
```json
{  
   "Rows":[  
      {  
         "Key":"Your Key 2",
         "Value":"Your Value 2"
      },
      {  
         "Key":"Your Key 2",
         "Value":"Your Value 2"
      }
   ]
}
```
* data-key : The name of your json variable inside array object
* data-{your json key here}-attr : For adding a json value inside your attribute
For Example 
```html
<div class="outerlayer" data-json="myjson/getcountries">
<div class="innerlayer">//This is the repitative layer
<span data-key="countrycode"></span>
<input data-countryId-attr="value" />
</div>
</div>
```
It will add value named attribute for input/ Fill attributes with values
* data-{your json key here}-inline : add values in your inline attributes content
```html
<div class="outerlayer" data-json="myjson/getcountries">
<div class="innerlayer">//This is the repitative layer
<span data-key="countrycode"></span>
<a data-countryId-inline="href" href="gotocountry/{countryId}"></a>
</div>
</div>
```
It will add country id inside href value after slash inside curely brackets
curely bracket is must to represent json key

* data-dateformat : convert your date to any date format as given in here 
eg:"dd-MM-yyyy"
https://msdn.microsoft.com/en-us/library/8kb3ddd4(v=vs.110).aspx
It support these all date conversion formats. if have any bugs report it.
* data-filterby : It must be a form or input selectors seperated by comma looks like
eg: data-filterby="#YourformId,.Textboxclass,#TextboxID,[select]"
* data-filterby-required : It must be a form or input selectors seperated by comma looks like. It have the same functionlity like data-filterby, the difference is all of the selectors given in here are required to bind data from json
eg: data-filterby="#YourformId,.Textboxclass,#TextboxID,[select]"
* data-noresult : If no result in json this element will show 
For Example
```html
<div class="outerlayer" data-json="myjson/getcountries">
<div class="innerlayer">//This is the repitative layer
<span data-key="countrycode"></span>
<span data-key="countryId"></span>
<span data-key="countryName"></span>
<a data-countryId-inline="href" href="gotocountry/{countryId}"></a>
<input data-countryId-attr="href" />
</div>
<div data-noresult="true">No Results Found</div>
</div>
```
* data-static : If you need to show one row as static/ No change you can chose it
For Example
```html
<div class="outerlayer" data-json="myjson/getcountries">
<div class="innerlayer">//This is the repitative layer
<span data-key="countrycode"></span>
<span data-key="countryId"></span>
<span data-key="countryName"></span>
<a data-countryId-inline="href" href="gotocountry/{countryId}"></a>
<input data-countryId-attr="href" />
</div>
<div data-static="true">Total Count:90</div>
</div>
```
* data-follow : By Default JLBinder chose first row as the template row. But you need to assign any other row as template row just add "data-follow" attribute for that element.
For Example
```html
<div class="outerlayer" data-json="myjson/getcountries">
<div class="innerlayer">My Blank Layer</div>
<div data-static="true">Total Count:90</div>
<div class="innerlayer" data-follow="true">//This is the repitative layer because data-follow attribute here
<span data-key="countrycode"></span>
<span data-key="countryId"></span>
<span data-key="countryName"></span>
<a data-countryId-inline="href" href="gotocountry/{countryId}"></a>
<input data-countryId-attr="href" />
</div>
</div>
```
* data-method : The method for sending server request "Post/Get"
For Example
```html
<div class="outerlayer" data-method="post" data-json="myjson/getcountries">
<div class="innerlayer" data-follow="true">//This is the repitative layer because data-follow attribute here
<span data-key="countrycode"></span>
<span data-key="countryId"></span>
<span data-key="countryName"></span>
<a data-countryId-inline="href" href="gotocountry/{countryId}"></a>
<input data-countryId-attr="href" />
</div>
</div>
```
## Events
* beforeappend : This event will triggers before for each data-key or data-{json key}-attr or inline JLBinder selectors before the JLBinder functionality of particular cell.
* afterappend : This event will triggers after for each data-key or data-{json key}-attr or inline JLBinder selectors after the JLBinder functionality of particular cell.
For example if you need to convert your value to lower case manually
```html
<div class="outerlayer" data-method="post" data-json="myjson/getcountries">
<div class="innerlayer" data-follow="true">//This is the repitative layer because data-follow attribute here
<span data-key="countrycode" class="countrycode"></span>
<span data-key="countryId"></span>
<span data-key="countryName"></span>
<a data-countryId-inline="href" href="gotocountry/{countryId}"></a>
<input data-countryId-attr="href" />
</div>
</div>
```
```javscript
$(document).ready(function(){
$('body').on('afterappend','.countrycode',function(e,obj){
//e=eventd data
//obj= your json value and key
/// Your js statement here
$(this).html(obj.value.toLowerCase());

})
})
```
* beforeappendrow : This event will triggers before append each rows.
* afterappendrow : This event will triggers after append each rows.
* beforeappendcomplete : This event will triggers before start binding after json request.
* afterappendcomplete : This event will triggers after complete bindings.

