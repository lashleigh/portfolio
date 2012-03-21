class Note
  include MongoMapper::EmbeddedDocument

  key :time, Time, :required => true
  key :body, String, :required => true

end
