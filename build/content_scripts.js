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

/***/ "./src/cards.js":
/*!**********************!*\
  !*** ./src/cards.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./src/helpers.js");






function listItemTmp(item, error) {
  var listClass = error ? 'error-list-item' : 'js-list-item';
  return "<div class=\"".concat(listClass, "\">").concat(item, "</div>");
}

/* harmony default export */ __webpack_exports__["default"] = (function () {
  var cookie_name = "tools_auth_token_";
  var ch_id_name = "tools_channel_id";
  var channelId = "";
  var videos = [];
  var topPlVideos = [];
  var newVideos = [];
  var mostViewedVideos = [];
  var ytVideos = [];
  var cardsTemplates = [];
  var doneVideoCount = 0;
  var client = {
    version: '',
    apiKey: '',
    ar: ''
  };
  var templates = {
    IDS: [],
    MESSAGES: [],
    TEASERS: [],
    COPY_IDS: [],
    PL_IDS: []
  };
  checkUser();

  function getYtAr(channelId) {
    chrome.runtime.sendMessage({
      action: "get_yt_ar",
      channelId: channelId
    }, function (response) {
      var elArr = getYtScripts(response);
      var sText = elArr.filter(function (el) {
        return el.textContent.indexOf("var ytcfg") > -1;
      });

      if (sText[0].textContent.indexOf('SERVER_MILLIS_SINCE_EPOCH') > -1) {
        client.ar = /SERVER_MILLIS_SINCE_EPOCH":([^"]+),/.exec(sText[0].textContent)[1];
      }
    });
  }

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
    var elArr = getYtScripts(response);
    var parser = new DOMParser();
    var doc = parser.parseFromString(response, "text/html");
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
          channelId = item.params[0].value;
        }
      });

      if (channelId) {
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
      channelId = channelId.split('/channel/')[1];
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

      $(".channel-title").html(title); // getVideos(1);

      Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOff"])();
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

    setCookie(channelId, auth_token); // getVideos();

    getYtAr(channelId);
    getChannelTitle(channelId);
    localStorage.setItem(ch_id_name, channelId);
  }

  function getVideos(page) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    $('.success-text').addClass('hidden');
    $('.error-block').addClass('hidden');
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOn"])();
    var promiseArr = [];
    ytVideos = [];
    chrome.runtime.sendMessage({
      action: "get_new_videos",
      page: page,
      params: params,
      ar: client.ar
    }, function (response) {
      var elArr = getYtScripts(response);
      var parser = new DOMParser();
      var sText = elArr.filter(function (el) {
        return el.textContent.indexOf("VIDEO_LIST_DISPLAY_OBJECT") > -1;
      });
      var elements = sText[0].textContent.split('VIDEO_LIST_DISPLAY_OBJECT":')[1].split('}]')[0] + '}]';
      elements = JSON.parse(elements);
      elements.forEach(function (item) {
        var id = item.id;
        item = parser.parseFromString(item.html, "text/html");
        var title = $(item).find('.vm-video-title-content').text();
        var time = $(item).find('.video-time').text().split(':');
        if (!time) return;

        if (time.length > 2) {
          time = +time[0] * 60 * 60 + +time[1] * 60 + +time[2];
        } else {
          time = +time[0] * 60 + +time[1];
        }

        videos.push([id, time, title]);
      });
      elements.length < 25 ? page = 3 : page++;

      if (page <= 2) {
        getVideos(page, params);
      }

      if (page === 3) {
        videos = videos.splice(0, 50);
        videos.forEach(function (item) {
          var video = {
            playlistVideoRenderer: {
              videoId: item[0],
              lengthSeconds: item[1],
              title: item[2]
            }
          };
          ytVideos.push(video);
          checkVideoCard(item[0], video, promiseArr);
        });
        Promise.all(promiseArr).then(function () {
          Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOff"])();

          if (params) {
            mostViewedVideos = ytVideos;
            $('.js-most-videos-count').removeClass('hide');
            $(".js-most-count").text(mostViewedVideos.length);
          } else {
            newVideos = ytVideos;
            $('.js-all-videos-count').removeClass('hide');
            $(".js-all-count").text(newVideos.length);
          }
        });
      }
    });
  }

  function getTopPlVideos(plId) {
    $('.success-text').addClass('hidden');
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOn"])();
    ytVideos = [];
    chrome.runtime.sendMessage({
      action: "get_pl_videos",
      plId: plId
    }, function (response) {
      try {
        var elArr = getYtScripts(response);
        var sText = elArr.filter(function (el) {
          return el.textContent.indexOf("responseContext") > -1;
        });
        var ytData = sText[0].textContent.split('window["ytInitialData"] = ')[1].split("};");
        topPlVideos = JSON.parse(ytData[0] + '}').contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
        var promiseArr = [];
        topPlVideos.forEach(function (item) {
          var video = item.playlistVideoRenderer;
          var findVideo = newVideos.find(function (element) {
            return element.playlistVideoRenderer.videoId == video.videoId;
          });

          if (findVideo || !video.lengthSeconds) {
            return;
          }

          ytVideos.push(item);
        });
        ytVideos.forEach(function (item) {
          var video = item.playlistVideoRenderer;
          checkVideoCard(video.videoId, item, promiseArr);
        });
        topPlVideos = ytVideos;
        Promise.all(promiseArr).then(function (results) {
          Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOff"])(); // ytVideos = ytVideos.concat(topPlVideos);

          $('.js-pl-videos-count').removeClass('hide');
          $('.js-playlist-count').text(topPlVideos.length);
          Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('PL_IDS', plId);
          getTemplates();
        });
      } catch (e) {
        Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOff"])();
        alert('Wrong Playlist or something else. Please contact Gila.');
      }
    });
  }

  function checkVideoCard(videoId, item, promiseArr) {
    var videoPromise = new Promise(function (resolve, reject) {
      chrome.runtime.sendMessage({
        action: "check_card",
        v: videoId
      }, function (response) {
        item["cards"] = [];

        if (response.feature_templates && response.feature_templates.length && response.feature_templates[0].key) {
          item["cards"] = response.feature_templates;
        }

        $(".js-videos-count").removeClass("hide");
        resolve(item);
      });
    });
    promiseArr.push(videoPromise);
  }

  function setCard(videos, allVideos) {
    return new Promise(function (resolve, reject) {
      videos.forEach(function (item, idx, array) {
        chrome.runtime.sendMessage({
          action: "set_card",
          v: item.video.playlistVideoRenderer.videoId,
          params: item.params
        }, function (response) {
          Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('IDS', item.params.video_item_id);
          Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('MESSAGES', item.params.custom_message);
          Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('TEASERS', item.params.teaser_text);
          doneVideoCount++;
          $('.progress-bar span').text('Set cards');
          $('.progress-bar-fill').css('width', 100 * doneVideoCount / allVideos.length + '%');
          var video = ytVideos.find(function (element) {
            return element.playlistVideoRenderer.videoId == item.video.playlistVideoRenderer.videoId;
          });

          if (response.error) {
            fillErrors({
              error: 'Set card error:',
              video: video
            });
            reject(response.videoId);
            return;
          }

          response = JSON.parse(response.split('response">')[1].split("</textarea>")[0]);

          if (response.errors) {
            var error = '';

            if (response.errors[0] === 'Invalid Request') {
              error = response.form_errors[0].message;
            } else {
              for (var er in response.errors) {
                if (response.errors[er].trim().length) {
                  error = response.errors[er];
                }
              }
            }

            fillErrors({
              error: error + ':',
              video: video
            });
          } else {
            delete video['error'];
            video["cards"] = response.feature_templates;
          }

          if (idx === array.length - 1) {
            resolve();
          }
        });
      });
    });
  }

  function clearCard(videos, allVideos) {
    return new Promise(function (resolve, reject) {
      videos.forEach(function (item, idx, array) {
        var params = {
          key: item.key,
          session_token: Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["getCookie"])(cookie_name + channelId)
        };
        chrome.runtime.sendMessage({
          action: "clear_card",
          v: item.id,
          params: params
        }, function (response) {
          doneVideoCount++;
          $('.progress-bar span').text('Deleting cards');
          $('.progress-bar-fill').css('width', 100 * doneVideoCount / allVideos.length + '%');
          var video = ytVideos.find(function (element) {
            return element.playlistVideoRenderer.videoId == item.id;
          });

          if (response.error) {
            fillErrors({
              error: 'Can\'t clear card:',
              video: video
            });
            reject(response.videoId);
            return;
          }

          video["cards"] = response.feature_templates;

          if (idx === array.length - 1) {
            resolve();
          }
        });
      });
    });
  }

  function fillErrors(options) {
    var video = options.video;
    $('.error-block').removeClass('hidden');
    $('.errors-list').append(listItemTmp("".concat(options.error, " ").concat(video.playlistVideoRenderer.title, " (").concat(video.playlistVideoRenderer.videoId, ")"), 'error'));
  }

  function getYtScripts(response) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(response, "text/html");
    var elArr = Array.prototype.slice.call(doc.getElementsByTagName("script"));
    return elArr;
  }

  function copyCards(videoId) {
    Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOn"])();
    chrome.runtime.sendMessage({
      action: "check_card",
      v: videoId
    }, function (response) {
      if (response.feature_templates && response.feature_templates.length && response.feature_templates[0].key) {
        cardsTemplates = response.feature_templates;
        fillCards();
        Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageSetItem"])('COPY_IDS', videoId);
        getTemplates();
      } else {
        alert('Bad Video Id: ' + videoId);
      }

      Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["loadOff"])();
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
    templates.COPY_IDS = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageGetItem"])('COPY_IDS') || [];
    templates.PL_IDS = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["localStorageGetItem"])('PL_IDS') || [];
    $('.list-content').html('');
    var lists = ['IDS', 'MESSAGES', 'TEASERS', 'COPY_IDS', 'PL_IDS'];
    lists.forEach(function (item) {
      templates[item].forEach(function (value) {
        $(".".concat(item.toLowerCase(), "-list")).append(listItemTmp(value));
      });
    });
  }

  function refresh() {
    videos = [];
    topPlVideos = [];
    newVideos = [];
    mostViewedVideos = [];
    ytVideos = [];
    $('.b-input-x').val('');
    $('.js-video-count').addClass('hide');
    $('.error-block').addClass('hidden');
    $('.success-text').addClass('hidden');
    $('.errors-list').html('');
  }

  function getParams(links, item, i) {
    var messages = [];
    var teasers = [];
    var start_ms = [];
    $(".custom_message").each(function (idx, item) {
      messages.push(item.value ? item.value : '');
    });
    $(".teaser_text").each(function (idx, item) {
      teasers.push(item.value ? item.value : '');
    });
    $(".start_ms").each(function (idx, item) {
      start_ms.push(item.value ? item.value : '');
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

    if (links[i].indexOf('user') > -1 || links[i].indexOf('channel') > -1) {
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
      params.start_ms += lengthStep * i;
    }

    if (start_ms[i]) {
      var time = start_ms[i].split(':');

      if (time.length > 2) {
        time = +time[0] * 60 * 60 + +time[1] * 60 + +time[2];
      } else {
        time = +time[0] * 60 + +time[1];
      }

      params.start_ms = time * 1000;
    }

    return params;
  } // SET CARDS


  $(".js-set-card-btn").on("click", function (e) {
    e.preventDefault();
    var links = [];
    $(".video_item_id").each(function (idx, item) {
      if (item.value) {
        if (item.value.indexOf('/watch?v=') > -1) {
          item.value = item.value.split('/watch?v=')[1];
        }

        links.push(item.value);
      }
    });
    if (!links.length || $('.b-input-error').length) return;
    $('.progress-bar').addClass('_show');
    $('.progress-bar-fill').css('width', 0 + '%');
    $('.success-text').addClass('hidden');
    $('.error-block').addClass('hidden');
    $('.errors-list').html('');
    ytVideos = topPlVideos.concat(newVideos).concat(mostViewedVideos);
    var clearArray = [];
    var filledArray = [];
    var filledArrayToClear = [];

    var _loop = function _loop(i) {
      ytVideos.forEach(function (item, idx) {
        var params = getParams(links, item, i);
        clearArray.push({
          video: item,
          params: params
        });
      });
    };

    for (var i = 0; i < links.length; i++) {
      _loop(i);
    }

    ytVideos.forEach(function (item, idx) {
      if (item.cards.length) {
        filledArray.push(item);
      }
    });

    var _loop2 = function _loop2(k) {
      filledArray.forEach(function (item, idx, array) {
        if (!item.cards[k]) return;
        filledArrayToClear.push({
          id: item.playlistVideoRenderer.videoId,
          key: item.cards[k].key
        });
      });
    };

    for (var k = 0; k < 5; k++) {
      _loop2(k);
    }

    var size = 1;
    var deleteSize = 1;
    var clearSubArray = [];
    var filledSubArray = [];

    for (var _i = 0; _i < Math.ceil(clearArray.length / size); _i++) {
      clearSubArray[_i] = clearArray.slice(_i * size, _i * size + size);
    }

    for (var _i2 = 0; _i2 < Math.ceil(filledArrayToClear.length / deleteSize); _i2++) {
      filledSubArray[_i2] = filledArrayToClear.slice(_i2 * deleteSize, _i2 * deleteSize + deleteSize);
    }

    var setCardPromise = function setCardPromise() {
      doneVideoCount = 0;
      clearSubArray.reduce(function (previousPromise, subItem, idx, array) {
        return previousPromise.then(function () {
          return setCard(subItem, clearArray).then(function () {
            if (idx === array.length - 1) {
              $('.progress-bar').removeClass('_show');
              $('.success-text').removeClass('hidden');
              getTemplates();
            }
          });
        })["catch"](function (e) {
          if (idx === array.length - 1) {
            $('.progress-bar').removeClass('_show');
            $('.success-text').removeClass('hidden');
          }
        });
      }, Promise.resolve());
    };

    var clearCardPromise = function clearCardPromise() {
      doneVideoCount = 0;
      filledSubArray.reduce(function (previousPromise, subItem, idx, array) {
        return previousPromise.then(function () {
          return clearCard(subItem, filledArrayToClear).then(function () {
            if (idx === array.length - 1) {
              setCardPromise();
            }
          });
        })["catch"](function (e) {
          if (idx === array.length - 1) {
            setCardPromise();
          }
        });
      }, Promise.resolve());
    };

    if (filledSubArray.length) {
      clearCardPromise();
      return;
    }

    setCardPromise();
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
  $('.js-get-last').on('click', function () {
    videos = [];
    getVideos(1);
  });
  $('.js-get-list').on('click', function () {
    var plId = $('.js-pl-id').val();
    if (!plId) return;
    getTopPlVideos(plId);
  });
  $('.js-get-most-viewed').on('click', function () {
    videos = [];
    getVideos(1, '&vmo=viewed&sa=0&sf=viewcount');
  });
  $('.js-copy-cards').on('click', function () {
    var videoId = $('.js-video-id').val();
    if (!videoId) return;
    copyCards(videoId);
  });
  $('.js-refresh-btn').on('click', function () {
    refresh();
  });
});

/***/ }),

