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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/content_scripts.js":
/*!********************************!*\
  !*** ./src/content_scripts.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./src/helpers.js");








function listItemTmp(item) {
  return "<div class=\"js-list-item\">".concat(item, "</div>");
}

/* harmony default export */ __webpack_exports__["default"] = (function () {
  var cookie_name = "tools_auth_token_";
  var ch_id_name = "tools_channel_id";
  var channelId = "";
  var topPlVideos = [];
  var clearVideoCount = 0;
  var doneVideoCount = 0;
  var templates = {
    IDS: [],
    MESSAGES: [],
    TEASERS: []
  };
  checkUser();

  function checkUser() {
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOn"])();
    chrome.runtime.sendMessage({
      action: "get_id"
    }, function (response) {
      getChannelId(response);
    });
    getTemplates();
  }

  function getChannelId(response) {
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

    getChannelTitle(channelId);
    checkAuthState(elArr, channelId);
  }

  function getChannelTitle(channelId) {
    chrome.runtime.sendMessage({
      action: "get_title",
      id: channelId
    }, function (response) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(response, "text/html");
      var title = "";

      if (doc.getElementsByTagName("title")[1]) {
        title = doc.getElementsByTagName("title")[1].text;
      } else {
        title = doc.getElementsByTagName("title")[0].text;
      }

      $(".channel-title").html(title);
    });
  }

  function checkAuthState(scripts, channelId) {
    var tagText = scripts.filter(function (el) {
      return el.textContent.indexOf("GAPI_HINT_PARAMS") > -1;
    });

    if (typeof tagText[0] === "undefined") {
      alert("Auth token error!");
      Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOff"])();
      return false;
    }

    var auth_token = "";

    if (tagText[0].textContent.indexOf('"XSRF_TOKEN"') > -1) {
      auth_token = /XSRF_TOKEN":"([^"]+)"/.exec(tagText[0].textContent)[1];
    } else {
      tagText = scripts.filter(function (el) {
        return el.textContent.indexOf("GOOGLE_HELP_CONTEXT") > -1;
      });
      auth_token = /XSRF_TOKEN': "([^"]+)"/.exec(tagText[0].textContent)[1];
    }

    setCookie(channelId, auth_token);
    getTopPlVideos();
    checkChannelId(channelId);
  }

  function getTopPlVideos() {
    chrome.runtime.sendMessage({
      action: "get_pl_videos",
      id: channelId
    }, function (response) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(response, "text/html");
      var elArr = Array.prototype.slice.call(doc.getElementsByTagName("script"));
      var sText = elArr.filter(function (el) {
        return el.textContent.indexOf("responseContext") > -1;
      });
      var ytData = sText[0].textContent.split('window["ytInitialData"] = ')[1].split(";");
      topPlVideos = JSON.parse(ytData[0]).contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
      clearVideoCount = topPlVideos.length;
      topPlVideos.forEach(function (item) {
        var video = item.playlistVideoRenderer;

        if (video.lengthSeconds) {
          chrome.runtime.sendMessage({
            action: "check_card",
            v: video.videoId
          }, function (response) {
            item["cards"] = [];

            if (response.feature_templates.length && response.feature_templates[0].key) {
              item["has_card"] = true;
              item["cards"] = response.feature_templates;
              doneVideoCount++;
              clearVideoCount--;
            }

            Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOff"])();
            $(".js-videos-count").removeClass("hide");
            $(".js-all-count").text(clearVideoCount);
            $(".js-done-count").text(doneVideoCount);
          });
        }
      });
    });
  }

  function setCard(videoData, video, clearResolve) {
    return new Promise(function (setResolve) {
      var params = {
        key: "",
        type: "video",
        start_ms: 30000,
        show_warnings: true,
        video_item_id: "",
        video_url: "",
        custom_message: "",
        teaser_text: "",
        session_token: Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["getCookie"])(cookie_name + channelId)
      };
      var lengthStep = 120 * 1000;

      if (videoData.lengthSeconds < 600) {
        lengthStep = Math.round(videoData.lengthSeconds / 6 * 1000);
        params.start_ms = lengthStep;
      }

      var links = [];
      var messages = [];
      var teasers = [];
      $(".video_item_id").each(function (idx, item) {
        if (item.value) {
          links.push(item.value);
        }
      });
      $(".custom_message").each(function (idx, item) {
        messages.push(item.value ? item.value : '');
      });
      $(".teaser_text").each(function (idx, item) {
        teasers.push(item.value ? item.value : '');
      });

      var setCardRequest = function setCardRequest(cardVideoId, idx) {
        if (cardVideoId.substr(0, 2) === 'UC') {
          delete params.action_create_video;
          params['action_create_collaborator'] = 1;
          params['channel_url'] = cardVideoId;
          params['type'] = 'collaborator';
        } else {
          delete params.channel_url;
          delete params.action_create_collaborator;
          params['action_create_video'] = 1;
          params['type'] = 'video';
        }

        params.video_item_id = cardVideoId;
        params.custom_message = messages[idx];
        params.teaser_text = teasers[idx];

        if (idx > 0) {
          params.start_ms += lengthStep;
        }

        $('.cat-loader').addClass('_show');
        return new Promise(function (resolve, reject) {
          chrome.runtime.sendMessage({
            action: "set_card",
            v: videoData.videoId,
            params: params
          }, function (response) {
            Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('IDS', params.video_item_id);
            Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('MESSAGES', params.custom_message);
            Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('TEASERS', params.teaser_text);
            resolve();

            if (response.error) {
              reject();
            }

            if (idx === links.length - 1) {
              var _templates = response.split('response">')[1].split("</textarea>")[0];
              video["cards"] = JSON.parse(_templates).feature_templates;
              clearVideoCount--;
              doneVideoCount++;
              video["has_card"] = true;
              $(".js-all-count").text(clearVideoCount);
              $(".js-done-count").text(doneVideoCount);
              getTemplates();
              setTimeout(function () {
                $('.cat-loader').removeClass('_show');
                clearResolve ? clearResolve() : setResolve();
              }, 1000);
            }
          });
        });
      };

      links.reduce(function (previousPromise, cardVideoId, idx) {
        return previousPromise.then(function () {
          return setCardRequest(cardVideoId, idx);
        });
      }, Promise.resolve());
    });
  }

  function clearCard(options) {
    var videoData = options.videoData,
        video = options.video,
        set = options.set;
    return new Promise(function (mainResolve) {
      var setCardRequest = function setCardRequest(item, idx) {
        var params = {
          key: item.key,
          type: item.type,
          start_ms: item.start_ms,
          show_warnings: true,
          video_item_id: item.video_id,
          video_url: "",
          channel_url: item.channel_url,
          custom_message: item.custom_message,
          teaser_text: item.teaser_text,
          session_token: Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["getCookie"])(cookie_name + channelId)
        };
        return new Promise(function (resolve) {
          $('.cat-loader').addClass('_show');
          chrome.runtime.sendMessage({
            action: "clear_card",
            v: videoData.videoId,
            params: params
          }, function () {
            resolve();

            if (idx === video.cards.length - 1) {
              delete video["has_card"];
              clearVideoCount++;
              doneVideoCount--;
              $(".js-all-count").text(clearVideoCount);
              $(".js-done-count").text(doneVideoCount);
              $('.cat-loader').removeClass('_show');
              set ? setCard(videoData, video, mainResolve) : mainResolve();
            }
          });
        });
      };

      video.cards.reduce(function (previousPromise, item, idx) {
        return previousPromise.then(function () {
          return setCardRequest(item, idx);
        });
      }, Promise.resolve());
    });
  }

  function checkChannelId(channelId) {
    if (localStorage.getItem(ch_id_name) != channelId) {
      localStorage.setItem(ch_id_name, channelId);
    } else {
      localStorage.setItem(ch_id_name, channelId);
    }
  }

  function setCookie(channelId, auth_token) {
    var now = new Date();
    var time = now.getTime();
    var expireTime = time + 1000 * 3300;
    now.setTime(expireTime);
    document.cookie = cookie_name + channelId + "=" + auth_token + "; path=/; expires=" + now.toGMTString();
  }

  function getTemplates() {
    templates.IDS = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageGetItem"])('IDS') || [];
    templates.MESSAGES = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageGetItem"])('MESSAGES') || [];
    templates.TEASERS = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageGetItem"])('TEASERS') || [];
    $('.list-content').html('');
    templates.IDS.forEach(function (item) {
      $('.ids-list').append(listItemTmp(item));
    });
    templates.MESSAGES.forEach(function (item) {
      $('.messages-list').append(listItemTmp(item));
    });
    templates.TEASERS.forEach(function (item) {
      $('.teasers-list').append(listItemTmp(item));
    });
  } // SET CARDS


  $(".js-set-card-btn").on("click", function (e) {
    e.preventDefault();
    var links = [];
    $(".video_item_id").each(function (idx, item) {
      if (item.value) {
        links.push(item.value);
      }
    });
    if (!links.length) return;
    topPlVideos.reduce(function (previousPromise, item) {
      return previousPromise.then(function () {
        if (item.has_card) {
          return clearCard({
            videoData: item.playlistVideoRenderer,
            video: item,
            set: true
          });
        }

        return setCard(item.playlistVideoRenderer, item);
      });
    }, Promise.resolve());
  }); // CLEAR CARDS

  $(".js-clear-card-btn").on("click", function (e) {
    e.preventDefault();
    topPlVideos.reduce(function (previousPromise, item) {
      if (!item.has_card) {
        return Promise.resolve();
      }

      return previousPromise.then(function () {
        return clearCard({
          videoData: item.playlistVideoRenderer,
          video: item,
          set: false
        });
      });
    }, Promise.resolve());
  });
  $('.list-ico').on('click', function (e) {
    var type = e.currentTarget.dataset.type;
    var btn = $(e.currentTarget);
    btn.toggleClass('open');

    if (templates[type].length) {
      if (btn.hasClass('open')) {
        $('.list-block').closest('div').removeClass('focus');
        btn.closest('div').addClass('focus');
      } else {
        $('.list-ico').removeClass('open');
        btn.closest('div').removeClass('focus');
      } // $(e.currentTarget).closest('div').toggleClass('focus');

    }
  }); // HIDE LIST ON ESC PRESS

  $('body').keydown(function (e) {
    if (e.which === 27) {
      $('.list-ico').removeClass('open');
      $('.list-block').removeClass('focus');
    }
  }); // SET LIST ITEM VALUE TO INPUT

  $('body').on('click', '.js-list-item', function (e) {
    var value = e.currentTarget.innerHTML;
    $(e.currentTarget).parent().siblings('input').val(value).trigger("change");
    $('.list-block').removeClass('focus');
    $('.list-ico').removeClass('open');
  });
  $('.video_item_id').on('change', function (e) {
    var item = $(e.currentTarget);
    var id = item.data('id');
    var teaser = $("input.teaser_text[data-id=\"".concat(id, "\"]"));
    var message = $("input.custom_message[data-id=\"".concat(id, "\"]"));
    var val = item.val();

    if (val.substr(0, 2) === 'UC') {
      if (!teaser.val()) {
        teaser.addClass('b-input-error');
      }

      if (!message.val()) {
        message.addClass('b-input-error');
      }
    } else {
      teaser.removeClass('b-input-error');
      message.removeClass('b-input-error');
    }
  });
  $('.custom_message,.teaser_text').on('change input', function (e) {
    var item = $(e.currentTarget);
    var id = item.data('id');
    var video = $("input.video_item_id[data-id=\"".concat(id, "\"]"));

    if (video.val().substr(0, 2) === 'UC') {
      if (item.val()) {
        item.removeClass('b-input-error');
      } else {
        item.addClass('b-input-error');
      }
    }
  });
});

