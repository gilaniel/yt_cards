!function(t){function e(e){for(var a,s,i=e[0],u=e[1],c=e[2],p=0,d=[];p<i.length;p++)s=i[p],Object.prototype.hasOwnProperty.call(o,s)&&o[s]&&d.push(o[s][0]),o[s]=0;for(a in u)Object.prototype.hasOwnProperty.call(u,a)&&(t[a]=u[a]);for(l&&l(e);d.length;)d.shift()();return r.push.apply(r,c||[]),n()}function n(){for(var t,e=0;e<r.length;e++){for(var n=r[e],a=!0,i=1;i<n.length;i++){var u=n[i];0!==o[u]&&(a=!1)}a&&(r.splice(e--,1),t=s(s.s=n[0]))}return t}var a={},o={3:0},r=[];function s(e){if(a[e])return a[e].exports;var n=a[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,s),n.l=!0,n.exports}s.m=t,s.c=a,s.d=function(t,e,n){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},s.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(t,e){if(1&e&&(t=s(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(s.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var a in t)s.d(n,a,function(e){return t[e]}.bind(null,a));return n},s.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="";var i=window.webpackJsonp=window.webpackJsonp||[],u=i.push.bind(i);i.push=e,i=i.slice();for(var c=0;c<i.length;c++)e(i[c]);var l=u;r.push([7,4]),n()}({0:function(t,e,n){"use strict";function a(t,e){for(var n=0;n<e.length;n++){var a=e[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}n.d(e,"a",(function(){return o}));var o=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.port=5e3,this.develop=!1,this.url=this.develop?"http://127.0.0.1:"+port:"https://redmine.kedoo.com"}var e,n,o;return e=t,(n=[{key:"login",value:function(t){return $.post(this.url+"/login",t)}},{key:"addIssue",value:function(t){var e=new FormData;for(var n in t)e.append(n,t[n]);return $.ajax({type:"POST",url:this.url+"/add_issue",data:e,contentType:!1,processData:!1})}},{key:"fetchStatus",value:function(t){return $.post(this.url+"/status",t)}},{key:"fetchTasks",value:function(t){return $.post(this.url+"/issues",t)}},{key:"updateIssue",value:function(t){return $.post(this.url+"/update_issue",t)}}])&&a(e.prototype,n),o&&a(e,o),t}()},7:function(t,e,n){"use strict";n.r(e);var a=n(0);n(3);function o(t,e){for(var n=0;n<e.length;n++){var a=e[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}var r=new a.a,s=function(){function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.options=e}var e,n,a;return e=t,(n=[{key:"ui",value:function(){return{tasks:$(".tasks"),loader:$(".loader"),loader_t:$(".loader_t"),contextMenu:$(".context-menu")}}},{key:"fetchTasks",value:function(){var t=this;r.fetchTasks(this.options).then((function(e){t.taskList=e,t.ui().loader.toggle(),t.setTasks()}),(function(){t.ui().loader.toggle(),alert("error")}))}},{key:"setTasks",value:function(){var t=this;this.ui().tasks.html(""),this.taskList.map((function(e){var n,a,o;t.ui().tasks.append('<div class="row task-row align-items-center" data-id="'.concat((n=e).id,'">\n            <div class="col-1"><a href="https://iricom.plan.io/issues/').concat(n.id,'" target="_blank">').concat(n.id,'</a></div>\n            <div class="col-1">\n            <select class="js-status-change" data-id="').concat(n.id,'">\n              ').concat((a=n.status.id,o="",[{name:"To Do",value:1},{name:"In Progress",value:2},{name:"Completed",value:5},{name:"Block",value:6}].map((function(t){var e=t.value===a?"selected":"";o+='<option value="'.concat(t.value,'" ').concat(e,">").concat(t.name,"</option>")})),o),'\n              </select>\n            </div>\n            <div class="col-4"><a href="https://iricom.plan.io/issues/').concat(n.id,'" target="_blank">').concat(n.subject,'</a></div>\n            <div class="col-2">').concat(n.assigned_to.name,'</div>\n            <div class="col-2">').concat(n.author.name,'</div>\n            <div class="col-2">').concat(n.updated_on.replace("Z","").split("T").join(" "),"</div>\n          </div>"))}))}},{key:"setContextPosition",value:function(t){this.ui().contextMenu.toggle(!0).css({left:t.pageX+10,top:t.pageY-$(window).scrollTop()})}},{key:"updateIssue",value:function(t){var e=this;this.ui().loader_t.toggleClass("show",!0),r.updateIssue(t).then((function(){console.log("done"),e.ui().loader_t.toggleClass("show",!1)}),(function(){alert("Error update"),e.ui().loader_t.toggleClass("show",!1)}))}},{key:"handleStatusChange",value:function(){var t=this;$("body").on("change",".js-status-change",(function(e){var n=e.currentTarget.value,a={issue_id:e.currentTarget.dataset.id,status_id:n,api_key:t.options.api_key};t.updateIssue(a)}))}}])&&o(e.prototype,n),a&&o(e,a),t}();chrome.storage.local.get(["api_key"],(function(t){var e=new s(t);e.fetchTasks(),e.handleStatusChange()}))}});
//# sourceMappingURL=tasks.js.map