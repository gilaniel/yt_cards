chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var url = "";

  if (request.action === 'studio') {
    fetch('https://studio.youtube.com/channel/UC_IEcnNeHc_bwd92Ber-lew/videos/upload')
      .then(response => response.text())
      .then(text => sendResponse(text));

    return true;
  }

  var params = {"filter":{"and":{"operands":[{"channelIdIs":{"value":"UC_IEcnNeHc_bwd92Ber-lew"}},{"videoOriginIs":{"value":"VIDEO_ORIGIN_UPLOAD"}}]}},"order":"VIDEO_ORDER_VIEW_COUNT_DESC","pageSize":30,"mask":{"channelId":true,"videoId":true,"lengthSeconds":true,"premiere":{"all":true},"status":true,"thumbnailDetails":{"all":true},"title":true,"draftStatus":true,"downloadUrl":true,"watchUrl":true,"permissions":{"all":true},"timeCreatedSeconds":true,"timePublishedSeconds":true,"origin":true,"livestream":{"all":true},"privacy":true,"metrics":{"all":true},"responseStatus":{"all":true},"description":true,"statusDetails":{"all":true},"scheduledPublishingDetails":{"all":true},"claimDetails":{"all":true},"sponsorsOnly":{"all":true},"unlistedExpired":true,"monetizationDetails":{"all":true},"selfCertification":{"all":true},"ageRestriction":true},"context":{"client":{"clientName":62,"clientVersion":"1.20190730.0.0","hl":"ru","gl":"RU","experimentIds":[]},"request":{"returnLogEntry":true,"internalExperimentFlags":[{"key":"is_browser_support_for_webcam_streaming","value":"true"},{"key":"restudio_web_canary","value":"false"},{"key":"enable_creator_comment_filters","value":"false"},{"key":"highlight_clip_creation_ftue_display_option","value":"0"},{"key":"show_livechat_creator_tooltips","value":"false"},{"key":"matterhorn_v1_study","value":"0"},{"key":"yta_see_more_link","value":"true"},{"key":"restudio_upload_link","value":"true"},{"key":"web_gel_debounce_ms","value":"10000"},{"key":"restudio_disable_hash","value":"true"},{"key":"analytics_deep_dive_view","value":"true"},{"key":"enable_polymer_resin","value":"false"},{"key":"enable_client_streamz_web","value":"true"},{"key":"restudio_hats","value":"true"},{"key":"web_logging_max_batch","value":"100"},{"key":"analytics_headlines_holdback_state","value":"1"},{"key":"restudio_nav_refresh","value":"true"},{"key":"content_owner_delegation","value":"false"},{"key":"restudio_thumbnails","value":"false"},{"key":"log_js_exceptions_fraction","value":"1"},{"key":"restudio_banners","value":"true"},{"key":"log_window_onerror_fraction","value":"1"},{"key":"enable_lcr_improved_preview","value":"false"},{"key":"enable_lcr_account_menu","value":"false"},{"key":"retry_web_logging_batches","value":"true"},{"key":"capping_comment_replies","value":"false"},{"key":"add_creator_entities_to_accounts_list","value":"true"},{"key":"enable_mobile_crosswalk_selection","value":"false"},{"key":"log_sequence_info_on_gel_web","value":"false"},{"key":"custom_csi_timeline_use_gel","value":"false"},{"key":"restudio_scheduled_publishing","value":"true"},{"key":"enable_live_studio_ux","value":"true"},{"key":"channel_fluctuation_decline_experiment","value":"0"},{"key":"restudio_hagrid","value":"false"},{"key":"fill_submit_endpoint_on_preview_web","value":"false"},{"key":"live_chat_unicode_emoji_json_url","value":"https://www.gstatic.com/youtube/img/emojis/emojis-svg-1.json"},{"key":"live_chat_show_settings_in_creator_studio","value":"true"},{"key":"restudio","value":"false"},{"key":"enable_live_studio_url","value":"true"},{"key":"json_serialize_shut_off2","value":"false"},{"key":"restudio_comments","value":"true"},{"key":"live_chat_continuation_expiration_usec","value":"300000000"},{"key":"web_system_health_fraction","value":"1"},{"key":"analytics_snowball","value":"false"},{"key":"force_route_delete_playlist_to_outertube","value":"false"},{"key":"restudio_web_canary_holdback","value":"false"},{"key":"is_browser_supported_for_chromecast_streaming","value":"false"},{"key":"flush_onbeforeunload","value":"true"},{"key":"enable_live_premieres_creation","value":"true"},{"key":"enable_midroll_ad_insertion","value":"true"},{"key":"console_log_js_exceptions","value":"true"},{"key":"live_chat_invite_only_mode_creator_ui","value":"false"},{"key":"restudio_onboarding","value":"true"},{"key":"json_serialize_service_endpoints2","value":"true"}]},"user":{"onBehalfOfUser":"100881223341419216353"}}};

  if (request.action === 'videos') {
    $.ajax({
      type: "POST",
      url: "https://studio.youtube.com/youtubei/v1/creator/list_creator_videos?alt=json&key=AIzaSyBUPetSUmoZL-OhlxA7wSac5XinrygCqMo",
      // The key needs to match your method's input parameter (case-sensitive).
      data: JSON.stringify(params),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
    });
  }

  if (request.action === "get_id") {
    url = "https://www.youtube.com";

    fetch(url)
      .then(response => response.text())
      .then(text => sendResponse(text));
    return true;
  } else if (request.action === "get_new_videos") {
    url = `https://www.youtube.com/my_videos?o=U&ar=1564641111111&pi=${request.page}${request.params}`;

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
