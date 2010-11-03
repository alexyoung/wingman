var dateFormat = 'yy/mm/dd',
    originalEditableValue,
    dragLock = new Lock(),
    userAgent,
    userAgentFamily;

if (navigator.userAgent.match(/iPad/i) != null) {
  userAgent = 'iPad';
  userAgentFamily = 'iOS';
} else if (navigator.userAgent.match(/iPhone/i) != null) {
  userAgent = 'iPhone';
  userAgentFamily = 'iOS';
}

$(document).ajaxError(function(e, xhr, settings, exception) {
  if (xhr.status !== 200) {
    if (settings.url.match(/update_openid/)) {
      $('#settings-feedback').html(Feedback.message('error', xhr.responseText));
    } else if (xhr.status === 401) {
      window.location = '/logout';
    } else {
      console.log('error in: ' + settings.url + ' \n' + 'error: ' + xhr.responseText);
    }
  }
});

Storage.ready = function() {
  generateExampleData();
  ProjectsController.displayAll();
  resize();
  Feedback.hide();  
};

function generateExampleData() {
  if (Project.findAll().length === 0) {
    var p = Project.create({ name: 'Project ' + 1, tags: 'tag1 tag2 tag3', notes: null });
    Task.create({ 'project_id': p.id, name: 'Example task', done: false, archived: false }); 
    var t = Task.create({ 'project_id': null, name: 'Example task to do today', done: false, archived: false });
    Collection.set('inbox', []);
    Collection.set('today', [t.get('id')]);
    Collection.set('next', []);
  }
}

if ($('#login-dialog').length === 0) {
  Feedback.info('Loading...');
  Storage.remote.read();
} else {
  $('#OpenIDHelpLink').click(function() {
    $('.open-id-help').toggle();
  });
}

// Correct widths and heights based on window size
function resize() {
  var height = $(window).height() - $('#global-menu').height() - 11, containerWidth = $($('ul.project-header')[0]).width(),
      width = $('.content').width() - $('.ui-icon-todo').width() - $('.ui-icon-trash').width() - 88 + 'px';

  $('.outline-view').css({ height: height + 'px' });
  $('.content').css({ height: height + 'px', width: $('body').width() - $('.outline-view').width() - $('.content-divider').width() - 1 + 'px' });
  $('.content-divider').css({ height: height + 'px' });

  if (!containerWidth) {
    containerWidth = $('.content').width();
  }

  $('.todo-items .button').each(function() {
    this.style.width = containerWidth - $($(this).prev('.state')[0]).width() - 22 + 'px';
  });
  $('.name-text').css({ width: width, 'max-width': width });
}

$(window).resize(function() {
  setTimeout(resize, 100);
});

function selectedCollectionIsNamed() {
  return $('.outline-view .items li.selected a').hasClass('named-collection');
}

function selectedProject() {
  return $('.outline-view .items.projects li.selected a').itemID();
}

function selectProject() {
  var setting = Settings.get('outline-view');
  if (setting && setting.length > 0) {
    $(setting).trigger('click');
  }

  if ($('.outline-view .selected').length === 0) {
    $('.outline-view .items.projects li a').first().trigger('click');
  }

  if ($('.outline-view .selected').length === 0) {
    $('#show-today').trigger('click');
  }
}

function hideArchiveButtonIfRequired() {
  if ($('.todo-items .done').length > 0 && $('ul.archive li.selected').length === 0) {
    $('#archive-tasks').closest('li').show();
  } else {
    $('#archive-tasks').closest('li').hide();
  }
}

// Outline view
$('.outline-view ul.items a').live('click', function() {
  if (dragLock.locked) return;

  var element = $(this), selectedItem;
  element.closest('.outline-view').find('li.selected').removeClass('selected');
  element.parent().toggleClass('selected');

  if (element.closest('ul').hasClass('projects')) {
    ProjectsController.display(Project.find(element.itemID()), element);
  }

  selectedItem = '#' + element.attr('id');
  if (Settings.get('outline-view') !== selectedItem) {
    Settings.set('outline-view', selectedItem);
  }
  closeEditable();
});

// Sections
$('#show-settings').click(function() {
  $('#settings-feedback').html('');
  $('.content').hide();
  $('#settings').show();
  $('.task-related-button').hide();
  $('.settings-related-button').show();
  $('.outline-view .selected').removeClass('selected');
});

$('.outline-view a').live('click', function() {
  if (dragLock.locked) return;

  TasksController.removeArchived();
  $('.content').hide();
  $('#project').show();    
  $('.task-related-button').show();
  $('.settings-related-button').hide();

  $('#project-todo-items').addClass('todo-items');
  $('#search-todo-items').removeClass('todo-items');
  $('#search input').val(defaultFieldValues.search);

  resize();
  $('#delete-task').closest('li').hide(); 
  hideArchiveButtonIfRequired();
});

