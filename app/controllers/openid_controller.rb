require 'openid/store/memory'
require 'openid/store/filesystem'
require 'lib/db_store'

class OpenidController < ApplicationController
  def index
    render :action => 'new'
  end

  def new
  end

  def create
    openid_response = openid_consumer.begin params[:openid_url]
    immediate = false
    return_to = url_for :action => 'complete', :only_path => false
    realm = url_for :action => 'index', :only_path => false
    
    if openid_response.send_redirect?(realm, return_to, immediate)
      redirect_to openid_response.redirect_url(realm, return_to, immediate)
    else
      render :text => openid_response.html_markup(realm, return_to, immediate, {'id' => 'openid_form'})
    end
  rescue OpenID::DiscoveryFailure
    flash[:error] = 'Error, please enter a valid OpenID URL'
    redirect_to '/'
  end

  def complete
    current_url = url_for :action => 'complete', :only_path => false
    parameters = params.reject { |k,v| request.path_parameters[k.to_sym] }
    openid_response = openid_consumer.complete(parameters, current_url)
    case openid_response.status
    when OpenID::Consumer::FAILURE
      if openid_response.display_identifier
        flash[:error] = "Verification of #{openid_response.display_identifier} failed: #{openid_response.message}"
      else
        flash[:error] = "Verification failed: #{openid_response.message}"
      end
    when OpenID::Consumer::SUCCESS
      session[:identity_url] = openid_response.identity_url

      unless User.find :first, :conditions => { :identity_url => openid_response.identity_url }
        User.create :identity_url => openid_response.identity_url, :display_identifier => openid_response.display_identifier
      end

      flash[:info] = "Verification of #{openid_response.display_identifier} succeeded."
    when OpenID::Consumer::SETUP_NEEDED
      flash[:error] = "Immediate request failed - Setup needed"
    when OpenID::Consumer::CANCEL
      flash[:error] = "OpenID transaction cancelled."
    else
      flash[:error] = "OpenID login failed."
    end
    redirect_to '/'
  end

  private

    def openid_store
      OpenID::Store::DbStore.new
    end

    def openid_consumer
      if @openid_consumer.nil?
        @openid_consumer = OpenID::Consumer.new(session, openid_store)
      end
      return @openid_consumer
    end

end

