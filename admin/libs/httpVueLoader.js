!function(t,e){"object"==typeof module&&"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define([],e):t.httpVueLoader=e()}(this,function(){"use strict";var t=0;function e(t,e){this.component=t,this.elt=e}function n(t,e){this.component=t,this.elt=e,this.module={exports:{}}}function i(t,e){this.component=t,this.elt=e}function o(t){this.name=t,this.template=null,this.script=null,this.styles=[],this._scopeId=""}function s(t){return t}function r(t){var e=t.match(/(.*?)([^/]+?)\/?(\.vue)?(\?.*|#.*|$)/);return{name:e[2],url:e[1]+e[2]+(void 0===e[3]?"/index.vue":e[3])+e[4]}}function u(t,e){return"./"===e.substr(0,2)||"../"===e.substr(0,3)?t+e:e}function l(t,e){var n=r(t);return l.load(n.url,e)}return e.prototype={withBase:function(t){var e;if(this.component.baseURI){(e=document.createElement("base")).href=this.component.baseURI;var n=this.component.getHead();n.insertBefore(e,n.firstChild)}t.call(this),e&&this.component.getHead().removeChild(e)},scopeStyles:function(t,e){function n(){for(var n=t.sheet,i=n.cssRules,o=0;o<i.length;++o){var s=i[o];if(1===s.type){var r=[];s.selectorText.split(/\s*,\s*/).forEach(function(t){r.push(e+" "+t);var n=t.match(/([^ :]+)(.+)?/);r.push(n[1]+e+(n[2]||""))});var u=r.join(",")+s.cssText.substr(s.selectorText.length);n.deleteRule(o),n.insertRule(u,o)}}}try{n()}catch(e){if(e instanceof DOMException&&e.code===DOMException.INVALID_ACCESS_ERR)return t.sheet.disabled=!0,void t.addEventListener("load",function e(){t.removeEventListener("load",e),setTimeout(function(){n(),t.sheet.disabled=!1})});throw e}},compile:function(){var t=null!==this.template,e=this.elt.hasAttribute("scoped");if(e){if(!t)return;this.elt.removeAttribute("scoped")}return this.withBase(function(){this.component.getHead().appendChild(this.elt)}),e&&this.scopeStyles(this.elt,"["+this.component.getScopeId()+"]"),Promise.resolve()},getContent:function(){return this.elt.textContent},setContent:function(t){this.withBase(function(){this.elt.textContent=t})}},n.prototype={getContent:function(){return this.elt.textContent},setContent:function(t){this.elt.textContent=t},compile:function(t){var e=function(t){return l.require(u(this.component.baseURI,t))}.bind(this),n=function(t,e){return l(u(this.component.baseURI,t),e)}.bind(this);try{Function("exports","require","httpVueLoader","module",this.getContent()).call(this.module.exports,this.module.exports,e,n,this.module)}catch(t){if(!("lineNumber"in t))return Promise.reject(t);var i=responseText.replace(/\r?\n/g,"\n"),o=i.substr(0,i.indexOf(script)).split("\n").length+t.lineNumber-1;throw new t.constructor(t.message,url,o)}return Promise.resolve(this.module.exports).then(l.scriptExportsHandler.bind(this)).then(function(t){this.module.exports=t}.bind(this))}},i.prototype={getContent:function(){return this.elt.innerHTML},setContent:function(t){this.elt.innerHTML=t},getRootElt:function(){var t=this.elt.content||this.elt;if("firstElementChild"in t)return t.firstElementChild;for(t=t.firstChild;null!==t;t=t.nextSibling)if(t.nodeType===Node.ELEMENT_NODE)return t;return null},compile:function(){return Promise.resolve()}},o.prototype={getHead:function(){return document.head||document.getElementsByTagName("head")[0]},getScopeId:function(){return""===this._scopeId&&(this._scopeId="data-s-"+(t++).toString(36),this.template.getRootElt().setAttribute(this._scopeId,"")),this._scopeId},load:function(t){return l.httpRequest(t).then(function(o){this.baseURI=t.substr(0,t.lastIndexOf("/")+1);var s=document.implementation.createHTMLDocument("");s.body.innerHTML=(this.baseURI?'<base href="'+this.baseURI+'">':"")+o;for(var r=s.body.firstChild;r;r=r.nextSibling)switch(r.nodeName){case"TEMPLATE":this.template=new i(this,r);break;case"SCRIPT":this.script=new n(this,r);break;case"STYLE":this.styles.push(new e(this,r))}return this}.bind(this))},_normalizeSection:function(t){return(null!==t&&t.elt.hasAttribute("src")?l.httpRequest(t.elt.getAttribute("src")).then(function(e){return t.elt.removeAttribute("src"),e}):Promise.resolve(null)).then(function(e){if(null!==t&&t.elt.hasAttribute("lang")){var n=t.elt.getAttribute("lang");return t.elt.removeAttribute("lang"),l.langProcessor[n.toLowerCase()].call(this,null===e?t.getContent():e)}return e}.bind(this)).then(function(e){null!==e&&t.setContent(e)})},normalize:function(){return Promise.all(Array.prototype.concat(this._normalizeSection(this.template),this._normalizeSection(this.script),this.styles.map(this._normalizeSection))).then(function(){return this}.bind(this))},compile:function(){return Promise.all(Array.prototype.concat(this.template&&this.template.compile(),this.script&&this.script.compile(),this.styles.map(function(t){return t.compile()}))).then(function(){return this}.bind(this))}},l.load=function(t,e){return function(){return new o(e).load(t).then(function(t){return t.normalize()}).then(function(t){return t.compile()}).then(function(t){var e=null!==t.script?t.script.module.exports:{};return null!==t.template&&(e.template=t.template.getContent()),void 0===e.name&&void 0!==t.name&&(e.name=t.name),e._baseURI=t.baseURI,e})}},l.register=function(t,e){var n=r(e);t.component(n.name,l.load(n.url))},l.install=function(t){t.mixin({beforeCreate:function(){var e=this.$options.components;for(var n in e)if("string"==typeof e[n]&&"url:"===e[n].substr(0,4)){var i=r(e[n].substr(4)),o="_baseURI"in this.$options?u(this.$options._baseURI,i.url):i.url;isNaN(n)?e[n]=l.load(o,n):e[n]=t.component(i.name,l.load(o,i.name))}}})},l.require=function(t){return window[t]},l.httpRequest=function(t){return new Promise(function(e,n){var i=new XMLHttpRequest;i.open("GET",t),i.responseType="text",i.onreadystatechange=function(){4===i.readyState&&(i.status>=200&&i.status<300?e(i.responseText):n(i.status))},i.send(null)})},l.langProcessor={html:s,js:s,css:s},l.scriptExportsHandler=s,l});