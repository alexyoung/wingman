var Feedback = {
  message: function(type, message) {
    var stateClass = type === 'error' ? 'ui-state-error' : 'ui-state-highlight',
        iconClass = type === 'error' ? 'ui-icon-alert' : 'ui-icon-info',
        html = '<div class="ui-widget">'
    + '<div class="' + stateClass + ' ui-corner-all" style="margin-top: 20px; padding: 0 .7em;">'
    + '  <p><span class="ui-icon ' + iconClass + '" style="float: left; margin-right: .3em;"></span>'
    + '  ' + message + '</p>' 
    + '</div>'
    + '</div>';
    return html;
  },

  info: function(message) {
    $('#feedback').html(Feedback.message('info', message));
    Feedback.show();
  },

  error: function(message) {
    $('#feedback').html(Feedback.message('error', message));
    Feedback.show();
  },

  hide: function() {
    $('#feedback').html('');
    $('#feedback').hide();
  },

  show: function() {
    $('#feedback').show();
  }
}