$('.named-collection').click(function() {
  if (dragLock.locked) return;

  var collectionName = $(this).attr('id').split('-')[1],
      displayOptions = {};

  $('.outline-view .selected').removeClass('selected');
  $(this).closest('li').addClass('selected');    
  $('#project').show();

  if (selectedCollectionIsNamed()) {
    displayOptions = { show_projects: true };
  }

  TasksController.display(jQuery.map(Collection.get(collectionName) || [], function(value) {
    return Task.find(value);
  }), displayOptions);
  $('.project-field').hide();
});

$('#show-archive').click(function() {
  if (dragLock.locked) return;

  $('.project-field').hide();
  TasksController.clear();
  $('#project').show();

  Feedback.info('Loading...');

  // TODO: Paginate
  jQuery.getJSON('/storage/archive', function(data) {
    Feedback.hide();
    var tasks = [];
    jQuery.each(data, function() {
      this.id = this._id;
      Storage.data.tasks[this.id] = this;
      tasks.push(Task.find(this.id));
    });
    if (tasks && tasks.length > 0) {
      TasksController.display(tasks, { show_projects: true });
    } else {
      Feedback.info('No tasks have been archived.');
    }
  });
});

// State change (done)
$('.project-field .state').live('click', function() {
  $('.todo-items .state').each(function() {
    var element = $(this);
    if (!element.hasClass('done')) {
      element.trigger('click');
    }
  });

  var project = Project.find(selectedProject());
  project.set('done', true);
  ProjectsController.displayState(project);
});

$('#delete-task').click(function() {
  TasksController.destroy($('.todo-items .highlight').closest('li'));
  TasksController.destroy($('.todo-items li.task.details'));
  $('#delete-task').closest('li').hide();
});

$('#archive-tasks').click(function() {
  TasksController.archive($('.todo-items .done').parents('li.task'));
});

function parseDate(value) {
  if (!value) return (new Date());
  return $.datepicker.parseDate(dateFormat, value, {});
}

function presentDate(value) {
  if (!value) return;
  return $.datepicker.formatDate($.datepicker.RFC_2822, $.datepicker.parseDate(dateFormat, value, {}));
}

function datePickerSave(value, element, picker) {
  var d = $.datepicker.parseDate('mm/dd/yy', value, {}),
      container;
  element.html('<span class="clear-due ui-icon ui-icon-circle-close"> </span>'
               + '<span class="due-button">' + $.datepicker.formatDate($.datepicker.RFC_2822, d) + '</span>');
  $(picker).remove();

  // Save
  container = element.closest('li.task');
  if (container.length > 0) {
    Task.find(container.itemID()).set('due', $.datepicker.formatDate(dateFormat, d));
  } else {
    Project.find(selectedProject()).set('due', $.datepicker.formatDate(dateFormat, d));
  }
}

$('.editable-field').live('click', function(e) {
  var element = $(this),
      content,
      datePicker,
      closestDate,
      input,
      container = element.closest('li.task');

  if (e.target.nodeName === 'INPUT' || e.target.nodeName === 'FORM') return true;
  if (element.find('form').length > 0) return true;

  closeEditable(element);

  if (element.find('form').length === 0) {
    if (element.hasClass('type-date')) {
      if (container.length > 0) {
        closestDate = Task.find(container.itemID()).get('due');
      } else {
        closestDate = Project.find(selectedProject()).get('due');
      }

      $('.content').first().append('<div id="datepicker"></div>');
      datePicker = $('#datepicker').datepicker({ autoSize: true, onSelect: function(value) { datePickerSave(value, element, this); }, defaultDate: parseDate(closestDate) });
      datePicker.css({ 'position': 'absolute', 'z-index': 99, 'left': element.offset().left, 'top': element.offset().top });
    } else {
      try {
        if (content === defaultFieldValues[element.attr('name')]) {
          content = '';
        } else {
          content = Task.find(container.itemID()).get(element.attr('name'));
        }

        if (element.hasClass('large')) {
          input = '<textarea class="editable field" rows="6">' + content + '</textarea>';
        } else {
          input = '<input type="text" class="editable field" value="' + content + '" />';
        }
        element.html('<form class="editable">' + input + '</form>').find('.field').trigger('focus');
        originalEditableValue = content;
      } catch (exception) {
        console.log(exception);
      }
    }
  }
});

$('.clear-due').live('click', function(e) {
  var element = $(this);
  var task = Task.find(element.closest('.task').itemID());
  task.set('due', null);
  element.closest('li').html(defaultFieldValues.due);
  element.remove();
  e.preventDefault();
  return false;
});

if (userAgentFamily != 'iOS') {
  $('.editable .field').live('blur', function(e) {
    saveEditable();
    closeEditable();
  });
}

if (userAgentFamily !== 'iOS') {  
  $('.content').live('click', function(e) {
    if ($(e.target).hasClass('content')) {
      TasksController.closeEditors();
      $('.todo-items .highlight').removeClass('highlight');
    }
  });
}

