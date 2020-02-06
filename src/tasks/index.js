import {Common} from '../services';
import {template as taskTemplate} from './taskTemplate';
import _ from 'lodash';

const common = new Common();

class Tasks {
  constructor(options) {
    this.options = options;
  }

  ui() {
    return {
      tasks: $('.tasks'),
      loader: $('.loader'),
      loader_t: $('.loader_t'),
      contextMenu: $('.context-menu')
    }
  }

  fetchTasks() {
    common.fetchTasks(this.options)
      .then((payload) => {
        this.taskList = payload;

        this.ui().loader.toggle();
        
        this.setTasks();
      },() => {
        this.ui().loader.toggle();

        alert('error');
      });
  }

  setTasks() {
    this.ui().tasks.html('');

    this.taskList.map((item) => {
      this.ui().tasks.append(taskTemplate(item)); 
    });

    
  }

  setContextPosition(e) {
    this.ui().contextMenu
      .toggle(true)
      .css({
        left: e.pageX + 10,
        top: e.pageY - $(window).scrollTop()
      });
  }

  updateIssue(options) {
    this.ui().loader_t.toggleClass('show', true);

    common.updateIssue(options)
      .then(() => {
        console.log('done');
        this.ui().loader_t.toggleClass('show', false);
      },() => {
        alert('Error update');
        this.ui().loader_t.toggleClass('show', false);
      });
  }

  handleStatusChange() {
    $('body').on('change', '.js-status-change', (e) => {
      const status_id = e.currentTarget.value;
      const issue_id = e.currentTarget.dataset.id;
    
      const options = {
        issue_id: issue_id,
        status_id: status_id,
        api_key: this.options.api_key
      }
    
      this.updateIssue(options);
    });
  }
}

chrome.storage.local.get(['api_key'], (result) => {
  const tasks = new Tasks(result);
  
  tasks.fetchTasks();

  tasks.handleStatusChange();
});