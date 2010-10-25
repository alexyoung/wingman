class Task
  include Mongoid::Document
  include Mongoid::Timestamps
  index :project_id
  index :user_id
end
