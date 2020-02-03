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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/editor/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/editor/index.js":
/*!*****************************!*\
  !*** ./src/editor/index.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _services_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../services/index */ "./src/services/index.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


chrome.storage.local.get(['image', 'title', 'url', 'api_key'], function (result) {
  var editor = new Editor(result);
  editor.setImage();
  editor.ui().clearBtn.on('click', function () {
    editor.clear();
  });
  editor.ui().lineWidth.on('change', function (e) {
    var lineWidth = Number(e.currentTarget.value);
    editor.canvas.freeDrawingBrush.width = lineWidth;
    editor.ui().lineWidth.val(lineWidth);
  });
  editor.ui().sendBtn.on('click', function () {
    editor.sendData();
  });
});

var Editor =
/*#__PURE__*/
function () {
  function Editor(options) {
    _classCallCheck(this, Editor);

    this.options = options;
    this.canvas = new fabric.Canvas('canvas', {
      isDrawingMode: true
    });
    this.lineWidth = 5;
  }

  _createClass(Editor, [{
    key: "ui",
    value: function ui() {
      return {
        clearBtn: $('.clear-canvas'),
        lineWidth: $('.line-width-range'),
        sendBtn: $('.send'),
        description: $('textarea')
      };
    }
  }, {
    key: "setImage",
    value: function setImage() {
      var _this = this;

      var image = new Image();

      image.onload = function () {
        $('canvas').attr('height', image.height).outerHeight(image.height);
        $('canvas').attr('width', image.width).outerWidth(image.width);
        $('.canvas-container').outerHeight(image.height);
        $('.canvas-container').outerWidth(image.width);
        fabric.Image.fromURL(_this.options.image, function (img) {
          _this.canvas.setBackgroundImage(img, _this.canvas.renderAll.bind(_this.canvas));
        });

        _this.setOptions();
      };

      image.src = this.options.image;
    }
  }, {
    key: "setOptions",
    value: function setOptions() {
      this.canvas.freeDrawingBrush.width = this.lineWidth;
      this.canvas.freeDrawingBrush.color = '#f92626';
    }
  }, {
    key: "clear",
    value: function clear() {
      this.canvas.clear();
      this.setImage();
    }
  }, {
    key: "sendData",
    value: function sendData() {
      var _this2 = this;

      if (this.ui().description.val()) {
        this.options['description'] = this.ui().description.val();
      } // const canvas = document.getElementById('canvas')


      this.canvas.getElement().toBlob(function (blob) {
        _this2.options.image = blob;
        Object(_services_index__WEBPACK_IMPORTED_MODULE_0__["addIssue"])(_this2.options).then(function (payload) {
          alert('Success!!!!!!!!!!');
        }, function () {
          alert('error');
        });
      });
    }
  }]);

  return Editor;
}();

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
var PORT = 5000;
function login(data) {
  return $.post('http://127.0.0.1:' + PORT + '/login', data);
}
function addIssue(options) {
  var data = new FormData();

  for (var i in options) {
    data.append(i, options[i]);
  }

  return $.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:' + PORT + '/add_issue',
    data: data,
    contentType: false,
    processData: false
  });
}
function status(data) {
  return $.post('http://127.0.0.1:' + PORT + '/status', data);
}

/***/ })

/******/ });
//# sourceMappingURL=editor.js.map