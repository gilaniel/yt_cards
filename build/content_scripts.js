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
  var ytVideos = [];
  var cardsTemplates = [];
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
    $('body').append('<script id="initApp"></script>');
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

    try {
      sText = sText[0].textContent.split('var ytInitialGuideData = JSON.parse(')[1].split(');')[0];
      sText = JSON.parse(sText);
      sText = JSON.parse(sText);
      var serviceParams = sText.responseContext.serviceTrackingParams;
      serviceParams.forEach(function (item) {
        if (item.service === 'GUIDED_HELP') {
          ytId = item.params[0].value;
        }
      });

      if (ytId) {
        checkAuthState(elArr, channelId);
        return;
      } else {
        throw new Error('no channel ID');
      }
    } catch (e) {
      console.log(e);
    }

    sText = elArr.filter(function (el) {
      return el.textContent.indexOf("GUIDED_HELP") > -1;
    });

    if (sText[0].textContent.indexOf('creator_channel_id","value":"') > -1) {
      channelId = /creator_channel_id","value":"([^"]+)"/.exec(sText[0].textContent)[1];
    } else {
      channelId = $(doc).find('.spf-link[title="Мой канал"]').attr('href') || $(doc).find('.spf-link[title="My channel"]').attr('href');
      channelId = channelId.split('/channel/')[1]; // sText = elArr.filter(function(el) {
      //   return el.textContent.indexOf("GAPI_HINT_PARAMS") > -1;
      // });
      // channelId = /creator_channel_id":"([^"]+)"/.exec(sText[0].textContent)[1];
    }

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
      getNewVideos(); // loadOff();
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

    setCookie(channelId, auth_token); // getNewVideos();

    getChannelTitle(channelId);
    localStorage.setItem(ch_id_name, channelId);
  }

  function getNewVideos() {
    $.get('/admin/cards?channel_id=' + channelId).then(function (payload) {
      var promiseArr = [];
      clearVideoCount += payload.data.videos.length;
      payload.data.videos.forEach(function (item) {
        var video = {
          playlistVideoRenderer: {
            videoId: item[0],
            lengthSeconds: item[1]
          }
        };
        ytVideos.push(video);
        checkVideoCard(item[0], video, promiseArr);
      });
      Promise.all(promiseArr).then(function (results) {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOff"])();
        $(".js-all-count").text(ytVideos.concat(topPlVideos).length);
      });
    });
  }

  function getTopPlVideos(plId) {
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOn"])();
    chrome.runtime.sendMessage({
      action: "get_pl_videos",
      plId: plId
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
      var promiseArr = [];
      topPlVideos.forEach(function (item) {
        var video = item.playlistVideoRenderer;

        if (video.lengthSeconds) {
          checkVideoCard(video.videoId, item, promiseArr);
        } else {
          clearVideoCount--;
        }
      });
      Promise.all(promiseArr).then(function (results) {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOff"])();
        $(".js-all-count").text(ytVideos.concat(topPlVideos).length);
      });
    });
  }

  function checkVideoCard(videoId, item, promiseArr) {
    var videoPromise = new Promise(function (resolve, reject) {
      chrome.runtime.sendMessage({
        action: "check_card",
        v: videoId
      }, function (response) {
        item["cards"] = [];

        if (response.feature_templates.length && response.feature_templates[0].key) {
          item["has_card"] = true;
          item["cards"] = response.feature_templates;
        }

        $(".js-videos-count").removeClass("hide");
        resolve(item);
      });
    });
    promiseArr.push(videoPromise);
  }

  function setCard(videos) {
    return new Promise(function (resolve, reject) {
      videos.forEach(function (item, idx, array) {
        chrome.runtime.sendMessage({
          action: "set_card",
          v: item.video.playlistVideoRenderer.videoId,
          params: item.params
        }, function (response) {
          var lastError = chrome.runtime.lastError;
          Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('IDS', item.params.video_item_id);
          Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('MESSAGES', item.params.custom_message);
          Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('TEASERS', item.params.teaser_text);

          if (lastError || response.error) {
            console.log(response);
            reject();
            return;
          }

          var allVideos = ytVideos.concat(topPlVideos);

          if (idx === array.length - 1) {
            console.log('done');
            resolve();
          } // if (idx === links.length - 1) {
          //   doneVideoCount ++;
          //   $('.progress-bar-fill').css('width',100 * (doneVideoCount) / allVideos.length + '%');
          //   let templates = response
          //     .split('response">')[1]
          //     .split("</textarea>")[0];
          //   video["cards"] = JSON.parse(templates).feature_templates;
          //   video["has_card"] = true;
          //   getTemplates();
          // }

        });
      });
    });
    promiseArr.push(videoPromise);
  }

  function clearCard(options) {
    var videoData = options.videoData,
        video = options.video,
        set = options.set;
    return new Promise(function (mainResolve) {
      var setCardRequest = function setCardRequest(item, idx) {
        var params = {
          key: item.key,
          // type: item.type,
          // start_ms: item.start_ms,
          // show_warnings: true,
          // video_item_id: item.video_id,
          // video_url: "",
          // channel_url: item.channel_url,
          // custom_message: item.custom_message,
          // teaser_text: item.teaser_text,
          session_token: Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["getCookie"])(cookie_name + channelId)
        };
        return new Promise(function (resolve) {
          chrome.runtime.sendMessage({
            action: "clear_card",
            v: videoData.videoId,
            params: params
          }, function () {
            resolve();

            if (idx === video.cards.length - 1) {
              delete video["has_card"];
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

  function copyCards(videoId) {
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOn"])();
    chrome.runtime.sendMessage({
      action: "check_card",
      v: videoId
    }, function (response) {
      if (response.feature_templates.length && response.feature_templates[0].key) {
        cardsTemplates = response.feature_templates;
        fillCards();
        Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOff"])();
      }
    });
  }

  function fillCards() {
    $('.card-block').each(function (idx, item) {
      if (!cardsTemplates[idx]) return;
      var id = cardsTemplates[idx].video_id || cardsTemplates[idx].playlist_id || cardsTemplates[idx].channel_url;
      var custom_message = cardsTemplates[idx].custom_message;
      var teaser_text = cardsTemplates[idx].teaser_text;
      item = $(item);
      item.find('.video_item_id').val(id);
      item.find('.custom_message').val(custom_message);
      item.find('.teaser_text').val(teaser_text);
    });
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
    doneVideoCount = 0;
    var sendArray = [];

    var _loop = function _loop(i) {
      topPlVideos.concat(ytVideos.slice(0, 5)).forEach(function (item, idx) {
        var messages = [];
        var teasers = [];
        $(".custom_message").each(function (idx, item) {
          messages.push(item.value ? item.value : '');
        });
        $(".teaser_text").each(function (idx, item) {
          teasers.push(item.value ? item.value : '');
        });
        var videoData = item.playlistVideoRenderer;
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

        if (links[i].indexOf('youtube') > -1) {
          delete params.action_create_video;
          params['action_create_collaborator'] = 1;
          params['channel_url'] = links[i];
          params['type'] = 'collaborator';
        } else {
          delete params.channel_url;
          delete params.action_create_collaborator;
          params['action_create_video'] = 1;
          params['type'] = 'video';
        }

        params.video_item_id = links[i];
        params.custom_message = messages[i];
        params.teaser_text = teasers[i];

        if (i > 0) {
          params.start_ms += lengthStep;
        }

        sendArray.push({
          video: item,
          params: params
        });
      });
    };

    for (var i = 0; i < links.length; i++) {
      _loop(i);
    }

    var size = 10;
    var subarray = [];

    for (var i = 0; i < Math.ceil(sendArray.length / size); i++) {
      subarray[i] = sendArray.slice(i * size, i * size + size);
    }

    subarray.reduce(function (previousPromise, subItem) {
      return previousPromise.then(function () {
        return setCard(subItem);
      })["catch"](function () {
        console.log('error');
      });
    }, Promise.resolve());
    return;
    topPlVideos.concat(ytVideos.slice(0, 5)).reduce(function (previousPromise, item) {
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
    topPlVideos.concat(ytVideos).reduce(function (previousPromise, item) {
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
  });
  $('.js-get-list').on('click', function () {
    var plId = $('.js-pl-id').val();
    if (!plId) return;
    getTopPlVideos(plId);
  });
  $('.js-copy-cards').on('click', function () {
    var videoId = $('.js-video-id').val();
    if (!videoId) return;
    copyCards(videoId);
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

var page = /cards/;
var match = page.exec(document.URL);

if (match) {
  Object(_content_scripts__WEBPACK_IMPORTED_MODULE_0__["default"])();
}

/***/ })

/******/ });
//# sourceMappingURL=content_scripts.js.map