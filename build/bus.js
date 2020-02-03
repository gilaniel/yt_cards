chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var url = "";

  if (request.action === 'get_yt_ar') {
    fetch('https://studio.youtube.com/channel/' + request.channelId)
      .then(response => response.text())
      .then(text => sendResponse(text));

    return true;
  }

  if (request.action === "get_id") {
    url = "https://youtube.com/";

    fetch(url)
      .then(response => response.text())
      .then(text => sendResponse(text));
    return true;
  } else if (request.action === "get_new_videos") {
    url = `https://www.youtube.com/my_videos?o=U&ar=${request.ar}&pi=${request.page}${request.params}`;

    fetch(url)
      .then(response => response.text())
      .then(text => sendResponse(text));
    return true;
  } else if (request.action === "get_title") {
    url = `https://www.youtube.com/channel/${request.id}`;

    fetch(url)
      .then(response => response.text())
      .then(text => sendResponse(text));
    return true;
  } else if (request.action === "set_card") {
    $.ajax({
      type: "POST",
      url: "https://www.youtube.com/cards_ajax?v=" + request.v,
      data: request.params,
      success: function(resp) {
        sendResponse(resp);
      },
      error: function() {
        sendResponse({ error: "error", videoId: request.v});
      }
    });
    return true;
  } else if (request.action === "clear_card") {
    $.ajax({
      type: "POST",
      url: `https://www.youtube.com/cards_ajax?v=${request.v}&action_delete=1`,
      data: request.params,
      success: function(resp) {
        sendResponse(resp);
      },
      error: function() {
        sendResponse({ error: "error", videoId: request.v });
      }
    });

    return true;
  } else if (request.action === "check_card") {
    $.ajax({
      type: "GET",
      url: `https://www.youtube.com/cards_ajax?v=${request.v}&action_list=1`,
      success: function(resp) {
        sendResponse(resp);
      },
      error: function() {
        sendResponse({ error: "error" });
      }
    });

    return true;
  } else if (request.action === "get_pl_videos") {
    url = `https://www.youtube.com/playlist?list=${request.plId}`;

    fetch(url)
      .then(response => response.text())
      .then(text => sendResponse(text));
    return true;
  }


  // ENDINGS

  else if(request.action === 'get_tmp_endings') {
    $.ajax({
      type: 'POST',
      url: `https://www.youtube.com/endscreen_ajax?v=${request.id}&encrypted_video_id=${request.id}&from_video_id=${request.tmpId}&action_retrieve_from_video=1`,
      data: {session_token: request.token},
      xhrFields: {
          withCredentials: true
      },
      crossDomain: true,
      success: function(resp){
        sendResponse(resp);
      },
      error: function(r,e,s,f){
        sendResponse({description: e, error: r});
      }
    })
    return true;
  } else if(request.action === 'revert_endings'){
    $.ajax({
      type: 'POST',
      url: `https://www.youtube.com/endscreen_ajax?v=${request.id}`,
      contentType: "application/json",
      data: JSON.stringify(request.videoObj),
      dataType: "json",
      success: function(resp){
        sendResponse({body: 'ok'});
      },
      error: function(){
        sendResponse({error: 'error'});
      }
    })
    return true;
  } else if(request.action === 'pub_endings'){
    $.ajax({
      type: 'POST',
      url: `https://www.youtube.com/endscreen_ajax?v=${request.id}`,
      contentType: "application/json",
      data: JSON.stringify(request.videoObj),
      dataType: "json",
      success: function(resp){
        sendResponse(resp);
      },
      error: function(){
        sendResponse({error: 'error'});
      }
    })
    return true;
  }

  // CALLS TO ACTION
  
  else if(request.action === 'get_tmp_calls'){
    $.ajax({
      type: 'POST',
      data: {session_tokken: request.token},
      url: `https://www.youtube.com/annotations_invideo?cap_hist=1&video_id=${request.id}&client=1`,
      success: function(resp,xhr){
        sendResponse(resp);
      },
       error: function(r,e,s,f){
        sendResponse({description: e, error: r});
      }
    })
    return true;
  } else if(request.action === 'revert_calls'){
    $.ajax({
      type: 'POST',
      url: 'https://www.youtube.com/metadata_ajax?action_edit_video=1',
      data: request.data,
      success: function(resp){
        sendResponse(resp);
      },
      error: function(){
        sendResponse({error: 'error'});
      }
    })
    return true;
  } else if(request.action === 'pub_calls'){
    $.ajax({
      type: 'POST',
      url: 'https://www.youtube.com/metadata_ajax?action_edit_video=1',
      data: request.data,
      success: function(resp){
        sendResponse(resp);
      },
      error: function(){
        sendResponse({error: 'error'});
      }
    })
    return true;
  }
});

// https://www.youtube.com/playlist?list=PLutU0Yy9nuKQXdXt-udVqYKSQ-XhyCslU

function checkUrl(requestDetails,a,d) {
  // console.log("Loading: " + JSON.stringify(requestDetails));
  // if (count > 1) return false;
  // chrome.cookies.getAll({url: 'https://studio.youtube.com/'}, function (cookies) {
  //   console.log('==========================================================================> ',cookies);
  // });


  if (requestDetails.url.indexOf('https://studio.youtube.com/youtubei/v1/creator/get_creator_communications') > -1) {

    chrome.tabs.query({title: 'Backoffice'}, tabs => {
      
      if (!tabs[0]) return;

      chrome.tabs.sendMessage(tabs[0].id, {action: "check_user"}, function(response) {
        console.log(tabs[0].id);
  
        void chrome.runtime.lastError;
      });  
    });
  }

}

chrome.webRequest.onSendHeaders.addListener(
  checkUrl,
  {urls: ["<all_urls>"]},
  ["requestHeaders"]
);