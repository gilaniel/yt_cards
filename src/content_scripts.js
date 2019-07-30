import { loadOn } from "./helpers";
import { loadOff } from "./helpers";
import { getCookie } from "./helpers";
import { localStorageSetItem } from "./helpers";
import { localStorageGetItem } from "./helpers";

function listItemTmp (item) {
  return `<div class="js-list-item">${item}</div>`;
}

export default function() {
  const cookie_name = "tools_auth_token_";
  const ch_id_name = "tools_channel_id";
  let channelId = "";
  let topPlVideos = [];
  let newVideos = [];
  let ytVideos = [];
  let cardsTemplates = [];
  let doneVideoCount = 0;
  const templates = {
    IDS: [],
    MESSAGES: [],
    TEASERS: [],
    COPY_IDS: [],
    PL_IDS: []
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
    const elArr = getYtScripts(response);
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");

    let sText = elArr.filter(function(el) {
      return el.textContent.indexOf("GUIDED_HELP") > -1;
    });

    try {
			sText = sText[0].textContent.split('var ytInitialGuideData = JSON.parse(')[1].split(');')[0];
			sText = JSON.parse(sText);
			sText = JSON.parse(sText);

			const serviceParams = sText.responseContext.serviceTrackingParams;

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

        getNewVideos(1);

        // loadOff();
      }
    );
  }

  function checkAuthState(scripts, channelId) {
    let tagText = scripts.filter(function(el) {
      return el.textContent.indexOf("GAPI_HINT_PARAMS") > -1;
    });

    if (typeof tagText[0] === "undefined") {
      alert("Auth token error!");
      loadOff();
      return false;
    }

    let auth_token = "";
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

  function getNewVideos(page) {
    loadOn();

    const promiseArr = [];

    chrome.runtime.sendMessage(
      { action: "get_new_videos", page: page },
      response => {
        const elArr = getYtScripts(response);
        const parser = new DOMParser();

        const sText = elArr.filter(function(el) {
          return el.textContent.indexOf("VIDEO_LIST_DISPLAY_OBJECT") > -1;
        });
        
        let elements = sText[0].textContent.split('VIDEO_LIST_DISPLAY_OBJECT":')[1].split('}]')[0]+'}]';
        elements = JSON.parse(elements);

        elements.forEach((item) => {
          const id = item.id;
          item = parser.parseFromString(item.html, "text/html");
          let time = $(item).find('.video-time').text().split(':');

          if (!time) return;

          if (time.length > 2) {
            time = +(time[0]) * 60 * 60 + +(time[1]) * 60 + +(time[2]);
          }else{
            time = +(time[0]) * 60 + +(time[1]);
          }

          newVideos.push([id, time]);
        });

        elements.length < 27 ? page = 3 : page ++;
        
        if (page <= 2) {
          getNewVideos(page);
        }

        if (page === 3) {
          newVideos = newVideos.splice(0,50);

          newVideos.forEach(item => {
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

            $(".js-all-count").text(newVideos.length);
          });
        }

      });
  }

  function getTopPlVideos(plId) {
    loadOn();

    ytVideos = ytVideos.splice(0, newVideos.length - 1);

    chrome.runtime.sendMessage(
      { action: "get_pl_videos", plId: plId },
      response => {
        try {
          const elArr = getYtScripts(response);

          const sText = elArr.filter(function(el) {
            return el.textContent.indexOf("responseContext") > -1;
          });
  
          const ytData = sText[0].textContent
            .split('window["ytInitialData"] = ')[1]
            .split(";");
          topPlVideos = JSON.parse(ytData[0]).contents
            .twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
            .sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
            .playlistVideoListRenderer.contents;
  
          const promiseArr = [];
          const videosArr = [];
  
          topPlVideos.forEach(item => {
            const video = item.playlistVideoRenderer;
            const findVideo = ytVideos.find(function(element) {
              return element.playlistVideoRenderer.videoId == video.videoId;
            });

            if (findVideo || !video.lengthSeconds) { return; }
  
            videosArr.push(item);
          });

          videosArr.forEach(item => {
            const video = item.playlistVideoRenderer;

            checkVideoCard(video.videoId, item, promiseArr);   
          });

          Promise.all(promiseArr).then((results)=>{
            loadOff();
  
            ytVideos = ytVideos.concat(videosArr);
  
            $('.js-playlist-count').text(videosArr.length);
  
            localStorageSetItem('PL_IDS', plId);

            getTemplates();
          });
        }catch(e) {
          loadOff();
          
          alert('Wrong Playlist or something else. Please contact Gila.');
        }
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
            response.feature_templates &&
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

  function setCard(videos, allVideos) {
    return new Promise((resolve, reject) => {

      videos.forEach((item, idx, array) => {
        chrome.runtime.sendMessage(
          { action: "set_card", v: item.video.playlistVideoRenderer.videoId, params: item.params },
          (response) => {
  
            localStorageSetItem('IDS', item.params.video_item_id);
            localStorageSetItem('MESSAGES', item.params.custom_message);
            localStorageSetItem('TEASERS', item.params.teaser_text);
  
            if (response.error) {
              console.log(response);
              $.notify({message: 'Set card error: ' + response.videoId},{type: 'danger'});

              reject();
              
              return;
            }

            const video = ytVideos.find(function(element) {
              return element.playlistVideoRenderer.videoId == item.video.playlistVideoRenderer.videoId;
            });

            const templates = response
                .split('response">')[1]
                .split("</textarea>")[0];

            video["cards"] = JSON.parse(templates).feature_templates;

            doneVideoCount++;

            $('.progress-bar-fill').css('width',100 * (doneVideoCount) / allVideos.length + '%');

            if (idx === array.length -1) {
              console.log('done');
              resolve();
            }
          }
        );
      });
    });

    promiseArr.push(videoPromise);
  }

  function clearCard(videos) {
    return new Promise((resolve, reject) => {
      videos.forEach((item, idx, array) => {
        let params = {
          key: item.key,
          session_token: getCookie(cookie_name + channelId)
        };

        chrome.runtime.sendMessage(
          { action: "clear_card", v: item.id, params: params },
          (response) => {
            if (response.error) {
              $.notify({message: 'Clear card error: ' + response.videoId},{type: 'danger'});

              reject();
              
              return;
            }

            const video = ytVideos.find(function(element) {
              return element.playlistVideoRenderer.videoId == item.id;
            });

            video["cards"] = response.feature_templates;

            if (idx === array.length - 1) {
              resolve();
            }
          }
        );
      });
    });
  }

  function getYtScripts(response) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    const elArr = Array.prototype.slice.call(doc.getElementsByTagName("script"));

    return elArr;
  }

  function copyCards(videoId) {
    loadOn();

    chrome.runtime.sendMessage(
      { action: "check_card", v: videoId },
      (response) => {
        if (
          response.feature_templates &&
          response.feature_templates.length &&
          response.feature_templates[0].key
        ) {
          cardsTemplates = response.feature_templates;

          fillCards();

          localStorageSetItem('COPY_IDS', videoId);

          getTemplates();

        }else{
          alert('Bad Video Id: ' + videoId);
        }

        loadOff();
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
    templates.COPY_IDS = localStorageGetItem('COPY_IDS') || [];
    templates.PL_IDS = localStorageGetItem('PL_IDS') || [];

    $('.list-content').html('');

    const lists = ['IDS', 'MESSAGES', 'TEASERS', 'COPY_IDS', 'PL_IDS'];

    lists.forEach((item) => {
      templates[item].forEach((value) => {
        $(`.${item.toLowerCase()}-list`).append(listItemTmp(value));
      });
    });
  }

  function getParams(links, item, i) {
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
      params.start_ms += lengthStep * i;
    }

    return params;
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

    if (!links.length || $('.b-input-error').length) return;

    $('.progress-bar').addClass('_show');
    $('.progress-bar-fill').css('width', 0 + '%');

    doneVideoCount = 0;

    const clearArray = [];
    const filledArray = [];
    const filledArrayToClear = [];

    for (let i = 0; i < links.length; i++) {
      ytVideos.forEach((item,idx) => {
        const params = getParams(links, item, i);

        clearArray.push({video: item, params: params});
      });
    }

    ytVideos.forEach((item,idx) => {
      if (item.cards.length) {
        filledArray.push(item)
      }
    });
    
    for (let k = 0; k < 5; k++) {
      filledArray.forEach((item, idx, array) => {
        if (!item.cards[k]) return;

        filledArrayToClear.push({id: item.playlistVideoRenderer.videoId, key: item.cards[k].key});
      });
    }

    const size = 20;
    const clearSubArray = [];
    const filledSubArray = [];
    
    for (let i = 0; i <Math.ceil(clearArray.length/size); i++){
      clearSubArray[i] = clearArray.slice((i*size), (i*size) + size);
    }

    for (let i = 0; i <Math.ceil(filledArrayToClear.length/size); i++){
      filledSubArray[i] = filledArrayToClear.slice((i*size), (i*size) + size);
    }

    const setCardPromise = () => {
      clearSubArray.reduce((previousPromise, subItem, idx, array) => {
        return previousPromise.then(() => {
          return setCard(subItem, clearArray).then(() => {
            if (idx === array.length - 1) {
              $('.progress-bar').removeClass('_show');

              getTemplates();
            }
          });
        }).catch(() => {
          console.log('error');
        });
      }, Promise.resolve());
    }

    if (filledSubArray.length) {
      filledSubArray.reduce((previousPromise, subItem, idx, array) => {
        return previousPromise.then(() => {
          return clearCard(subItem).then(() => {
            if (idx === array.length - 1) {
              setCardPromise();
            }
          });
        }).catch(() => {
          console.log('error');
        });
      }, Promise.resolve());

      return;
    }

    setCardPromise();
  });

  // CLEAR CARDS
  $(".js-clear-card-btn").on("click", e => {
    e.preventDefault();

    ytVideos.reduce((previousPromise, item) => {
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
