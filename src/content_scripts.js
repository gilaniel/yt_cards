import { loadOn } from "./helpers";
import { loadOff } from "./helpers";
import { getCookie } from "./helpers";
import { localStorageSetItem } from "./helpers";
import { localStorageGetItem } from "./helpers";
import { showPopup } from "./helpers";
import { hidePopup } from "./helpers";

function listItemTmp (item) {
  return `<div class="js-list-item">${item}</div>`;
}

export default function() {
  const cookie_name = "tools_auth_token_";
  const ch_id_name = "tools_channel_id";
  let channelId = "";
  let topPlVideos = [];
  let clearVideoCount = 0;
  let doneVideoCount = 0;
  const templates = {
    IDS: [],
    MESSAGES: [],
    TEASERS: []
  }

  checkUser();

  function checkUser() {

    loadOn();

    chrome.runtime.sendMessage({ action: "get_id" }, response => {
      getChannelId(response);
    });

    getTemplates();
  }

  function getChannelId(response) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(response, "text/html");
    var elArr = Array.prototype.slice.call(doc.getElementsByTagName("script"));
    var sText = elArr.filter(function(el) {
      return el.textContent.indexOf("GUIDED_HELP") > -1;
    });

    try {
			sText = sText[0].textContent.split('var ytInitialGuideData = JSON.parse(')[1].split(');')[0];
			sText = JSON.parse(sText);
			sText = JSON.parse(sText);

			var serviceParams = sText.responseContext.serviceTrackingParams;

			serviceParams.forEach(function(item) {
				if (item.service === 'GUIDED_HELP') {
					ytId = item.params[0].value;
				}
			});

			if (ytId) {
				getChannelTitle(channelId);

				checkAuthState(elArr,channelId);

				return;
			} else{
				throw new Error('no channel ID');
			}

		} catch(e) {
			console.log(e)
    }
    
    sText = elArr.filter(function(el){return el.textContent.indexOf("GUIDED_HELP") > -1;});


    if (sText[0].textContent.indexOf('creator_channel_id","value":"') > -1) {
      channelId = /creator_channel_id","value":"([^"]+)"/.exec(
        sText[0].textContent
      )[1];
    } else {
      channelId = $(doc).find('.spf-link[title="Мой канал"]').attr('href') || $(doc).find('.spf-link[title="My channel"]').attr('href');
			channelId = channelId.split('/channel/')[1];
      // sText = elArr.filter(function(el) {
      //   return el.textContent.indexOf("GAPI_HINT_PARAMS") > -1;
      // });
      // channelId = /creator_channel_id":"([^"]+)"/.exec(sText[0].textContent)[1];
    }

    getChannelTitle(channelId);

    checkAuthState(elArr, channelId);
  }

  function getChannelTitle(channelId) {
    chrome.runtime.sendMessage(
      { action: "get_title", id: channelId },
      response => {
        var parser = new DOMParser();
        var doc = parser.parseFromString(response, "text/html");
        var title = "";

        if (doc.getElementsByTagName("title")[1]) {
          title = doc.getElementsByTagName("title")[1].text;
        } else {
          title = doc.getElementsByTagName("title")[0].text;
        }

        $(".channel-title").html(title);
      }
    );
  }

  function checkAuthState(scripts, channelId) {
    var tagText = scripts.filter(function(el) {
      return el.textContent.indexOf("GAPI_HINT_PARAMS") > -1;
    });

    if (typeof tagText[0] === "undefined") {
      alert("Auth token error!");
      loadOff();
      return false;
    }

    var auth_token = "";
    if (tagText[0].textContent.indexOf('"XSRF_TOKEN"') > -1) {
      auth_token = /XSRF_TOKEN":"([^"]+)"/.exec(tagText[0].textContent)[1];
    } else {
      tagText = scripts.filter(function(el) {
        return el.textContent.indexOf("GOOGLE_HELP_CONTEXT") > -1;
      });
      auth_token = /XSRF_TOKEN': "([^"]+)"/.exec(tagText[0].textContent)[1];
    }

    setCookie(channelId, auth_token);

    getTopPlVideos();

    checkChannelId(channelId);
  }

  function getNewVideos() {
    $.get('/admin/cards?channel_id=' + channelId).then(function(payload) {
      const promiseArr = [];

      clearVideoCount += payload.data.videos.length;

      payload.data.videos.forEach(item => {
        let video = {
          playlistVideoRenderer: {
            videoId: item
          }
        };

        checkVideoCard(item, video, promiseArr);         
      });

      Promise.all(promiseArr).then((results)=>{
        loadOff();
      });
    });
  }

  function getTopPlVideos() {
    chrome.runtime.sendMessage(
      { action: "get_pl_videos", id: channelId },
      response => {
        var parser = new DOMParser();
        var doc = parser.parseFromString(response, "text/html");
        var elArr = Array.prototype.slice.call(
          doc.getElementsByTagName("script")
        );
        var sText = elArr.filter(function(el) {
          return el.textContent.indexOf("responseContext") > -1;
        });

        var ytData = sText[0].textContent
          .split('window["ytInitialData"] = ')[1]
          .split(";");
        topPlVideos = JSON.parse(ytData[0]).contents
          .twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
          .sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
          .playlistVideoListRenderer.contents;

        clearVideoCount = topPlVideos.length;

        const promiseArr = [];

        topPlVideos.forEach(item => {
          let video = item.playlistVideoRenderer;

          if (video.lengthSeconds) {
            checkVideoCard(video.videoId, item, promiseArr);         
          } else{
            clearVideoCount--;
          }
        });

        Promise.all(promiseArr).then((results)=>{
          getNewVideos();
        });
      }
    );
  }

  function checkVideoCard(videoId, item, promiseArr) {
    let videoPromise = new Promise((resolve, reject) =>{
      chrome.runtime.sendMessage(
        { action: "check_card", v: videoId },
        response => {
          item["cards"] = [];

          if (
            response.feature_templates.length &&
            response.feature_templates[0].key
          ) {
            item["has_card"] = true;
            item["cards"] = response.feature_templates;
            doneVideoCount++;
            clearVideoCount--;
          }


          $(".js-videos-count").removeClass("hide");
          $(".js-all-count").text(clearVideoCount);
          $(".js-done-count").text(doneVideoCount);

          resolve(item);
        }
      );
    });

    promiseArr.push(videoPromise);
  }

  function setCard(videoData, video, clearResolve) {
    return new Promise(setResolve => {
      let params = {
        key: "",
        type: "video",
        start_ms: 30000,
        show_warnings: true,
        video_item_id: "",
        video_url: "",
        custom_message: "",
        teaser_text: "",
        session_token: getCookie(cookie_name + channelId)
      };

      let lengthStep = 120 * 1000;

      if (videoData.lengthSeconds < 600) {
        lengthStep = Math.round((videoData.lengthSeconds / 6) * 1000);
        params.start_ms = lengthStep;
      }

      const links = [];
      const messages = [];
      const teasers = [];

      $(".video_item_id").each((idx, item) => {
        if (item.value) {
          links.push(item.value);
        }
      });

      $(".custom_message").each((idx, item) => {
        messages.push(item.value ? item.value : '');
      });
      
      $(".teaser_text").each((idx, item) => {
        teasers.push(item.value ? item.value : '');
      });

      const setCardRequest = (cardVideoId, idx) => {
        if (cardVideoId.substr(0,2) === 'UC') {
          delete params.action_create_video;
          params['action_create_collaborator'] = 1;
          params['channel_url'] = cardVideoId;
          params['type'] = 'collaborator';
        }else {
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

        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: "set_card", v: videoData.videoId, params: params },
            (response) => {
              const lastError = chrome.runtime.lastError;

              localStorageSetItem('IDS', params.video_item_id);
              localStorageSetItem('MESSAGES', params.custom_message);
              localStorageSetItem('TEASERS', params.teaser_text);

              resolve();

              if (lastError || response.error) {
                console.log(lastError.message);
                // 'Could not establish connection. Receiving end does not exist.'
                reject();
                
                return;
              }

              if (idx === links.length - 1) {
                let templates = response
                  .split('response">')[1]
                  .split("</textarea>")[0];

                video["cards"] = JSON.parse(templates).feature_templates;
                clearVideoCount--;
                doneVideoCount++;
                video["has_card"] = true;

                $(".js-all-count").text(clearVideoCount);
                $(".js-done-count").text(doneVideoCount);

                getTemplates();
                
                setTimeout(() => {
                  $('.cat-loader').removeClass('_show');

                  clearResolve ? clearResolve() : setResolve();
                },1000);
              }
            }
          );
        });
      };

      links.reduce((previousPromise, cardVideoId, idx) => {
        return previousPromise.then(() => {
          return setCardRequest(cardVideoId, idx);
        });
      }, Promise.resolve());
    });
  }

  function clearCard(options) {
    const {videoData, video, set} = options;
    return new Promise(mainResolve => {
      const setCardRequest = (item, idx) => {
        let params = {
          key: item.key,
          type: item.type,
          start_ms: item.start_ms,
          show_warnings: true,
          video_item_id: item.video_id,
          video_url: "",
          channel_url: item.channel_url,
          custom_message: item.custom_message,
          teaser_text: item.teaser_text,
          session_token: getCookie(cookie_name + channelId)
        };

        return new Promise(resolve => {
          $('.cat-loader').addClass('_show');

          chrome.runtime.sendMessage(
            { action: "clear_card", v: videoData.videoId, params: params },
            () => {
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
            }
          );
        });
      };

      video.cards.reduce((previousPromise, item, idx) => {
        return previousPromise.then(() => {
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
    document.cookie =
      cookie_name +
      channelId +
      "=" +
      auth_token +
      "; path=/; expires=" +
      now.toGMTString();
  }

  function getTemplates() {
    templates.IDS = localStorageGetItem('IDS') || [];
    templates.MESSAGES = localStorageGetItem('MESSAGES') || [];
    templates.TEASERS = localStorageGetItem('TEASERS') || [];

    $('.list-content').html('');

    templates.IDS.forEach((item) => {
      $('.ids-list').append(listItemTmp(item));
    });

    templates.MESSAGES.forEach((item) => {
      $('.messages-list').append(listItemTmp(item));
    });

    templates.TEASERS.forEach((item) => {
      $('.teasers-list').append(listItemTmp(item));
    });
  }

  // SET CARDS
  $(".js-set-card-btn").on("click", e => {
    e.preventDefault();

    const links = [];

    $(".video_item_id").each((idx, item) => {
      if (item.value) {
        links.push(item.value);
      }
    });

    if (!links.length) return;

    topPlVideos.reduce((previousPromise, item) => {
      return previousPromise.then(() => {
        if (item.has_card) {
          return clearCard({videoData: item.playlistVideoRenderer, video: item, set: true});
        }

        return setCard(item.playlistVideoRenderer, item);
      });
    }, Promise.resolve());
  });

  // CLEAR CARDS
  $(".js-clear-card-btn").on("click", e => {
    e.preventDefault();

    topPlVideos.reduce((previousPromise, item) => {
      if (!item.has_card) {
        return Promise.resolve();
      }

      return previousPromise.then(() => {
        return clearCard({videoData: item.playlistVideoRenderer, video: item, set: false});
      });
    }, Promise.resolve());
  });


  $('.list-ico').on('click', (e) => {
    const type = e.currentTarget.dataset.type;
    const btn = $(e.currentTarget);

    
    btn.toggleClass('open');
    
    if (templates[type].length) {
      if (btn.hasClass('open')) {
        $('.list-block').closest('div').removeClass('focus');
        btn.closest('div').addClass('focus');
      }else {
        $('.list-ico').removeClass('open');
        btn.closest('div').removeClass('focus');
      }
      // $(e.currentTarget).closest('div').toggleClass('focus');
    }
  });
}
