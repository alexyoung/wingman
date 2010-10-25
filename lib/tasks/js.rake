require File.join(Rails.root, 'app', 'models', 'wingman')

namespace :js do
  task :build do
    File.open(File.join(Rails.root, 'public', 'javascripts', 'all.js'), 'w+') do |f|
      f << Wingman.alljs
    end
  end
end
