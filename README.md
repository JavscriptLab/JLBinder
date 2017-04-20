# JLBinder
## Javascript Easy Binding By Jquery
It is an alternative for angular js binding functionlity by jquery
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
<input data-countryId-attr="href" />
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