/***/ "./src/endings.js":
/*!************************!*\
  !*** ./src/endings.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (function () {
  var callToAction = /call_to_action/,
      endings = /annotations/,
      matchCall = callToAction.exec(document.URL),
      matchEndings = endings.exec(document.URL),
      match = matchCall || matchEndings;
  var itemsObj = {},
      itemImg;
  var startState = true;
  var ytId;

  if (matchCall) {
    $(function () {
      $('body').on('click', '.js-get-tmp-btn', function () {
        var token = $('.js-auth-token').val();
        var videoTmpId = $('.js-ending-tmp').val();
        var itemsArr = [];
        $('.js-check-video').each(function (i, item) {
          var item = $(item);

          if (item.prop('checked') === true) {
            itemsArr.push({
              id: item.val()
            });
          }
        });

        if (!videoTmpId) {
          return false;
        }

        $('.js-template').val('');
        localStorage.removeItem('template');
        loadOn();
        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        chrome.runtime.sendMessage({
          action: "get_tmp_calls",
          token: token,
          id: videoTmpId
        }, function (response) {
          if (response.description === 'error') {
            if (response.error.status === 0) {
              showPopup('You are not authorized');
            } else if (response.error.status === 400) {
              showPopup('Something wrong!');
            }

            loadOff();
          } else {
            var parser = new DOMParser();
            var doc = parser.parseFromString(response, "text/html");

            if (!$(response.documentElement).find('annotation[type="promotion"] data').length) {
              loadOff();
              showPopup('No image on this video!');
              return false;
            }

            var overlay = JSON.parse($(response.documentElement).find('annotation[type="promotion"] data')[0].innerHTML).image_url.split('/');
            itemImg = overlay[overlay.length - 1].split('.')[0];
            ytId = JSON.parse($(response.documentElement).find('annotation[type="branding"] data')[0].innerHTML).channel_id;

            if (ytId != localStorage.getItem('call_ch_id')) {
              showPopup('Use the correct account!');
              $('.js-check-all').prop('checked', false);
              loadOff();
              return false;
            }

            loadOff();
          }
        });
      });
      $('body').on('click', '.js-revert-all-btn', function () {
        var videoObj = {};
        var itemsArr = [];
        $('.js-check-video').each(function (i, item) {
          var item = $(item);

          if (item.prop('checked') === true) {
            itemsArr.push({
              id: item.val()
            });
          }
        });

        if (!itemsArr.length) {
          return false;
        }

        loadOn();
        var token = getCookie('call_auth_token_' + ytId);

        if (!token) {
          checkUser();
        }

        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        $.each(itemsArr, function (idx, item) {
          var data = JSON.parse(localStorage.getItem('template'));
          data.push({
            'name': 'video_id',
            'value': item.id
          });
          data.push({
            'name': 'session_token',
            'value': token
          });

          for (var j in data) {
            if (data[j].name == 'cta_display_url' || data[j].name == 'cta_destination_url' || data[j].name == 'cta_text1') {
              data[j].value = '';
            }
          }

          chrome.runtime.sendMessage({
            action: "revert_calls",
            data: data
          }, function (response) {
            if (response.error) {
              $('.b-list-item[data-id="' + item.id + '"]').addClass('err');
              $('.b-list-item[data-id="' + item.id + '"] input').prop('checked', false);
              $('.js-check-all').prop('checked', false);
              loadOff();
            } else {
              $.get('/admin/call_to_action?action=annotate&video_id=' + item.id + '&is_promo=false&channel_id=' + ytId).then(function (resp) {
                $('.b-list-item[data-id="' + item.id + '"]').slideUp(200, function () {
                  $(this).remove();
                });
                loadOff();
              });
            }
          });
        });
      });
      $('body').on('click', '.js-pub-all-btn', function () {
        var videoObj = {};
        var itemsArr = [];
        $('.js-check-video').each(function (i, item) {
          var item = $(item);

          if (item.prop('checked') === true) {
            itemsArr.push({
              id: item.val()
            });
          }
        });

        if (!itemsArr.length || !$('.js-template').val()) {
          return false;
        }

        loadOn();
        var token = getCookie('call_auth_token_' + ytId);

        if (!token) {
          checkUser();
        }

        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        $.each(itemsArr, function (idx, item) {
          var data = JSON.parse(localStorage.getItem('template'));
          data.push({
            'name': 'video_id',
            'value': item.id
          });
          data.push({
            'name': 'session_token',
            'value': token
          });

          for (var j in data) {
            if (data[j].name == 'cta_image_id') {
              data[j].value = itemImg;
            }
          }

          chrome.runtime.sendMessage({
            action: "pub_calls",
            data: data
          }, function (response) {
            var is_promo;

            if ($('.js-tab-item[data-tab="short,2"]').hasClass('current')) {
              is_promo = true;
            } else {
              is_promo = false;
            }

            if (response.metadata_errors && response.metadata_errors.length || response.error) {
              $('.b-list-item[data-id="' + item.id + '"]').addClass('err');
              $('.b-list-item[data-id="' + item.id + '"] input').prop('checked', false);
              $('.js-check-all').prop('checked', false);

              try {
                showPopup(resp.metadata_errors[0].message);
              } catch (e) {
                console.log(e);
              }

              loadOff();
            } else {
              $.get('/admin/call_to_action?action=annotate&video_id=' + item.id + '&is_promo=' + is_promo + '&channel_id=' + ytId).then(function () {
                loadOff();

                if (is_promo) {
                  $('.b-list-item[data-id="' + item.id + '"] input').prop('checked', false);
                  $('.b-list-item[data-id="' + item.id + '"]').addClass('suc');
                  setTimeout(function () {
                    $('.b-list-item[data-id="' + item.id + '"]').removeClass('suc');
                  }, 700);
                } else {
                  $('.b-list-item[data-id="' + item.id + '"]').slideUp(200, function () {
                    $(this).remove();
                  });
                }
              });
            }
          });
        });
      });
    });
  } else if (matchEndings) {
    $(function () {
      $('body').on('click', '.js-get-tmp-btn', function () {
        var token = $('.js-auth-token').val();
        var videoTmpId = $('.js-ending-tmp').val();
        var itemsArr = [];
        $('.js-check-video').each(function (i, item) {
          var item = $(item);

          if (item.prop('checked') === true) {
            itemsArr.push({
              id: item.val()
            });
          }
        });

        if (!videoTmpId || !itemsArr.length) {
          return false;
        }

        loadOn();
        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        $.each(itemsArr, function (idx, item) {
          itemsObj[group + '_end_' + item.id] = {};
          chrome.runtime.sendMessage({
            action: "get_tmp_endings",
            id: item.id,
            tmpId: videoTmpId,
            token: token
          }, function (response) {
            loadOff();

            if (response.for_editor) {
              itemsObj[group + '_end_' + item.id] = response.for_editor;
              $('.b-list-item[data-id="' + item.id + '"]').addClass('suc').removeClass('err');
            } else {
              if (response.description === 'error' && response.error.status === 0) {
                showPopup('You are not authorized');
              } else if (response.error.status === 400) {
                showPopup('Something wrong!');
              }

              loadOff();
              $('.b-list-item[data-id="' + item.id + '"]').addClass('err');
              $('.b-list-item[data-id="' + item.id + '"] input').prop('checked', false);
              $('.js-check-all').prop('checked', false);
            }
          });
        });
      });
      $('body').on('click', '.js-revert-all-btn', function () {
        var videoObj = {};
        var itemsArr = [];
        $('.js-check-video').each(function (i, item) {
          var item = $(item);

          if (item.prop('checked') === true) {
            itemsArr.push({
              id: item.val()
            });
          }
        });

        if (!itemsArr.length) {
          return false;
        }

        loadOn();
        var token = getCookie('annotation_auth_token_' + ytId);

        if (!token) {
          checkUser();
        }

        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        $.each(itemsArr, function (idx, item) {
          if (!itemsObj[group + '_end_' + item.id]) {
            loadOff();
            $('.b-list-item[data-id="' + item.id + '"]').addClass('err');
          } else {
            videoObj[item.id] = itemsObj[group + '_end_' + item.id];
            videoObj[item.id]['encrypted_video_id'] = item.id;
            videoObj[item.id]['action_save'] = 1;
            videoObj[item.id]['v'] = item.id;
            videoObj[item.id]['session_token'] = token;
            chrome.runtime.sendMessage({
              action: "revert_endings",
              id: item.id,
              videoObj: videoObj[item.id]
            }, function (response) {
              if (response.body === 'ok') {
                $.get('/admin/annotations?action=annotate&video_id=' + item.id + '&is_promo=false&channel_id=' + ytId).then(function () {
                  $('.b-list-item[data-id="' + item.id + '"]').slideUp(200, function () {
                    $(this).remove();
                  });
                  loadOff();
                });
              } else {
                $('.b-list-item[data-id="' + item.id + '"]').addClass('err');
                $('.b-list-item[data-id="' + item.id + '"] input').prop('checked', false);
                $('.js-check-all').prop('checked', false);
                loadOff();
              }
            });
          }
        });
      });
      $('body').on('click', '.js-pub-all-btn', function () {
        var videoObj = {};
        var itemsArr = [];
        $('.js-check-video').each(function (i, item) {
          var item = $(item);

          if (item.prop('checked') === true) {
            itemsArr.push({
              id: item.val()
            });
          }
        });

        if (!itemsArr.length) {
          return false;
        }

        loadOn();
        var token = getCookie('annotation_auth_token_' + ytId);

        if (!token) {
          checkUser();
        }

        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        $.each(itemsArr, function (idx, item) {
          if (!itemsObj[group + '_end_' + item.id]) {
            loadOff();
            $('.b-list-item[data-id="' + item.id + '"]').addClass('err');
          } else {
            videoObj[item.id] = itemsObj[group + '_end_' + item.id];
            videoObj[item.id]['encrypted_video_id'] = item.id;
            videoObj[item.id]['action_save'] = 1;
            videoObj[item.id]['v'] = item.id;
            videoObj[item.id]['session_token'] = token;
            chrome.runtime.sendMessage({
              action: "pub_endings",
              id: item.id,
              videoObj: videoObj[item.id]
            }, function (response) {
              var is_promo;

              if ($('.js-tab-item[data-tab="short,2"]').hasClass('current')) {
                is_promo = true;
              } else {
                is_promo = false;
              }

              if (response.error || response.errors) {
                $('.b-list-item[data-id="' + item.id + '"]').addClass('err');
                $('.b-list-item[data-id="' + item.id + '"] input').prop('checked', false);
                $('.js-check-all').prop('checked', false);
                loadOff();
              } else {
                $.get('/admin/annotations?action=annotate&video_id=' + item.id + '&is_promo=' + is_promo + '&channel_id=' + ytId).then(function () {
                  $('.b-list-item[data-id="' + item.id + '"]').slideUp(200, function () {
                    $(this).remove();
                  });
                  loadOff();
                });
              }
            });
          }
        });
      });
    });
  }

  var cookie_name, ch_id_name, tollName;

  if (match) {
    var _checkUser = function _checkUser() {
      loadOn();
      chrome.runtime.sendMessage({
        action: "get_id"
      }, function (response) {
        getChannelId(response);
      });
    };

    var getChannelId = function getChannelId(response) {
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
          getChannelTitle(ytId);
          checkAuthState(elArr, ytId);
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
        ytId = /creator_channel_id","value":"([^"]+)"/.exec(sText[0].textContent)[1];
      } else {
        ytId = $(doc).find('.spf-link[title="Мой канал"]').attr('href') || $(doc).find('.spf-link[title="My channel"]').attr('href');
        ytId = ytId.split('/channel/')[1]; // sText = elArr.filter(function(el){return el.textContent.indexOf("GAPI_HINT_PARAMS") > -1;});
        // ytId = /creator_channel_id":"([^"]+)"/.exec(sText[0].textContent)[1];
      }

      getChannelTitle(ytId);
      checkAuthState(elArr, ytId);
    };

    var getChannelTitle = function getChannelTitle(id) {
      chrome.runtime.sendMessage({
        action: "get_title",
        id: id
      }, function (response) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(response, "text/html");
        var title = '';

        if (doc.getElementsByTagName("title")[1]) {
          title = doc.getElementsByTagName("title")[1].text;
        } else {
          title = doc.getElementsByTagName("title")[0].text;
        }

        $('.js-channel-title').html(tollName + '&nbsp;-&nbsp;' + title);
      });
    };

    var checkAuthState = function checkAuthState(scripts, ytId) {
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
      setCookie(ytId, auth_token);
      loadOff();
      checkChannelId(ytId);
    };

    var checkChannelId = function checkChannelId(ytId) {
      var listWrap = document.getElementsByClassName('b-list-wrap')[0];

      if (localStorage.getItem(ch_id_name) != ytId) {
        localStorage.setItem(ch_id_name, ytId);
        $('.js-tab-item.current').trigger('click');
      } else {
        localStorage.setItem(ch_id_name, ytId);
      }

      if (startState) {
        $('.js-tab-item.current').trigger('click');
        startState = false;
      }

      listWrap.setAttribute('id', '');
    };

    var setCookie = function setCookie(channelId, auth_token) {
      var now = new Date();
      var time = now.getTime();
      var expireTime = time + 1000 * 3300;
      now.setTime(expireTime);
      document.cookie = cookie_name + channelId + "=" + auth_token + "; path=/; expires=" + now.toGMTString();
    };

    if (match[0] == 'call_to_action') {
      cookie_name = 'call_auth_token_';
      ch_id_name = 'call_ch_id';
      tollName = 'Call To Action';
    } else {
      cookie_name = 'annotation_auth_token_';
      ch_id_name = 'ann_ch_id';
      tollName = 'Endings';
    }

    var list = document.getElementsByClassName("b-content");
    var newLi = document.createElement('div');
    newLi.setAttribute("class", "js-get-token");

    newLi.onclick = function (e) {
      e.preventDefault();

      _checkUser();
    };

    newLi.innerHTML = 'Get token';
    list[0].appendChild(newLi);
  }

  function showPopup(text) {
    $('.b-popup').addClass('_show');
    $('.b-popup-box').html(text);
    setTimeout(function () {
      hidePopup();
    }, 1500);
  }

  function hidePopup() {
    $('.b-popup').removeClass('_show');
  }

  function loadOn() {
    $('.b-loader').show();
  }

  function loadOff() {
    $('.b-loader').hide();
  }

  function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  var videoSettings = [{
    "name": "title",
    "value": ""
  }, {
    "name": "description",
    "value": ""
  }, {
    "name": "keywords",
    "value": ""
  }, {
    "name": "privacy",
    "value": "public"
  }, {
    "name": "notify_via_email",
    "value": "true"
  }, {
    "name": "share_emails",
    "value": ""
  }, {
    "name": "deleted_ogids",
    "value": ""
  }, {
    "name": "deleted_circle_ids",
    "value": ""
  }, {
    "name": "deleted_emails",
    "value": ""
  }, {
    "name": "playlists_values",
    "value": "InvalidValue"
  }, {
    "name": "privacy_draft",
    "value": ""
  }, {
    "name": "still_id",
    "value": "0"
  }, {
    "name": "thumbnail_preview_version",
    "value": ""
  }, {
    "name": "claim_style",
    "value": "ads"
  }, {
    "name": "claim_usage_policy",
    "value": "S526445693826128"
  }, {
    "name": "claim_match_policy",
    "value": ""
  }, {
    "name": "allow_comments",
    "value": "yes"
  }, {
    "name": "allow_comments_detail",
    "value": "all"
  }, {
    "name": "allow_comments_sort_order",
    "value": "top_comments"
  }, {
    "name": "allow_ratings",
    "value": "yes"
  }, {
    "name": "reuse",
    "value": "all_rights_reserved"
  }, {
    "name": "captions_certificate_reason",
    "value": ""
  }, {
    "name": "allow_embedding",
    "value": "yes"
  }, {
    "name": "location_longitude",
    "value": ""
  }, {
    "name": "location_latitude",
    "value": ""
  }, {
    "name": "location_altitude",
    "value": ""
  }, {
    "name": "audio_language",
    "value": "ru"
  }, {
    "name": "recorded_date",
    "value": ""
  }, {
    "name": "cta_text1",
    "value": "Богатейшие кланы России"
  }, {
    "name": "cta_text2",
    "value": "text2"
  }, {
    "name": "cta_text3",
    "value": "text3"
  }, {
    "name": "cta_image_id",
    "value": "1504107731885497"
  }, {
    "name": "cta_display_url",
    "value": "www.vesti.ru"
  }, {
    "name": "cta_destination_url_scheme",
    "value": "http://"
  }, {
    "name": "cta_destination_url",
    "value": "www.vesti.ru/doc.html?id=2926720&utm_source=youtube&utm_medium=banner&utm_campaign=youtube-banner"
  }, {
    "name": "cta_enabled_on_mobile",
    "value": "yes"
  }, {
    'name': 'modified_fields',
    'value': 'cta_enabled_on_mobile,cta_display_url,cta_destination_url_scheme,cta_destination_url,cta_image_id'
  }, {
    'name': 'allow_public_stats',
    'value': 'no'
  }, {
    'name': 'captions_crowdsource',
    'value': 'no'
  }, {
    'name': 'self_racy',
    'value': 'no'
  }, {
    'name': 'creator_share_feeds',
    'value': 'yes'
  }, {
    'name': 'claim_match_enabled',
    'value': 'no'
  }];
  localStorage.setItem('videoSettings', JSON.stringify(videoSettings));
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
/* harmony import */ var _cards__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cards */ "./src/cards.js");
/* harmony import */ var _endings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./endings */ "./src/endings.js");


var page = /cards/;
var match = page.exec(document.URL);

if (match) {
  Object(_cards__WEBPACK_IMPORTED_MODULE_0__["default"])();
}

Object(_endings__WEBPACK_IMPORTED_MODULE_1__["default"])();

/***/ })

/******/ });
//# sourceMappingURL=content_scripts.js.map