// Delete project dialog
$('#delete-project-dialog').dialog({
  autoOpen: false,
  width: 600,
  buttons: {
     'OK': function() { 
      $(this).dialog('close'); 
      Project.destroy(selectedProject());
      ProjectsController.displayAll();
      $('a.named-collection').first().click();
    }, 
     'Cancel': function() { 
      $(this).dialog('close'); 
    } 
  },
  modal: true
});

// Modal login panel
$('#login-dialog').dialog({
  autoOpen: true,
  title: 'Please Login',
  width: 400,
  modal: true,
  closeOnEscape: false,
  beforeclose: function() { return false; }    
});
$('#login-button').button({ });
$('#login-button').click(function() { $(this).closest('form').submit(); });
$('#openid_url').select();

// Resize when the dialog opens/closes else it sometimes messes up the scrollbars
$('#delete-project-button').click(function() {
  $('#delete-project-dialog').dialog('open');
  resize();
  return false;
});

$(document).bind('dialogclose', function(event, ui) {
  resize();
});

$('.state').live('mouseenter', function() { $(this).addClass('ui-state-hover'); }); 
$('.state').live('mouseleave', function() { $(this).removeClass('ui-state-hover'); });

$('.delete').live('mouseenter', function() { $(this).addClass('ui-state-hover'); }); 
$('.delete').live('mouseleave', function() { $(this).removeClass('ui-state-hover'); });

$('.outline-view ul.items li').live('mouseenter', function() {
  $(this).addClass('hover');
});

$('.outline-view ul.items li').live('mouseleave', function() {
  $(this).removeClass('hover');
});

// Resizable panes
(function() {
  var moving = false, width = 0;

  function start() {
    moving = true;
  }

  function end() {
    if (width > 0) {
      Settings.set('outline-view-width', width);
    }
    moving = false;
  }

  function move(e) {
    if (moving) {
      $('.outline-view').css({ width: e.pageX });
      width = e.pageX;
      resize();
    }
  }

  $('.content-divider').bind('mousedown', start);
  $(document).bind('mousemove', move);
  $(document).bind('mouseup', end);
})();

// Setup
$('.todo-items .button').button({});
$('.add-button').button({ icons: { primary: 'ui-icon-circle-plus' } });
$('#delete-task').button({ icons: { primary: 'ui-icon-trash' } });
$('#archive-tasks').button({ icons: { primary: 'ui-icon-arrowreturnthick-1-e' } });
$('#show-settings').button({ icons: { primary: 'ui-icon-gear' } });
$('#logout').button({ icons: { primary: 'ui-icon-power' } });
$('#search').button({ icons: { primary: 'ui-icon-search' } });

// disableTextSelect works better than disableSelection
$('.content-divider').disableTextSelect();

$('.todo-items .done').addClass('ui-state-disabled');

$('#project-todo-items').sortable({
  handle: '.handle',
  stop: function(e, ui) { dragLock.unlock(); TasksController.saveSort(e, ui); },
  revert: true,
  start: function(e, ui) { dragLock.lock(); $(ui.item).addClass('dragging'); }
}).disableSelection();
$('.outline-view ul .projects').sortable({ stop: ProjectsController.saveSort }).disableSelection();

$('#tabs').tabs();

// Today droppable
$('#show-today').droppable({
  hoverClass: 'hover-drag',
  dragClass: 'dragging',
  accept: '.task',
  drop: function(e, ui) {
    var taskElement = $(e.srcElement).closest('.task'),
        task = Task.find(taskElement.itemID());

    // Add to today
    if (task) {
      Collection.appendItem('today', task.get('id'));
      taskElement.find('.ui-icon-todo').addClass('ui-icon-todo-today');

      // Remove from inbox
      Collection.removeItem('inbox', task.get('id'));

      if ($('#show-inbox').closest('li').hasClass('selected')) {
        taskElement.remove();
      }
    }      

    dragLock.timedUnlock();
  }
});

$('#show-inbox').droppable({
  hoverClass: 'hover-drag',
  dragClass: 'dragging',
  accept: '.task',
  drop: function(e, ui) {
    var taskElement = $(e.srcElement).closest('.task'),
        task = Task.find(taskElement.itemID()),
        projectCollection;

    // Add to inbox
    if (task) {
      // Remove from today/projects
      Collection.removeItem('today', task.get('id'));

      if (task.get('project_id')) {
        Collection.removeItem('project_tasks_' + task.get('project_id'), task.get('id'));
      }

      // Add to inbox
      Collection.appendItem('inbox', task.get('id'));
      task.set('project_id', null);

      if (taskElement) taskElement.remove();
    }

    dragLock.timedUnlock();
  }
});

// This is used by the settings form
$('form.settings_form').submit(function(e) {
  $('#settings-feedback').html('');
  var target = $(e.target);
  jQuery.post(target.attr('action'), target.serialize(), function() {
    $('#settings-feedback').html(Feedback.message('info', 'Your details have been changed'));    
  });
  e.preventDefault();
  return false;
});

$('.project-field').hide();
resize();
