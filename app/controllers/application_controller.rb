class ApplicationController < ActionController::Base
  protect_from_forgery

  def main
    load_user
  end

  def logout
    session.clear
    redirect_to '/'
  end

  def alljs
    render :text => Wingman.alljs 
  end

  private

    def load_user
      @current_user = User.find :first, :conditions => { :identity_url => session[:identity_url] }
    end

    def requires_authentication
      if session[:identity_url] and load_user
        true
      else
        respond_to do |wants|
          wants.js { render :text => 'Access denied', :status => :unauthorized }
          wants.html { redirect_to new_openid_url }
        end
      end
    end
end
