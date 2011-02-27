var Project,
    Task,
    Collection,
    Settings;

Project = new Model('projects');
Task = new Model('tasks');
Settings = new KeyValueModel('settings');
Collection = new KeyValueModel('collections');

Collection.isActive = function(collectionName) {
  return $('#show-' + collectionName).closest('li').hasClass('selected');
};

Collection.removeItem = function(collectionName, value) {
  Collection.set(collectionName, $.map(Collection.get(collectionName), function(innerValue) {
    return value === innerValue ? null : innerValue;
  }));
};

Collection.appendItem = function(collectionName, value) {
  var items = Collection.get(collectionName);
  if (items) {
    items.push(value);
    Collection.set(collectionName, items);
  }
};

Project.afterCreate = function(project) {
  var items = Collection.get('projects') || [];
  items.push(project.get('id'));
  Collection.set('projects', items);
};

Project.updateDone = function(project) {
  var done = false;
  done = Task.findAll({ 'project_id': project.get('id'), 'done': false }).length === 0;
  project.set('done', done);
  ProjectsController.displayState(project);
};

Task.updateDueState = function(task) {
  var stateIcons = '',
      button;
  $('#task_' + task.get('id') + ' .task-state-icon').remove();

  if (task.get('due')) {
    stateIcons = '<span class="task-state-icon ui-button-icon-secondary ui-icon ui-icon-clock"></span>';
    if (task.get('due') < $.datepicker.formatDate('yy/mm/dd', new Date())) {
      stateIcons = '<span class="task-state-icon ui-button-icon-secondary ui-icon ui-icon-alert"></span>';
    }
  }

  if (task.get('notes') && task.get('notes').length > 0) {
    stateIcons += '<span class="task-state-icon ui-button-icon-secondary ui-icon ui-icon-document"></span>';
  }

  if (stateIcons.length > 0) {
    button = $('#task_' + task.get('id') + ' .ui-button-text')
    button.prepend(stateIcons);
  }
};

Task.updateProjectDoneState = function(task) {
  if (task.get('project_id')) {
    var project = Project.find(task.get('project_id'));
    Project.updateDone(project);
  }
};

Task.afterCreate = function(task) {
  var items, collection;
  Task.updateProjectDoneState(task);

  if (task.get('project_id')) {
    collection = 'project_tasks_' + task.get('project_id');
  } else if (Collection.isActive('inbox')) {
    collection = 'inbox';
  } else if (Collection.isActive('today')) {
    collection = 'today';
  } else if (Collection.isActive('next')) {
    collection = 'next';
  } else {
    return;
  }
  items = Collection.get(collection) || [];
  items.unshift(task.get('id'));
  Collection.set(collection, items);
};

Task.afterUpdate = function(task) {
  return Task.updateProjectDoneState(task);
};

Task.search = function(regex) {
  var items = [];

  if (typeof regex === 'string') {
    regex = new RegExp(regex, 'i');
  }

  jQuery.each(Storage.data[this.collectionName], function(key, item) {
    if (item && item.name.match(regex)) {
      items.push(new ModelInstance(Task, item));
    }
  });

  return items;
};

Collection.inCollection = function(collectionName, task) {
  return $.inArray(task.get('id'), Collection.get(collectionName)) != -1;
};

