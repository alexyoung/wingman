class StorageController < ApplicationController
  before_filter :requires_authentication

  # The entire collection of data
  def restore
    data = {
      'collections' => kv_hash('collections'),
      'settings' => kv_hash('settings'),
      'projects' => collection_hash('projects'),
      'tasks' => collection_hash('tasks')
    }

    render :json => data
  end

  # GET /storage/archive
  def archive
    # TODO: Pagination
    @tasks = Task.where(:user_id => @current_user.id).and(:archived => true).desc(:created_at)
    render :json => @tasks
  end

  # POST /storage
  def create
    json = JSON.parse params[:data]
    json['user_id'] = @current_user.id

    save_and_respond do
      collection_class(params[:collection]).create json
    end
  end

  # PUT /storage
  def update
    json = JSON.parse params[:data]
    json['user_id'] = @current_user.id
    item = collection_class(params[:collection]).find(
      :first,
      :conditions => {
        :user_id => @current_user.id,
        :id => json['id']
      }
    )

    if item.nil?
      render :json => { 'error' => "Couldn't find #{params[:collection]} with ID: #{json['id']}" }, :status => :error
    else
      save_and_respond do
        item.update_attributes json
        item
      end
    end
  end

  # PUT /storage/set_key_value
  def set_key_value
    json = JSON.parse params['data']
    key = json['key']
    value = json['value']
    item = collection_class(params['collection']).find(:all, :conditions => { :user_id => @current_user.id, :key => key })[0]

    save_and_respond do
      if item.nil?
        item = collection_class(params['collection']).create({ :key => key, :value => value, :user_id => @current_user.id })
      else
        item.update_attributes :value => value
      end
      item
    end
  end

  # DELETE /storage
  def destroy
    item = collection_class(params[:collection]).find(
      :first,
      :conditions => {
        :user_id => @current_user.id,
        :id => params[:id]
      }
    )

    save_and_respond do
      item.destroy
      item
    end
  end

  def update_user
    @current_user.update_attributes :name => params[:current_user][:name]
    if @current_user.valid?
      render :text => 'Your name has been changed'
    else
      render :text => @current_user.errors.full_messages.to_sentence, :status => :error
    end
  end

  private
    include Wingman::HashHelpers

    def save_and_respond(&block)
      respond_to do |format|
        item = yield
        if item.valid?
          format.json { head :ok, :status => :success }
        else
          format.json { render :json => item.errors, :status => :unprocessable_entity }
        end
      end
    end
end
