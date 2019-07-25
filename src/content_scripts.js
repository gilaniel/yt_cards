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
  let ytVideos = [];
  let cardsTemplates = [];
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

    $('body').append('<script id="initApp"></script>')

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

        getNewVideos();

        // loadOff();
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

    // getNewVideos();

    getChannelTitle(channelId);

    localStorage.setItem(ch_id_name, channelId);
  }

  function getNewVideos() {
    $.get('/admin/cards?channel_id=' + channelId).then(function(payload) {
      const promiseArr = [];

      clearVideoCount += payload.data.videos.length;

      payload.data.videos.forEach(item => {
        let video = {
          playlistVideoRenderer: {
            videoId: item[0],
            lengthSeconds: item[1]
          }
        };

        ytVideos.push(video);

        checkVideoCard(item[0], video, promiseArr);         
      });

      Promise.all(promiseArr).then((results)=>{
        loadOff();
        $(".js-all-count").text(ytVideos.concat(topPlVideos).length);
      });
    });
  }

  function getTopPlVideos(plId) {
    loadOn();

    chrome.runtime.sendMessage(
      { action: "get_pl_videos", plId: plId },
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
          loadOff();

          $(".js-all-count").text(ytVideos.concat(topPlVideos).length);
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
          }


          $(".js-videos-count").removeClass("hide");

          resolve(item);
        }
      );
    });

    promiseArr.push(videoPromise);
  }

  function setCard(videos) {
    return new Promise((resolve, reject) => {

      videos.forEach((item, idx, array) => {
        chrome.runtime.sendMessage(
          { action: "set_card", v: item.video.playlistVideoRenderer.videoId, params: item.params },
          (response) => {
            const lastError = chrome.runtime.lastError;
  
            localStorageSetItem('IDS', item.params.video_item_id);
            localStorageSetItem('MESSAGES', item.params.custom_message);
            localStorageSetItem('TEASERS', item.params.teaser_text);
  
            if (lastError || response.error) {
              console.log(response);
              reject();
              
              return;
            }
  
            const allVideos = ytVideos.concat(topPlVideos);
            
            if (idx === array.length -1) {
              console.log('done');
              resolve();
            }
            
            // if (idx === links.length - 1) {
            //   doneVideoCount ++;
  
            //   $('.progress-bar-fill').css('width',100 * (doneVideoCount) / allVideos.length + '%');
              
            //   let templates = response
            //     .split('response">')[1]
            //     .split("</textarea>")[0];
  
            //   video["cards"] = JSON.parse(templates).feature_templates;
            //   video["has_card"] = true;
  
            //   getTemplates();
              
            // }
          }
        );
      });
    });

    promiseArr.push(videoPromise);
  }

  function clearCard(options) {
    const {videoData, video, set} = options;
    return new Promise(mainResolve => {
      const setCardRequest = (item, idx) => {
        let params = {
          key: item.key,
          // type: item.type,
          // start_ms: item.start_ms,
          // show_warnings: true,
          // video_item_id: item.video_id,
          // video_url: "",
          // channel_url: item.channel_url,
          // custom_message: item.custom_message,
          // teaser_text: item.teaser_text,
          session_token: getCookie(cookie_name + channelId)
        };

        return new Promise(resolve => {
          chrome.runtime.sendMessage(
            { action: "clear_card", v: videoData.videoId, params: params },
            () => {
              resolve();

              if (idx === video.cards.length - 1) {
                delete video["has_card"];

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

  function copyCards(videoId) {
    loadOn();

    chrome.runtime.sendMessage(
      { action: "check_card", v: videoId },
      (response) => {
        if (
          response.feature_templates.length &&
          response.feature_templates[0].key
        ) {
          cardsTemplates = response.feature_templates;

          fillCards();

          loadOff();
        }
      });
  }

  function fillCards() {
    $('.card-block').each((idx,item) => {
      if (!cardsTemplates[idx]) return;

      let id = cardsTemplates[idx].video_id || cardsTemplates[idx].playlist_id || cardsTemplates[idx].channel_url;
      let custom_message = cardsTemplates[idx].custom_message ;
      let teaser_text = cardsTemplates[idx].teaser_text ;
      
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

    doneVideoCount = 0;

    const sendArray = [];

    for (let i = 0; i < links.length; i++) {
      topPlVideos.concat(ytVideos.slice(0,5)).forEach((item,idx) => {
        const messages = [];
        const teasers = [];
  
        $(".custom_message").each((idx, item) => {
          messages.push(item.value ? item.value : '');
        });
        
        $(".teaser_text").each((idx, item) => {
          teasers.push(item.value ? item.value : '');
        });

        let videoData = item.playlistVideoRenderer;

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

        if (links[i].indexOf('youtube') > -1) {
          delete params.action_create_video;
          params['action_create_collaborator'] = 1;
          params['channel_url'] = links[i];
          params['type'] = 'collaborator';
        }else {
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

        sendArray.push({video: item, params: params});
      });
    }

    let size = 10;
    let subarray = [];
    
    for (let i = 0; i <Math.ceil(sendArray.length/size); i++){
        subarray[i] = sendArray.slice((i*size), (i*size) + size);
    }
    
    subarray.reduce((previousPromise, subItem) => {
      return previousPromise.then(() => {
        return setCard(subItem);
      }).catch(() => {
        console.log('error');
      });
    }, Promise.resolve());
    
    return; 

    topPlVideos.concat(ytVideos.slice(0,5)).reduce((previousPromise, item) => {
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

    topPlVideos.concat(ytVideos).reduce((previousPromise, item) => {
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

  $('.js-get-list').on('click', () => {
    var plId = $('.js-pl-id').val();
    if (!plId) return;

    getTopPlVideos(plId);
  });

  $('.js-copy-cards').on('click', () => {
    var videoId = $('.js-video-id').val();

    if (!videoId) return;

    copyCards(videoId);
  });
}
