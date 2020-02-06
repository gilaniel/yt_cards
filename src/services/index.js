export class Common {
  constructor() {
    this.port = 5000;
    this.develop = process.env.NODE_ENV === 'development';
    this.url = this.develop ? 'http://127.0.0.1:' + port : 'https://redmine.kedoo.com';
  }

  login(data) {
    return $.post(this.url + '/login', data);
  }
  
  addIssue(options) {
    var data = new FormData();
    
    for(var i in options) {
      data.append(i,options[i]);
    }
  
    return $.ajax({
      type: 'POST',
      url: this.url + '/add_issue',
      data: data,
      contentType: false,
      processData: false
    });
  }
  
  fetchStatus(data) {
    return $.post(this.url + '/status', data);
  }
  
  fetchTasks(data) {
    return $.post(this.url + '/issues', data);
  }
  
  updateIssue(data) {
    return $.post(this.url + '/update_issue', data);
  }
}