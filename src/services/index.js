const PORT = 5000;

export function login(data) {
  return $.post('http://127.0.0.1:'+PORT+'/login', data);
}

export function addIssue(options) {
  var data = new FormData();
  
  for(var i in options) {
    data.append(i,options[i]);
  }

  return $.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:'+PORT+'/add_issue',
    data: data,
    contentType: false,
    processData: false
  });
}

export function status(data) {
  return $.post('http://127.0.0.1:'+PORT+'/status', data);
}