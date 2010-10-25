module Wingman
  # Concatenates all the JavaScript, used by
  # a rake task and development mode
  def self.alljs
    %w(app/javascripts/lib/json2.js
       app/javascripts/lib/jquery.min.js
       app/javascripts/lib/jquery-ui.min.js
       app/javascripts/intro.js
       app/javascripts/reusable/feedback.js
       app/javascripts/reusable/lock.js
       app/javascripts/reusable/storage.js
       app/javascripts/reusable/mvc.js
       app/javascripts/models.js
       app/javascripts/jquery-extensions.js
       app/javascripts/defaults.js
       app/javascripts/editable.js
       app/javascripts/tasks.js
       app/javascripts/projects.js
       app/javascripts/application.js
       app/javascripts/search.js
       app/javascripts/keyboard.js
       app/javascripts/outro.js).map do |file|
      File.read(file)
    end.join("\n")
  end
end
