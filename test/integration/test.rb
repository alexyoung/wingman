require 'test_helper'
require 'capybara'
require 'capybara/dsl'

Capybara.app = Rails.application
Capybara.default_wait_time = 3

class IntegrationTest < ActionController::TestCase
  include Capybara

  def setup
    Capybara.current_driver = :selenium
    generate_fixtures
    @open_id = ''
    @password = ''
  end

  def teardown
    destroy_fixtures
  end

  test 'login' do
    # Todo: Testing this application with Capybara is really annoying
    #       I don't understand how to trigger dblclick, keyboard shortcuts, etc.
    #       Plus, how do I mock the open ID login?
    visit '/'
    fill_in 'openid_url', :with => @open_id
    click_link 'login-button'
    fill_in 'Passwd', :with => @password
    click 'signIn'
    if page.has_css? '#approve_button'
      click_button 'approve_button'
    end
    Capybara.default_wait_time = 3
    find(:css, 'li.task .button').click
    sleep 30
  end
end
