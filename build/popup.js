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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/popup/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/popup/index.js":
/*!****************************!*\
  !*** ./src/popup/index.js ***!
  \****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _services_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../services/index */ "./src/services/index.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }



var Popup =
/*#__PURE__*/
function () {
  function Popup() {
    _classCallCheck(this, Popup);

    this.id = chrome.app.getDetails().id;
    this.autorized = false;
    this.apiKey = false;
  }

  _createClass(Popup, [{
    key: "ui",
    value: function ui() {
      return {
        screenBtn: $('.js-make-screen-btn'),
        loginForm: $('.login-form'),
        sendBtn: $('.js-send-btn'),
        error: $('.error'),
        loader: $('.loader')
      };
    }
  }, {
    key: "fetchStatus",
    value: function fetchStatus() {
      var _this = this;

      Object(_services_index__WEBPACK_IMPORTED_MODULE_0__["status"])({
        key: this.apiKey
      }).then(function () {
        _this.autorized = true;
        setTimeout(function () {
          _this.toggleLoad(true);

          _this.showContent();
        }, 500);
      }, function () {
        _this.autorized = false;

        _this.toggleLoad(true);

        _this.showContent();
      });
    }
  }, {
    key: "getApiKey",
    value: function getApiKey() {
      var _this2 = this;

      chrome.storage.local.get('apiKey', function (result) {
        _this2.apiKey = result.apiKey;

        _this2.fetchStatus();
      });
    }
  }, {
    key: "showContent",
    value: function showContent() {
      this.ui().screenBtn.toggleClass('hidden', !this.autorized);
      this.ui().loginForm.toggleClass('hidden', this.autorized);
    }
  }, {
    key: "fetchTabData",
    value: function fetchTabData() {
      var _this3 = this;

      chrome.tabs.getSelected(function (data) {
        _this3.setTabData(data);
      });
    }
  }, {
    key: "setTabData",
    value: function setTabData(data) {
      var _this4 = this;

      chrome.storage.local.set({
        'image': this.base64,
        'url': data.url,
        'title': data.title
      }, function () {
        _this4.openNewTab();
      });
    }
  }, {
    key: "openNewTab",
    value: function openNewTab() {
      var win = window.open("chrome-extension://".concat(popup.id, "/editor.html?blank"), '_blank');
      win.focus();
    }
  }, {
    key: "toggleLoad",
    value: function toggleLoad(state) {
      this.ui().loader.toggleClass('hidden', state);
    }
  }]);

  return Popup;
}();

var popup = new Popup();
$(function () {
  popup.getApiKey();
  popup.ui().sendBtn.on('click', function (e) {
    e.preventDefault();
    var data = popup.ui().loginForm.serializeArray();
    popup.toggleLoad(false);
    Object(_services_index__WEBPACK_IMPORTED_MODULE_0__["login"])(data).then(function (payload) {
      chrome.storage.local.set({
        'apiKey': payload
      });
      popup.apiKey = payload;
      popup.autorized = true;
      popup.toggleLoad(true);
      popup.showContent();
      popup.ui().error.addClass('hidden');
    }, function (error) {
      popup.toggleLoad(true);
      popup.ui().error.removeClass('hidden').html('error');
    });
  });
  popup.ui().screenBtn.on('click', function () {
    chrome.tabs.captureVisibleTab(null, {}, function (base64) {
      popup.base64 = base64;
      popup.fetchTabData();
    });
  });
});

/***/ }),

/***/ "./src/services/index.js":
/*!*******************************!*\
  !*** ./src/services/index.js ***!
  \*******************************/
/*! exports provided: login, addIssue, status */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "login", function() { return login; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addIssue", function() { return addIssue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "status", function() { return status; });
function login(data) {
  return $.post('http://127.0.0.1:8010/login', data);
}
function addIssue(options) {
  var data = new FormData();

  for (var i in options) {
    data.append(i, options[i]);
  }

  return $.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:8010/add_issue',
    data: data,
    contentType: false,
    processData: false
  });
}
function status(data) {
  return $.post('http://127.0.0.1:8010/status', data);
}

/***/ })

/******/ });
//# sourceMappingURL=popup.js.map