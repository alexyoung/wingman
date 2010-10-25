require 'test_helper'

class StorageControllerTest < ActionController::TestCase
  def setup
    generate_fixtures
    @request.accept = 'application/json'    
  end

  def teardown
    destroy_fixtures
  end

  test 'access control session fail' do
    @request.accept = 'text/html'  
    post :create, { 'collection' => 'tasks', 'data' => '{"id":111111,"name":"do this"}' }, :identity_url => nil
    assert_redirected_to new_openid_url
  end

  test 'access control account hack' do
    @request.accept = 'text/javascript'  
    @task.name = 'Example Task Updated'
    json = @task.attributes
    json['id'] = json['_id']
 
    put :update, { 'collection' => 'tasks', 'data' => json.to_json }, :identity_url => 'https://example.com/fake'
    assert_response :unauthorized
  end

  test 'create' do
    post :create, { 'collection' => 'tasks', 'data' => '{"id":111111,"name":"do this"}' }, :identity_url => @user.identity_url
    assert_response :success
  end

  test 'update' do
    @task.name = 'Example Task Updated'
    json = @task.attributes
    json['id'] = json['_id']
    put :update, { 'collection' => 'tasks', 'data' => json.to_json }, :identity_url => @user.identity_url
    assert_response :success
  end

  test 'update not found' do
    put :update, { 'collection' => 'tasks', 'data' => { '_id' => 1, 'name' => 'test' }.to_json }, :identity_url => @user.identity_url
    assert_response :error
  end

  test 'set_key_value create' do
    json = { 'key' => 'test', 'value' => [1, 2, 3, 4] }.to_json
    put :set_key_value, { 'data' => json, 'collection' => 'collections' }, :identity_url => @user.identity_url
    assert_response :success
    assert_equal [1, 2, 3, 4], Collection.find(:first, :conditions => { :key => 'test' }).value
  end

  test 'set_key_value update' do
    json = { 'key' => "project_tasks_#{@project.id}", 'value' => [@project.id, 1] }.to_json
    put :set_key_value, { 'data' => json, 'collection' => 'collections' }, :identity_url => @user.identity_url
    assert_response :success
    assert_equal [@project.id, 1], Collection.find(:first, :conditions => { :key => "project_tasks_#{@project.id}" }).value
  end

  test 'destroy' do
    delete :destroy, { 'id' => @task.id, 'collection' => 'tasks' }, :identity_url => @user.identity_url
    assert_response :success
  end
end

