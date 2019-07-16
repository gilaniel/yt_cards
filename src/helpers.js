export function loadOn() {
  $(".b-loader").show();
}

export function showPopup(text) {
  $(".b-popup").addClass("_show");
  $(".b-popup-box").html(text);
  setTimeout(() => {
    hidePopup();
  }, 1500);
}

export function hidePopup() {
  $(".b-popup").removeClass("_show");
}

export function loadOff() {
  $(".b-loader").hide();
}

export function getCookie(name) {
  var matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function localStorageSetItem(key, value) {
  if (!value) return;
  
  let oldArray = localStorageGetItem(key);
  
  if (!oldArray) {
    oldArray = [];
  }

  const newArray = unique(oldArray.concat(value));

  localStorage.setItem(key, JSON.stringify(newArray));
}

export function localStorageGetItem(key) {
  return JSON.parse(localStorage.getItem(key));
}

function unique(arr) {
  var i,
      len = arr.length,
      out = [],
      obj = { };
  
  for (i = 0; i < len; i++) {
      obj[arr[i]] = 0;
  }
  for (i in obj) {
      out.push(i);
  }
  return out;
};