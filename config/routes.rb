Wingman::Application.routes.draw do
  root :to => '', :action => 'main', :controller => 'application'  
  match 'logout' => 'application#logout'
  match 'javascripts/all-development.js' => 'application#alljs'

  resource :storage, :controller => 'storage', :as => :storage do
    member do
      put :set_key_value
      get :restore
      get :archive
      post :update_user
    end
  end

  resource :openid, :controller => 'openid', :as => :openid do
    member do
      get :complete
      get :index
    end
  end
end
