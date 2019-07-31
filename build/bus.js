chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var url = "";

  if (request.action === "get_id") {
    url = "https://www.youtube.com";

    fetch(url)
      .then(response => response.text())
      .then(text => sendResponse(text));
    return true;
  } else if (request.action === "get_new_videos") {
    url = `https://www.youtube.com/my_videos?o=U&ar=3&pi=${request.page}${request.params}`;

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
});

// https://www.youtube.com/playlist?list=PLutU0Yy9nuKQXdXt-udVqYKSQ-XhyCslU
