class Project
  include Mongoid::Document
  index :user_id
  references_many :tasks, :dependent => :destroy
end
