class Project
  include Mongoid::Document
  index :user_id
end
