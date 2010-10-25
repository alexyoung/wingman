module ApplicationHelper
  def logged_in?
    session[:identity_url]
  end

  def render_flash
    flash.map do |flash_type, message|
      display_flash flash_type, message
    end.compact.join("\n")
  end

  def display_flash(flash_type, message)
    html =<<-HTML
    <div class="ui-widget">
			<div class="ui-state-#{flash_class flash_type} ui-corner-all" style="padding: 0 .7em;"> 
				<p><span class="ui-icon #{flash_icon flash_type}" style="float: left; margin-right: .3em;"></span> 
				<strong>#{flash_type.to_s.titlecase}:</strong> #{message}. </p>
			</div>
		</div>
    HTML
  end

  def flash_icon(flash_type)
    case flash_type
      when :error
        'ui-icon-alert'
      when :info, :sucess
        'ui-icon-info'
      else
        ''
    end
  end

  def flash_class(flash_type)
    case flash_type
      when :info, :sucess
        'highlight'
      else
        flash_type
    end
  end
end
