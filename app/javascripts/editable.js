function closeEditable(element) {
  $('.editable-field form.editable').each(function() {
    var form = $(this),
        value = form.find('.field').val(),
        container = form.parent();
    if (!value || value.length === 0) {
      value = defaultFieldValues[container.attr('name')];
    }

    // Add 'project: ' to the task name
    if (selectedCollectionIsNamed()) {
      var task = Task.find(form.parents('.task').itemID()),
          project = Project.find(task.get('project_id'));
      if (project) {
        value = project.get('name') + ': ' + value;
      }
    }

    // I sometimes get NOT_FOUND_ERR: DOM Exception 8 if I don't do html('')
    container.html('').text(value);
  });
  $('#datepicker').remove();
}

function saveEditable() {
  var input = $('.editable .field').first(),
      projectID,
      taskID,
      task,
      project;

  if (input.length === 0) return;
  projectID = $('.outline-view li.selected a').itemID();

  if (projectID && input.closest('.task').length === 0) {
    project = Project.find(projectID);
    jQuery.each(['name', 'notes'], function(index, field) {
      if (input.closest('.' + field).length > 0) {
        project.set(field, input.val());
      }
    });
    ProjectsController.displayAll();
  } else {
    taskID = input.closest('li.task').itemID();
    if (taskID) {
      task = Task.find(taskID);
      jQuery.each(['name', 'tags', 'notes'], function(index, field) {
        if (input.closest('.' + field).length > 0) {
          task.set(field, input.val());
        }
      });
    }
  }
}

// FIXME: I don't understand the cause of this
// browser fix -- the columns break when pasting content
// Seen in Chrome and Safari
$('form.editable textarea').live('paste', function(e) {
  setTimeout(resize, 5);
  setTimeout(resize, 10);
});

$('form.editable').live('submit', function(e) {
  e.preventDefault();
  saveEditable();
  closeEditable();
});

