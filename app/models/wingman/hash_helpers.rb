module Wingman::HashHelpers
  COLLECTIONS = {
    'tasks' => Task,
    'projects' => Project,
    'settings' => Setting,
    'collections' => Collection
  }

  def collection_hash(name)
    conditions = { :user_id => @current_user.id }

    if name == 'tasks'
      conditions[:archived] = false
    end

    items = COLLECTIONS[name].find(:all, :conditions => conditions)
    items.inject({}) { |i, r| i[r.id] = r.raw_attributes; i[r.id]['id'] = r.id; i[r.id].delete('_id'); i }
  end

  def kv_hash(name)
    items = COLLECTIONS[name].find(:all, :conditions => { :user_id => @current_user.id })
    hash = {}
    items.each do |item|
      hash[item.key] = item.value
    end
    hash
  end

  def collection_class(collection)
    COLLECTIONS[collection]
  end
end
