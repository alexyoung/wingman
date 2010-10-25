ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

class ActiveSupport::TestCase
  def generate_fixtures
    @user = User.create({ :identity_url => 'https://example.com/username' })
    @project = Project.create :id => 1, :user_id => @user.id, :name => 'Example Project'
    @task = Task.create :id => 1, :project_id => @project.id, :name => 'Example Task 1', :user_id => @user.id
    @collection = Collection.create :id => 1, :key => "project_tasks_#{@project.id}", :user_id => @user.id, :value => [@task.id]
  end

  def destroy_fixtures
    [User, Project, Task, Setting, Collection].each &:destroy_all
  end
end
