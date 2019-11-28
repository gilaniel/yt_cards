export function login(data) {
  return $.post('http://127.0.0.1:8010/login', data);
}

export function addIssue(options) {
  var data = new FormData();
  
  for(var i in options) {
    data.append(i,options[i]);
  }

  return $.ajax({
    type: 'POST',
    url: 'http://127.0.0.1:8010/add_issue',
    data: data,
    contentType: false,
    processData: false
  });
}

export function status(data) {
  return $.post('http://127.0.0.1:8010/status', data);
}