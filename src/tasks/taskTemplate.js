export function template(data) {
  return `<div class="row task-row align-items-center" data-id="${data.id}">
            <div class="col-1"><a href="https://iricom.plan.io/issues/${data.id}" target="_blank">${data.id}</a></div>
            <div class="col-1">
            <select class="js-status-change" data-id="${data.id}">
              ${getStatuses(data.status.id)}
              </select>
            </div>
            <div class="col-4"><a href="https://iricom.plan.io/issues/${data.id}" target="_blank">${data.subject}</a></div>
            <div class="col-2">${data.assigned_to.name}</div>
            <div class="col-2">${data.author.name}</div>
            <div class="col-2">${fixDate(data.updated_on)}</div>
          </div>`;
}

function fixDate(date) {
  return date
          .replace('Z', '')
          .split('T')
          .join(' ');
}

function getStatuses(status) {
  const statuses = [
    {name: 'To Do', value: 1},
    {name: 'In Progress', value: 2},
    {name: 'Completed', value: 5},
    {name: 'Block', value: 6}
  ];

  let options = '';

  statuses.map((item) => {
    const selected = item.value === status ? 'selected' : '';

    options += `<option value="${item.value}" ${selected}>${item.name}</option>`
  });

  return options;
}