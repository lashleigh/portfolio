class Note
  include MongoMapper::EmbeddedDocument

  key :time, Time, :required => true
  key :body, String, :required => true

  def markdown
    Redcarpet::Markdown.new(Redcarpet::Render::HTML, :autolink => true, :space_after_headers => true).render(self.body).html_safe
  end

  def as_json(options={})
    {
      :id => self.id,
      :time => self.time,
      :body => self.body,
      :markdown => self.markdown
    }
  end
end
