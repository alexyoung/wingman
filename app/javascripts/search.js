var SearchController = {
  run: function(e) {
    var input = $('#search input'), tasks;

    if (input.val().length == 0 && !$('#search-results').is(':visible')) {
      return;
    }

    if (input.val() === defaultFieldValues.search || input.val().length == 0) {
      $('#search-todo-items').html('<li>' + Feedback.message('error', 'Enter a longer search phrase.') + '</li>');
      return;
    }

    if (!$('#search-results').is(':visible')) {
      $('.outline-view .selected').removeClass('selected');
      $('.content').hide();
      $('#search-results').show();
      $('#project-todo-items').removeClass('todo-items');
      $('#search-todo-items').addClass('todo-items');
    }

    tasks = Task.search(input.val());

    if (tasks.length === 0) {
      $('#search-todo-items').html('<li>' + Feedback.message('info', 'No results found.') + '</li>');
    } else {
      TasksController.display(tasks);
    }
    resize();

    e.preventDefault();
  },

  timer: function() {
    var searchText = $('#search input').val();

    function timer() {
      var newText = $('#search input').val();
      if (searchText != newText) {
        $('#search form input').trigger('change');
        searchText = newText;
      }
      setTimeout(timer, 1000);
    }

    timer();
  },

  installEvents: function() {
    $('#search form').submit(function(e) { e.preventDefault(); });
    $('#search form input').change(SearchController.run);
    $('#search form input').blur(function() {
      var input = $('#search form input');
      if (input.val().trim().length === 0)
        input.val(defaultFieldValues.search);
    });
    $('#search form input').click(function(e) {
      if ($('#search form input').val() === defaultFieldValues.search) {
        $('#search form input').val('');
      }
    });

    SearchController.timer();
  }
};

SearchController.installEvents();
