var App =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports) {

var _this = this;

var page = /tools/;
var match = page.exec(document.URL);

if (match) {
  tools.init();
}

var tools = {
  cookie_name: 'tools_auth_token_',
  ch_id_name: 'tools_channel_id',
  channelId: channelId,
  init: function init() {
    var list = document.getElementsByClassName("b-content");
    var getTokenBtn = document.createElement('button');
    getTokenBtn.setAttribute("class", "js-get-token");

    getTokenBtn.onclick = function (e) {
      e.preventDefault();
      tools.checkUser();
    };

    getTokenBtn.innerHTML = 'Get token';
    list[0].appendChild(getTokenBtn);
  },
  checkUser: function checkUser() {
    loadOn();
    chrome.runtime.sendMessage({
      action: "get_id"
    }, function (response) {
      _this.getChannelId(response);
    });
  },
  getChannelId: function getChannelId(response) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(response, "text/html");
    var elArr = Array.prototype.slice.call(doc.getElementsByTagName("script"));
    var sText = elArr.filter(function (el) {
      return el.textContent.indexOf("GUIDED_HELP") > -1;
    });

    if (sText[0].textContent.indexOf('creator_channel_id","value":"') > -1) {
      channelId = /creator_channel_id","value":"([^"]+)"/.exec(sText[0].textContent)[1];
    } else {
      sText = elArr.filter(function (el) {
        return el.textContent.indexOf("GAPI_HINT_PARAMS") > -1;
      });
      channelId = /creator_channel_id":"([^"]+)"/.exec(sText[0].textContent)[1];
    }

    _this.getChannelTitle(channelId);

    _this.checkAuthState(elArr, channelId);
  },
  getChannelTitle: function getChannelTitle(channelId) {
    chrome.runtime.sendMessage({
      action: "get_title",
      id: channelId
    }, function (response) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(response, "text/html");

      if (doc.getElementsByTagName("title")[1]) {
        title = doc.getElementsByTagName("title")[1].text;
      } else {
        title = doc.getElementsByTagName("title")[0].text;
      }
    });
  },
  checkAuthState: function checkAuthState(scripts, channelId) {
    var listWrap = document.getElementsByClassName('b-list-wrap')[0];
    var tokenInp = document.getElementsByClassName('js-auth-token')[0];
    var tagText = scripts.filter(function (el) {
      return el.textContent.indexOf("GAPI_HINT_PARAMS") > -1;
    });

    if (typeof tagText[0] === 'undefined') {
      alert('Auth token error!');
      listWrap.setAttribute('id', 'disable');
      listWrap.innerHTML = '';
      loadOff();
      return false;
    }

    var auth_token = '';

    if (tagText[0].textContent.indexOf('"XSRF_TOKEN"') > -1) {
      auth_token = /XSRF_TOKEN":"([^"]+)"/.exec(tagText[0].textContent)[1];
    } else {
      tagText = scripts.filter(function (el) {
        return el.textContent.indexOf("GOOGLE_HELP_CONTEXT") > -1;
      });
      auth_token = /XSRF_TOKEN': "([^"]+)"/.exec(tagText[0].textContent)[1];
    }

    tokenInp.value = auth_token;

    _this.setCookie(channelId, auth_token);

    loadOff();

    _this.checkChannelId(channelId);
  },
  checkChannelId: function checkChannelId(channelId) {
    if (localStorage.getItem(ch_id_name) != channelId) {
      localStorage.setItem(ch_id_name, channelId);
    } else {
      localStorage.setItem(ch_id_name, channelId);
    }
  },
  setCookie: function setCookie(channelId, auth_token) {
    var now = new Date();
    var time = now.getTime();
    var expireTime = time + 1000 * 3300;
    now.setTime(expireTime);
    document.cookie = cookie_name + channelId + "=" + auth_token + "; path=/; expires=" + now.toGMTString();
  },
  showPopup: function showPopup(text) {
    $('.b-popup').addClass('_show');
    $('.b-popup-box').html(text);
    setTimeout(function () {
      _this.hidePopup();
    }, 1500);
  },
  hidePopup: function hidePopup() {
    $('.b-popup').removeClass('_show');
  },
  getCookie: function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }
};

/***/ })

/******/ });
//# sourceMappingURL=App.js.map