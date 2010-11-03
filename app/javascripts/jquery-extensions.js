(function($) {
  function isScrolledIntoView(elem) {
    var documentTop = $(window).scrollTop();
    var documentBottom = documentTop + $(window).height() - $('#global-menu').height();

    var elementTop = $(elem).offset().top;
    var elementBottom = elementTop + $(elem).height();

    return ((elementBottom >= documentTop) && (elementTop <= documentBottom)
    && (elementBottom <= documentBottom) && (elementTop >= documentTop));
  }

  $.fn.highlight = function() {
    var element = $(this),
        scrollContainer = $('#project');
    element.addClass('highlight');
    if (!isScrolledIntoView(element)) {
      scrollContainer.animate({ scrollTop: element.position().top }, 250);
    }
  };

  $.fn.escapeText = function(text) {
    if (text) {
      return $('<div/>').text(text).html();
    }
  };

  $.fn.disableTextSelect = function() {
    return this.each(function() {
      if ($.browser.mozilla) {
        $(this).css('MozUserSelect', 'none');
      } else if ($.browser.msie) {
        $(this).bind('selectstart', function() { return false; });
      } else {
        $(this).mousedown(function() { return false; });
      }
    });
  };

  $.fn.enableTextSelect = function() {
    return this.each(function() {
      if ($.browser.mozilla) {
        $(this).css('MozUserSelect', 'text');
      } else if ($.browser.msie) {
        $(this).bind('selectstart', function() { return true; });
      } else {
        $(this).mousedown(function() { return true; });
      }
    });
  };

  $.fn.itemID = function() {
    try {
      return $(this).attr('id').match(/_(\d+)/)[1];
    } catch (exception) {
      return null;
    }
  };
})(jQuery);

