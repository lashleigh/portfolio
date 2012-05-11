module ApplicationHelper
  def redcarpet 
    Redcarpet::Markdown.new(Redcarpet::Render::HTML, :autolink => true, :space_after_headers => true)
  end 
  def markdown(text) 
    redcarpet.render(text).html_safe
  end
  def red(text)
    RedCloth.new(text).to_html.html_safe
  end
end
