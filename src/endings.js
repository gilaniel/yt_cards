export default function() {
  var callToAction = /call_to_action/,
    endings = /annotations/,
    matchCall = callToAction.exec(document.URL),
    matchEndings = endings.exec(document.URL),
    match = matchCall || matchEndings;


  var itemsObj = {},
    itemImg;
  var startState = true;
  var ytId;

  if(matchCall){

    $(function(){
      $('body').on('click','.js-get-tmp-btn',function(){
        var token = $('.js-auth-token').val();
        var videoTmpId = $('.js-ending-tmp').val();
        var itemsArr = [];
        $('.js-check-video').each(function(i,item){
          var item = $(item);
          if(item.prop('checked')===true){
            itemsArr.push({id: item.val()});
          }
        });

        if(!videoTmpId){
          return false;
        }

        $('.js-template').val('');
        localStorage.removeItem('template');

        loadOn();
        var group = $('.js-tab-item.current').data('tab').split(',')[1];

        chrome.runtime.sendMessage({action: "get_tmp_calls", token: token, id: videoTmpId}, function(response){

          if(response.description === 'error'){
            if(response.error.status === 0){
              showPopup('You are not authorized');
            }else if(response.error.status === 400){
              showPopup('Something wrong!');
            }

            loadOff();
          }else{
            var parser = new DOMParser();
            var doc = parser.parseFromString(response, "text/html");
    
            if(!$(response.documentElement).find('annotation[type="promotion"] data').length){ 
              loadOff();
              showPopup('No image on this video!');
              return false; 
            }

            var overlay = JSON.parse($(response.documentElement).find('annotation[type="promotion"] data')[0].innerHTML).image_url.split('/');
            itemImg = overlay[overlay.length - 1].split('.')[0];
    
            ytId = JSON.parse($(response.documentElement).find('annotation[type="branding"] data')[0].innerHTML).channel_id;

            if(ytId != localStorage.getItem('call_ch_id')){
              showPopup('Use the correct account!');
              $('.js-check-all').prop('checked',false);
              loadOff();
              return false;
            }
            loadOff();
          }
          
        });

      })

      $('body').on('click','.js-revert-all-btn',function(){
        var videoObj = {};

        var itemsArr = [];
        $('.js-check-video').each(function(i,item){
          var item = $(item);
          if(item.prop('checked')===true){
            itemsArr.push({id: item.val()});
          }
        });

        if(!itemsArr.length){
          return false;
        }
        loadOn();
        var token = getCookie('call_auth_token_'+ytId);
        if (!token){
          checkUser();
        }
        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        $.each(itemsArr,function(idx,item){
          var data = JSON.parse(localStorage.getItem('template'));
          data.push({'name': 'video_id', 'value': item.id});
          data.push({'name': 'session_token', 'value': token});

          for(var j in data){
            if(data[j].name == 'cta_display_url' || data[j].name == 'cta_destination_url' || data[j].name == 'cta_text1'){
              data[j].value = '';
            }
          }

          chrome.runtime.sendMessage({action: "revert_calls", data: data}, function(response){
            
            if(response.error){
              $('.b-list-item[data-id="'+item.id+'"]').addClass('err');
              $('.b-list-item[data-id="'+item.id+'"] input').prop('checked',false);
              $('.js-check-all').prop('checked',false);

              loadOff();
            }else{
              $.get('/admin/call_to_action?action=annotate&video_id='+item.id+'&is_promo=false&channel_id='+ytId).then(function(resp){
                $('.b-list-item[data-id="'+item.id+'"]').slideUp(200, function(){
                  $(this).remove();
                });

                loadOff();
              });
            }
          });
          
        })
      });

      $('body').on('click','.js-pub-all-btn',function(){
        var videoObj = {};

        var itemsArr = [];
        $('.js-check-video').each(function(i,item){
          var item = $(item);
          if(item.prop('checked')===true){
            itemsArr.push({id: item.val()});
          }
        });

        if(!itemsArr.length || !$('.js-template').val()){
          return false;
        }
        loadOn();
        var token = getCookie('call_auth_token_'+ytId);
        if (!token){
          checkUser();
        }
        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        $.each(itemsArr,function(idx,item){
          var data = JSON.parse(localStorage.getItem('template'));
          data.push({'name': 'video_id', 'value': item.id});
          data.push({'name': 'session_token', 'value': token});

          for(var j in data){
            if(data[j].name == 'cta_image_id'){
              data[j].value = itemImg;
            }
          }

          chrome.runtime.sendMessage({action: "pub_calls", data: data}, function(response){

            var is_promo;
            if ($('.js-tab-item[data-tab="short,2"]').hasClass('current')){
              is_promo = true;
            }else{
              is_promo = false;
            }

            if((response.metadata_errors && response.metadata_errors.length) || response.error){
              $('.b-list-item[data-id="'+item.id+'"]').addClass('err');
              $('.b-list-item[data-id="'+item.id+'"] input').prop('checked',false);
              $('.js-check-all').prop('checked',false);

              try{
                showPopup(resp.metadata_errors[0].message);
              }catch(e){console.log(e)}

              loadOff();

            }else{
              $.get('/admin/call_to_action?action=annotate&video_id='+item.id+'&is_promo='+is_promo+'&channel_id='+ytId).then(function(){
                loadOff();

                if(is_promo){
                  $('.b-list-item[data-id="'+item.id+'"] input').prop('checked',false);
                  $('.b-list-item[data-id="'+item.id+'"]').addClass('suc');
                  setTimeout(function(){
                    $('.b-list-item[data-id="'+item.id+'"]').removeClass('suc');
                  },700);
                }else{
                  $('.b-list-item[data-id="'+item.id+'"]').slideUp(200, function(){
                    $(this).remove();
                  });
                }
              });
            }
          });
        
        })
      });

    })

  }else if(matchEndings){
    $(function(){
      $('body').on('click','.js-get-tmp-btn',function(){
        var token = $('.js-auth-token').val();
        var videoTmpId = $('.js-ending-tmp').val();
        var itemsArr = [];
        $('.js-check-video').each(function(i,item){
          var item = $(item);
          if(item.prop('checked')===true){
            itemsArr.push({id: item.val()});
          }
        });

        if(!videoTmpId || !itemsArr.length){
          return false;
        }
        loadOn();
        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        $.each(itemsArr,function(idx,item){
          itemsObj[group+'_end_'+item.id] = {};

          chrome.runtime.sendMessage({action: "get_tmp_endings", id: item.id, tmpId: videoTmpId, token: token}, function(response){
            loadOff();

            if(response.for_editor){
              itemsObj[group+'_end_'+item.id] = response.for_editor;
    
              $('.b-list-item[data-id="'+item.id+'"]').addClass('suc').removeClass('err');
            }else{
              if(response.description === 'error' && response.error.status === 0){
                showPopup('You are not authorized');
              }else if(response.error.status === 400){
                showPopup('Something wrong!');
              }

              loadOff();
              $('.b-list-item[data-id="'+item.id+'"]').addClass('err');
              $('.b-list-item[data-id="'+item.id+'"] input').prop('checked',false);
              $('.js-check-all').prop('checked',false);
            }
          });
        })

      })
      $('body').on('click','.js-revert-all-btn',function(){
        var videoObj = {};

        var itemsArr = [];
        $('.js-check-video').each(function(i,item){
          var item = $(item);
          if(item.prop('checked')===true){
            itemsArr.push({id: item.val()});
          }
        });

        if(!itemsArr.length){
          return false;
        }
        loadOn();
        var token = getCookie('annotation_auth_token_'+ytId);
        if (!token){
          checkUser();
        }
        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        $.each(itemsArr,function(idx,item){
          if(!itemsObj[group+'_end_'+item.id]) {
            loadOff();
            $('.b-list-item[data-id="'+item.id+'"]').addClass('err');
          }else{
            videoObj[item.id] = itemsObj[group+'_end_'+item.id];
            videoObj[item.id]['encrypted_video_id'] = item.id;
            videoObj[item.id]['action_save'] = 1;
            videoObj[item.id]['v'] = item.id;

            videoObj[item.id]['session_token'] = token

            chrome.runtime.sendMessage({action: "revert_endings", id: item.id, videoObj: videoObj[item.id]}, function(response){
              
              if(response.body === 'ok'){
                $.get('/admin/annotations?action=annotate&video_id='+item.id+'&is_promo=false&channel_id='+ytId).then(function(){
                  $('.b-list-item[data-id="'+item.id+'"]').slideUp(200, function(){
                    $(this).remove();
                  });

                  loadOff();
                });
              }else{
                $('.b-list-item[data-id="'+item.id+'"]').addClass('err');
                $('.b-list-item[data-id="'+item.id+'"] input').prop('checked',false);
                $('.js-check-all').prop('checked',false);

                loadOff();
              }
            });
          }
        })
      });

      $('body').on('click','.js-pub-all-btn',function(){
        var videoObj = {};

        var itemsArr = [];
        $('.js-check-video').each(function(i,item){
          var item = $(item);
          if(item.prop('checked')===true){
            itemsArr.push({id: item.val()});
          }
        });

        if(!itemsArr.length){
          return false;
        }
        loadOn();
        var token = getCookie('annotation_auth_token_'+ytId);
        if (!token){
          checkUser();
        }
        var group = $('.js-tab-item.current').data('tab').split(',')[1];
        $.each(itemsArr,function(idx,item){
          if(!itemsObj[group+'_end_'+item.id]) {
            loadOff();
            $('.b-list-item[data-id="'+item.id+'"]').addClass('err');
          }else{
            videoObj[item.id] = itemsObj[group+'_end_'+item.id];
            videoObj[item.id]['encrypted_video_id'] = item.id;
            videoObj[item.id]['action_save'] = 1;
            videoObj[item.id]['v'] = item.id;

            videoObj[item.id]['session_token'] = token

            chrome.runtime.sendMessage({action: "pub_endings", id: item.id, videoObj: videoObj[item.id]}, function(response){
              var is_promo;
              if ($('.js-tab-item[data-tab="short,2"]').hasClass('current')){
                is_promo = true;
              }else{
                is_promo = false;
              }

              if(response.error || response.errors){
                $('.b-list-item[data-id="'+item.id+'"]').addClass('err');
                $('.b-list-item[data-id="'+item.id+'"] input').prop('checked',false);
                $('.js-check-all').prop('checked',false);

                loadOff();
              }else{
                $.get('/admin/annotations?action=annotate&video_id='+item.id+'&is_promo='+is_promo+'&channel_id='+ytId).then(function(){
                  $('.b-list-item[data-id="'+item.id+'"]').slideUp(200, function(){
                    $(this).remove();
                  });
                  loadOff();
                });
              }
            });
            
          }

        })
      });

    })
  }

  var cookie_name,
    ch_id_name,
    tollName;

  if(match){
    if(match[0] == 'call_to_action'){
      cookie_name = 'call_auth_token_';
      ch_id_name = 'call_ch_id';
      tollName = 'Call To Action';
    }else{
      cookie_name = 'annotation_auth_token_';
      ch_id_name = 'ann_ch_id';
      tollName = 'Endings';
    }
    var list = document.getElementsByClassName("b-content");
    var newLi = document.createElement('div');
    newLi.setAttribute("class", "js-get-token");
    newLi.onclick = function(e){
      e.preventDefault();
      
      checkUser();
      
    };
    newLi.innerHTML = 'Get token';
    list[0].appendChild(newLi);

    function checkUser(){
      loadOn();


      chrome.runtime.sendMessage({action: "get_id"}, function(response){
        getChannelId(response);
      });
    }

    function getChannelId(response) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(response, "text/html");
      var elArr = Array.prototype.slice.call(doc.getElementsByTagName("script"));
      var sText = elArr.filter(function(el){return el.textContent.indexOf("GUIDED_HELP") > -1;});

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
          getChannelTitle(ytId);

          checkAuthState(elArr,ytId);

          return;
        } else{
          throw new Error('no channel ID');
        }

      } catch(e) {
        console.log(e);
      }

      sText = elArr.filter(function(el){return el.textContent.indexOf("GUIDED_HELP") > -1;});

      if(sText[0].textContent.indexOf('creator_channel_id","value":"') > -1){
        ytId = /creator_channel_id","value":"([^"]+)"/.exec(sText[0].textContent)[1];
      }else{
        ytId = $(doc).find('.spf-link[title="Мой канал"]').attr('href') || $(doc).find('.spf-link[title="My channel"]').attr('href');
        ytId = ytId.split('/channel/')[1]
        // sText = elArr.filter(function(el){return el.textContent.indexOf("GAPI_HINT_PARAMS") > -1;});
        // ytId = /creator_channel_id":"([^"]+)"/.exec(sText[0].textContent)[1];
      }
      

      getChannelTitle(ytId);

      checkAuthState(elArr,ytId);
    }

    function getChannelTitle(id) {
      chrome.runtime.sendMessage({action: "get_title", id: id}, function(response){
        var parser = new DOMParser();
        var doc = parser.parseFromString(response, "text/html");

        var title = '';

        if(doc.getElementsByTagName("title")[1]){
          title = doc.getElementsByTagName("title")[1].text;
        }else{
          title = doc.getElementsByTagName("title")[0].text;
        }

        $('.js-channel-title').html(tollName+'&nbsp;-&nbsp;'+title);
      });
    }

    function checkAuthState(scripts,ytId) {
      var listWrap = document.getElementsByClassName('b-list-wrap')[0];
      var tokenInp = document.getElementsByClassName('js-auth-token')[0];

      var tagText = scripts.filter(function(el){return el.textContent.indexOf("GAPI_HINT_PARAMS") > -1;});

      if(typeof tagText[0] === 'undefined'){
        alert('Auth token error!')
        listWrap.setAttribute('id','disable');
        listWrap.innerHTML = '';
        loadOff();
        return false;
      }

      var auth_token = '';
      if(tagText[0].textContent.indexOf('"XSRF_TOKEN"') > -1){
        auth_token = /XSRF_TOKEN":"([^"]+)"/.exec(tagText[0].textContent)[1]
      }else{
        tagText = scripts.filter(function(el){return el.textContent.indexOf("GOOGLE_HELP_CONTEXT") > -1;});
        auth_token = /XSRF_TOKEN': "([^"]+)"/.exec(tagText[0].textContent)[1]
      }

      tokenInp.value = auth_token;
      setCookie(ytId,auth_token);
      loadOff();

      checkChannelId(ytId);
    }

    function checkChannelId(ytId) {
      var listWrap = document.getElementsByClassName('b-list-wrap')[0];
      
      if(localStorage.getItem(ch_id_name) != ytId){
        localStorage.setItem(ch_id_name,ytId);
        $('.js-tab-item.current').trigger('click');
      }else{
        localStorage.setItem(ch_id_name,ytId);
      }

      if(startState){
        $('.js-tab-item.current').trigger('click');
        startState = false;
      }

      listWrap.setAttribute('id','');
    }

    function setCookie(channelId,auth_token) { 
      var now = new Date();
      var time = now.getTime();
      var expireTime = time + 1000*3300;
      now.setTime(expireTime);
      document.cookie = cookie_name+channelId+"="+auth_token+"; path=/; expires=" + now.toGMTString();
    }
  }

  function showPopup(text){
    $('.b-popup').addClass('_show');
    $('.b-popup-box').html(text);	
    setTimeout(function(){
      hidePopup();
    },1500);
  }

  function hidePopup(){
    $('.b-popup').removeClass('_show');	
  }

  function loadOn(){
    $('.b-loader').show();	
  }

  function loadOff(){
    $('.b-loader').hide();	
  }

  function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  var videoSettings = [
    {"name":"title","value":""},
    {"name":"description","value":""},
    {"name":"keywords", "value": ""},
    {"name":"privacy","value":"public"},
    {"name":"notify_via_email","value":"true"},
    {"name":"share_emails","value":""},
    {"name":"deleted_ogids","value":""},
    {"name":"deleted_circle_ids","value":""},
    {"name":"deleted_emails","value":""},
    {"name":"playlists_values","value":"InvalidValue"},
    {"name":"privacy_draft","value":""},
    {"name":"still_id","value":"0"},
    {"name":"thumbnail_preview_version","value":""},
    {"name":"claim_style","value":"ads"},
    {"name":"claim_usage_policy","value":"S526445693826128"},
    {"name":"claim_match_policy","value":""},
    {"name":"allow_comments","value":"yes"},
    {"name":"allow_comments_detail","value":"all"},
    {"name":"allow_comments_sort_order","value":"top_comments"},
    {"name":"allow_ratings","value":"yes"},
    {"name":"reuse","value":"all_rights_reserved"},
    {"name":"captions_certificate_reason","value":""},
    {"name":"allow_embedding","value":"yes"},
    {"name":"location_longitude","value":""},
    {"name":"location_latitude","value":""},
    {"name":"location_altitude","value":""},
    {"name":"audio_language","value":"ru"},
    {"name":"recorded_date","value":""},
    {"name":"cta_text1","value":"Богатейшие кланы России"},
    {"name":"cta_text2","value":"text2"},
    {"name":"cta_text3","value":"text3"},
    {"name":"cta_image_id","value":"1504107731885497"},
    {"name":"cta_display_url","value":"www.vesti.ru"},
    {"name":"cta_destination_url_scheme","value":"http://"},
    {"name":"cta_destination_url","value":"www.vesti.ru/doc.html?id=2926720&utm_source=youtube&utm_medium=banner&utm_campaign=youtube-banner"},
    {"name":"cta_enabled_on_mobile","value":"yes"},
    {'name': 'modified_fields', 'value': 'cta_enabled_on_mobile,cta_display_url,cta_destination_url_scheme,cta_destination_url,cta_image_id'},
    {'name': 'allow_public_stats', 'value': 'no'},
    {'name': 'captions_crowdsource', 'value': 'no'},
    {'name': 'self_racy', 'value': 'no'},
    {'name': 'creator_share_feeds', 'value': 'yes'},
    {'name': 'claim_match_enabled', 'value': 'no'}
  ]

  localStorage.setItem('videoSettings',JSON.stringify(videoSettings));
}