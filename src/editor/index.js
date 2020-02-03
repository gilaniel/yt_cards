import {addIssue} from '../services/index';

chrome.storage.local.get(['image', 'title', 'url', 'api_key'], function(result) {
  const editor = new Editor(result);

  editor.setImage();

  editor.ui().clearBtn.on('click', () => {
    editor.clear();
  });

  editor.ui().lineWidth.on('change', (e) => {
    const lineWidth = Number(e.currentTarget.value);

    editor.canvas.freeDrawingBrush.width = lineWidth;

    editor.ui().lineWidth.val(lineWidth);
  });

  editor.ui().sendBtn.on('click', () => {
    editor.sendData();
  });
});


class Editor {
  constructor(options) {
    this.options = options;
    this.canvas = new fabric.Canvas('canvas', {
      isDrawingMode: true
    });
    this.lineWidth = 5;
  }

  ui() {
    return {
      clearBtn: $('.clear-canvas'),
      lineWidth: $('.line-width-range'),
      sendBtn: $('.send'),
      description: $('textarea')
    }
  }

  setImage() {
    const image = new Image();

    image.onload = () => {
      $('canvas').attr('height', image.height).outerHeight(image.height);
      $('canvas').attr('width', image.width).outerWidth(image.width);
      $('.canvas-container').outerHeight(image.height);
      $('.canvas-container').outerWidth(image.width);

      fabric.Image.fromURL(this.options.image, (img) => {
        this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
  
      }); 

      this.setOptions();
    }

    image.src = this.options.image;
  }

  setOptions() {
    this.canvas.freeDrawingBrush.width = this.lineWidth;
    this.canvas.freeDrawingBrush.color = '#f92626';
  }

  clear() {
    this.canvas.clear();
    this.setImage();
  }

  sendData() {
    if (this.ui().description.val()) {
      this.options['description'] = this.ui().description.val()
    }

    // const canvas = document.getElementById('canvas')

    this.canvas.getElement().toBlob((blob) => {
      this.options.image = blob;

      addIssue(this.options).then((payload) => {
        alert('Success!!!!!!!!!!');
      }, () => {
        alert('error');
      });
    });

  }
}

