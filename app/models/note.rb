class Note
  include MongoMapper::EmbeddedDocument

  key :time, Time
  key :body, String

end
