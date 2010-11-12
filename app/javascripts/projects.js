var ProjectsController = {
  displayState: function(project) {
    if (project.get('done') === ($('.project-field .state .ui-icon-check').length === 0)) {
      TasksController.toggleState($('.project-field .state'));
    }
  },

  tasks: function(project) {
    var tasks = [], items;
    items = Collection.get('project_tasks_' + project.get('id')) || [];

    if (items.length === 0) {
      tasks = Task.findAll({ 'project_id': project.get('id'), 'archived': false })
    } else {
      tasks = jQuery.map(items, function(id) {
        return Task.find(id);
      });

      jQuery.each(tasks, function(index, task) {
        if (task.get('archived')) {
          delete tasks[index];
        }
      });
    }

    return tasks;
  },

  display: function(project, element) {
    if (!element) {
      element = $('#show_project_' + project.get('id'));
    }

    var name = (project.get('name') || '').length === 0 ? defaultFieldValues.project_name : project.get('name')
    $('.project-field').show();
    $('.project-header .name-text').html(name);

    /*
    if (project.get('tags')) {
      $('.project-header .tags').html(project.get('tags'));
    } else {
      $('.project-header .tags').html('Tags');
    }
    */

    if (project.get('notes')) {
      $('.project-header .notes').html(project.get('notes'));
    } else {
      $('.project-header .notes').html(defaultFieldValues.project_notes);
    }

    var tasks = ProjectsController.tasks(project);
    TasksController.display(tasks);
    ProjectsController.displayState(project);

    if (project.get('due')) {
      $('.project-header .due-date').html(presentDate(project.get('due')));
    } else {
      $('.project-header .due-date').html('Due Date');
    }

    $('#project-info').show();

    if (Settings.get('outline-view-width')) {
      $('.outline-view').css({ width: Settings.get('outline-view-width') }); 
    }
  },

  displayAll: function() {
    $('.outline-view .projects li').remove();

    jQuery.each(Collection.get('projects') || [], function(index, value) {
      ProjectsController.insert(Project.find(value));
    });
    selectProject();
  },

  insert: function(project) {
    if (!project) return;
    var name = (project.get('name') || '').length === 0 ? defaultFieldValues.project_name : project.get('name'),
        html = $('<li><a id="show_project_' + project.get('id') + '" href="#">' + name + '</a></li>');
    $('.outline-view .items.projects').append(html);
    $('.outline-view .projects li:last').droppable({
      hoverClass: 'hover-drag',
      dragClass: 'dragging',
      accept: '.task',
      drop: function(e, ui) {
        var project = Project.find($(this).find('a').itemID()),
            taskElement = $(e.srcElement).closest('.task'),
            task = Task.find(taskElement.itemID());

        // Move project
        if (project && task && project.get('id') != task.get('project_id')) {
          // Remove from old project list, if there was one
          if (task.get('project_id')) {
            Collection.removeItem('project_tasks_' + task.get('project_id'), task.get('id'));
          }

          // Remove from inbox
          Collection.removeItem('inbox', task.get('id'));
          Collection.appendItem('project_tasks_' + project.get('id'), task.get('id'));
          task.set('project_id', project.get('id'));
          task.set('archived', false);

          if (!$('#show-today').closest('li').hasClass('selected')) {
            taskElement.remove();
          }

          // Insert the project name 
          if (selectedCollectionIsNamed()) {
            var name = (project.get('name') || '').length === 0 ? defaultFieldValues.project_name : project.get('name');
            taskElement.find('div.button .ui-button-text').html(name + ': ' + task.get('name'));
          }
        }
        dragLock.timedUnlock();
      }
    });

    return project;
  },

  add: function() {
    // TODO: add at the top
    var project = Project.create({ 'name': 'New Project' });
    Settings.set('outline-view', '#show_project_' + project.get('id'));
    ProjectsController.displayAll();
    // TODO: select title element for editing
    $('#project-info .name-text').trigger('click');
  },

  saveSort: function(e, ui) {
    var items = [];
    $('.outline-view .items.projects a').each(function() {
      items.push($(this).itemID());
    });
    Collection.set('projects', items);
  },

  installEvents: function() {
    $('.project.add-button').click(function() {
      ProjectsController.add();
    });
  }
};

ProjectsController.installEvents();
