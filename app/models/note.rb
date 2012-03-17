class Note
  include MongoMapper::EmbeddedDocument

  key :time, Time
  key :body, String

  def as_json(options={})
    options 
  end
end
