class User
  include Mongoid::Document
  field :identity_url
  field :display_identifier
  field :name
  index :identity_url, :unique => true
end