/***/ }),

/***/ "./src/helpers.js":
/*!************************!*\
  !*** ./src/helpers.js ***!
  \************************/
/*! exports provided: loadOn, showPopup, hidePopup, loadOff, getCookie, localStorageSetItem, localStorageGetItem */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadOn", function() { return loadOn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "showPopup", function() { return showPopup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hidePopup", function() { return hidePopup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadOff", function() { return loadOff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCookie", function() { return getCookie; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "localStorageSetItem", function() { return localStorageSetItem; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "localStorageGetItem", function() { return localStorageGetItem; });
function loadOn() {
  $(".b-loader").show();
}
function showPopup(text) {
  $(".b-popup").addClass("_show");
  $(".b-popup-box").html(text);
  setTimeout(function () {
    hidePopup();
  }, 1500);
}
function hidePopup() {
  $(".b-popup").removeClass("_show");
}
function loadOff() {
  $(".b-loader").hide();
}
function getCookie(name) {
  var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function localStorageSetItem(key, value) {
  if (!value) return;
  var oldArray = localStorageGetItem(key);

  if (!oldArray) {
    oldArray = [];
  }

  var newArray = unique(oldArray.concat(value));
  localStorage.setItem(key, JSON.stringify(newArray));
}
function localStorageGetItem(key) {
  return JSON.parse(localStorage.getItem(key));
}

function unique(arr) {
  var i,
      len = arr.length,
      out = [],
      obj = {};

  for (i = 0; i < len; i++) {
    obj[arr[i]] = 0;
  }

  for (i in obj) {
    out.push(i);
  }

  return out;
}

;

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _content_scripts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./content_scripts */ "./src/content_scripts.js");

var page = /tools/;
var match = page.exec(document.URL);

if (match) {
  Object(_content_scripts__WEBPACK_IMPORTED_MODULE_0__["default"])();
}

/***/ })

/******/ });
//# sourceMappingURL=content_scripts.js.map