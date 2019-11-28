import {login, status} from '../services/index';

class Popup {
  constructor() {
    this.id = chrome.app.getDetails().id;
    this.autorized = false;
    this.apiKey = false;
  }

  ui() {
    return {
      screenBtn: $('.js-make-screen-btn'),
      loginForm: $('.login-form'),
      sendBtn: $('.js-send-btn'),
      error: $('.error'),
      loader: $('.loader')
    }
  }

  fetchStatus() {
    status({ key: this.apiKey })
      .then(() => {
        this.autorized = true;

        setTimeout(() => {
          this.toggleLoad(true);
          this.showContent();
        },500);
      }, () => {
        this.autorized = false;

        this.toggleLoad(true);
        this.showContent();
      });
  }

  getApiKey() {
    chrome.storage.local.get('apiKey', (result) => {
      this.apiKey = result.apiKey;

      this.fetchStatus();
    });
  }

  showContent() {
    this.ui().screenBtn.toggleClass('hidden', !this.autorized);
    this.ui().loginForm.toggleClass('hidden', this.autorized);
  }

  fetchTabData() {
    chrome.tabs.getSelected((data) => {
      this.setTabData(data)
    })
  }

  setTabData(data) {
    chrome.storage.local.set({
      'image': this.base64,
      'url': data.url,
      'title': data.title
    }, () => {
      this.openNewTab();
    });  
  }

  openNewTab() {
    const win = window.open(`chrome-extension://${popup.id}/editor.html?blank`, '_blank');
    win.focus();
  }

  toggleLoad(state) {
    this.ui().loader.toggleClass('hidden', state);
  }
}

const popup = new Popup();

$(() => {
  popup.getApiKey();

  popup.ui().sendBtn.on('click', (e) => {
    e.preventDefault();

    const data = popup.ui().loginForm.serializeArray();

    popup.toggleLoad(false);

    login(data).then((payload) => {
      chrome.storage.local.set({ 'apiKey': payload });

      popup.apiKey = payload;
      popup.autorized = true;

      popup.toggleLoad(true);
      popup.showContent();

      popup.ui().error.addClass('hidden');
    }, (error) => {
      popup.toggleLoad(true);
      popup.ui().error.removeClass('hidden').html('error');
    });
  });

  popup.ui().screenBtn.on('click', () => {
    chrome.tabs.captureVisibleTab(null, {}, function (base64) {
      popup.base64 = base64;
  
      popup.fetchTabData();
    });
  });
});
