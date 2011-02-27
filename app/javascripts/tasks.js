var TasksController = {
  selectedTask: function() {
    return Task.find($('.task .highlight').closest('li').itemID() || $('.task.details').itemID());
  },

  open: function(button) {
    var name = button.find('span').html(),
      taskID = button.closest('li.task').itemID(),
      task,
      clearDueDate = '';

    if (taskID) {
      task = Task.find(taskID);
    }

    if (task.get('due')) {
      clearDueDate = '<span class="clear-due ui-icon ui-icon-circle-close"> </span>'
    }

    task = $.extend({ tags: 'Tags', notes: defaultFieldValues.notes }, task);

    button.parent('li').addClass('details');
    button.addClass('details');
    button.find('span').html('<ul class="details">'
      + '<li name="name" class="first name editable-field">' + jQuery().escapeText(task.get('name') || defaultFieldValues.name) + '</li>'
      + '<li name="notes" class="notes editable-field large">' + jQuery().escapeText(task.get('notes') || defaultFieldValues.notes) + '</li>'
      + '<li name="due" class="last type-date editable-field">'
      + clearDueDate
      + '<span class="due-button">' + (presentDate(task.get('due')) || defaultFieldValues.due)  + '</span>'
      + '</li>'
      + '<li class="buttons">'
      + '<span class="close-task"><a class="close-task" title="Close task" href="#"><span class="ui-icon ui-icon-circle-minus"> </span></a></span>'
      + '<span class="sort-task"><a class="sort-task" href="#"><span class="ui-icon ui-icon-folder-collapsed"> </span></a></span>'
      + '</li>'
      + '</ul>');
    button.find('.editable-field').first().trigger('click');
    return button;
  },

  insert: function(task, append, options) {
    var button, container, projectID, extraClass = '',
      stateClass = task && task.get('done') ? 'task-done' : 'task-not-done',
      projectText = '';

    if (typeof options === 'undefined') {
      options = {};
    }

    if (!task) {
      projectID = $('.outline-view li.selected a').itemID() || null;
      task = Task.create({ name: defaultFieldValues.name, project_id: projectID, archived: false });
    }

    if (task && Collection.inCollection('today', task)) {
      extraClass = ' ui-icon-todo-today';
    }

    if (options.show_projects && task.get('project_id')) {
      var taskProject = Project.find(task.get('project_id'));
      if (taskProject)
        projectText = taskProject.get('name') + ': ';
    }

    container = $('<li class="task" id="task_' + task.get('id') + '">'
      + '<div class="handle state ' + stateClass + ' ui-state-default ui-corner-all"><span class="ui-icon ui-icon-todo' + extraClass + '"></span></div>'
      + '<div class="handle button ui-state-focus">' + projectText + jQuery().escapeText(task.get('name') || defaultFieldValues.name) + '</div>'
      + '</li>');

    if (options.position >= 0) {
      container.insertAfter($('.todo-items li')[options.position]);
    } else if (append) {
      $('.todo-items').append(container);
    } else {
      $('.todo-items').prepend(container);
    }

    button = container.find('.button');
    // TODO: secondary doesn't work how I want in this version of jQuery UI
    //button.button({ icons: { secondary: 'ui-icon-blank' } });
    button.button({});
    resize();

    if (task.get('done')) {
      hideArchiveButtonIfRequired();
      TasksController.toggleState(container.find('.state'));
    }

    Task.updateDueState(task);

    return button;
  },

  closeEditors: function() {
    $('#datepicker').remove();
    $('#delete-task').closest('li').hide();
    $('#not-today').closest('li').hide();
    $('.todo-items .button').removeClass('ui-state-active')
    $('.todo-items li.details').each(function() {
      var li = $(this),
          name = li.find('li.name').html(),
          form = li.find('form.editable'),
          span;

      if (form) {
        if (form.find('.field').length > 0) {
          try {
            form.parent().html(form.find('.field').val().trim());
          } catch (exception) {
          }
        }
      }

      span = li.find('div.button').removeClass('details').find('span');
      span.html(name);
    });
    
    $('.todo-items li.details').removeClass('details');
    TasksController.refreshDueStates();
  },

  refreshDueStates: function() {
    $('.todo-items .task').each(function() {
      var task = Task.find($(this).itemID());
      if (task) {
        Task.updateDueState(task);
      }
    });
  },

  destroy: function(buttons) {
    buttons.each(function() {
      var buttonContainer = $(this),
          taskID = buttonContainer.itemID();
      if (taskID) {
        Task.destroy(taskID);
        buttonContainer.remove();
      }
    });
  },

  notToday: function(buttons) {
    buttons.each(function() {
      var buttonContainer = $(this),
          taskID = buttonContainer.itemID();
      if (taskID) {
        var task = Task.find(taskID);
        Collection.removeItem('today', task.get('id'));
        if (!task.get('project_id')) {
          Collection.appendItem('inbox', task.get('id'));
        }
        buttonContainer.remove();
      }
    });
  },

  archive: function(buttonContainers) {
    jQuery.each(buttonContainers, function() {
      var taskID = $(this).itemID(),
          task = Task.find(taskID);
      task.set('archived', true);
      Collection.removeItem('today', task.get('id'));
    });
    buttonContainers.remove();
    hideArchiveButtonIfRequired();
    // TODO: Update project json
    // TODO: Get the IDs and send to server
  },

  clear: function() {
    $('#archive-tasks').closest('li').hide();
    $('.todo-items li').remove();
  },

  // Remove archived tasks from memory
  removeArchived: function() {
    jQuery.each(Task.findAll({ 'archived': true }), function() {
      delete Storage.data.tasks[this.id];
    });
  },

  toggleState: function(element) {
    var container;

    if (!element.hasClass('state')) {
      element = element.find('.state');
    }

    container = element.parent();
    container.find('.done').removeClass('ui-state-disabled');
    element.find('span').toggleClass('ui-icon-todo');
    element.find('span').toggleClass('ui-icon-check');
    element.toggleClass('done');

    container.find('div.button').toggleClass('done');

    if (container.find('.done').length > 0) {
      element.find('.ui-icon-todo-today').removeClass('ui-icon-todo-today');
    } else if (Collection.isActive('today')) {
      element.find('.ui-icon').addClass('ui-icon-todo-today');
    }

    $('.todo-items .done').addClass('ui-state-disabled');
    hideArchiveButtonIfRequired();
  },

  display: function(tasks, options) {
    Feedback.hide();
    TasksController.clear();
    
    jQuery.each(tasks, function(index, task) {
      if (task) {
        TasksController.insert(task, true, options);
      }
    });
  },

  saveSort: function() {
    var items = [], collectionName;

    $('.todo-items .task').each(function() {
      items.push($(this).itemID());
    });

    if (selectedProject()) {
      Collection.set('project_tasks_' + selectedProject(), items);
    } else if ($('ul.archive li.selected').length === 0) {
      collectionName = $('li.selected .named-collection').attr('id').split('-')[1];
      Collection.set(collectionName, items);
    }
  },

  installEvents: function() {
    // Add tasks
    $('.task.add-button').click(function() {
      var taskPosition = $('.todo-items .highlight').closest('li').index(),
          options = taskPosition >= 0 ? { position: taskPosition } : undefined;
      TasksController.closeEditors();
      TasksController.open(TasksController.insert(false, false, options));
    });

    $('.todo-items .state').live('click', function() {
      var element = $(this),
          container,
          task;

      TasksController.toggleState(element);
      task = Task.find(element.closest('li').itemID());
      task.set('done', element.hasClass('done'));
    });

    // Task single click
    (function() {
      // Don't use this for iOS
      if (userAgentFamily === 'iOS') return;
      
      function selectGroup(from, to) {
        var buttons   = $('.todo-items .button'),
            indexes   = [buttons.index(from), buttons.index(to)].sort(function(a, b) { return a - b; }),
            indexFrom = indexes[0],
            indexTo   = indexes[1] + 1;

        $('.todo-items .button').slice(indexFrom, indexTo).each(function(index) {
          $(this).addClass('highlight');
        });
      }

      $('.todo-items .button').live('click', function(e) {
        var target = $(e.target), add = true, button;
        if (target.attr('nodeName') === 'TEXTAREA') return;
        if (target.attr('nodeName') === 'INPUT') return;
        if (target.attr('nodeName') === 'A') return;
        button = $(this);

        if (button.hasClass('highlight')) {
          add = false;
        }

        // Detect shift-click
        if (e.shiftKey) {
          var activeButton = $('.todo-items .highlight');
          if (activeButton.length > 0) {
            selectGroup(activeButton, button);
          }
        } else {
          $('.todo-items .button').removeClass('highlight');
        }

        if ($('.todo-items li.details').length > 0
            && $('.todo-items li.details').find('.button')[0] !== this) {
          TasksController.closeEditors();
        }

        if (add) {
          button.highlight();
          $('#delete-task').closest('li').show();

          if (Collection.isActive('today')) {
            $('#not-today').closest('li').show();
          }
        } else {
          if ($('.todo-items li.details').length === 0) {
            $('#delete-task').closest('li').hide();
          }
        }
      });
    })();

    $('.todo-items .button').live((userAgentFamily === 'iOS' ? 'click' : 'dblclick'), function(e) {
      var target = $(e.target);
      if (target.closest('.li').length > 0) return;
      if (target.attr('nodeName') === 'INPUT') return;
      if (target.attr('nodeName') === 'TEXTAREA') return;
      if (target.hasClass('editable-field')) return;
      if (e.target === this) return;

      var button = $(this),
          name;

      TasksController.closeEditors();
      button.addClass('highlight');

      if (!button.hasClass('details')) {
        TasksController.open(button);
      }

      return false;
    });

    $('a.close-task').live('click', function(e) {
      saveEditable();
      closeEditable();
      TasksController.closeEditors();
      e.stopPropagation();
      $('.todo-items .button').removeClass('highlight');
      return false;
    });

    $('a.sort-task').live('click', function(e) {
      var container = $('#sort-dialog').html('<p>Select a new location for this task:</p><ul class="folders"></ul>').find('ul'),
          task = TasksController.selectedTask();
      container.append('<li><input type="checkbox" name="named-folder" value="today"> Today</li>');
      container.append('<li style="margin: 1em 0">Projects:</li>');
      jQuery.each(Collection.get('projects') || [], function(index, value) {
        var project = Project.find(value);
        if (project)
          container.append('<li><input type="radio" name="folder" value="' + value + '"> ' + project.get('name') + '</li>');
      });

      if (task.get('project_id')) {
        $('input[value="' + task.get('project_id') + '"]').attr({ 'checked': 'checked' });
      }

      if (Collection.inCollection('today', task)) {
        $('input[value="today"]').attr({ 'checked': 'checked' });
      }

      $('#sort-dialog').dialog('open')
    });

    $('#sort-dialog').dialog({
      autoOpen: false,
      width: 600,
      title: 'Organize Task',
      buttons: {
       'OK': function() {
          var selected = $('input[name="folder"]:checked').val(),
              named = $('input[name="named-folder"]:checked').val(),
              task = TasksController.selectedTask();
          if (task) {
            if (selected && parseInt(selected, 0) > 0) {
              // Move task to project
              var project = Project.find(selected);
              if (task.get('project_id')) {
                Collection.removeItem('project_tasks_' + task.get('project_id'), task.get('id'));
              }
              task.set('project_id', project.get('id'));
              Collection.appendItem('project_tasks_' + project.get('id'), task.get('id'));
              Collection.removeItem('inbox', task.get('id'));
            }

            if (named) {
              Collection.removeItem('today', task.get('id'));
              Collection.removeItem('inbox', task.get('id'));

              // Move task to named collection
              if (named === 'inbox') {
                Collection.appendItem('inbox', task.get('id'));
              } else if (named === 'today') {
                Collection.appendItem('today', task.get('id'));
              }
            }
          }
          $('.outline-view .selected a').click();
          $(this).dialog('close');
        }, 
        'Cancel': function() {
          $(this).dialog('close');
        }
      },
      modal: true
    });

  }
};

TasksController.installEvents();
