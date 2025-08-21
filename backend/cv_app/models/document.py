from mongoengine import Document, ReferenceField, StringField, FileField, DateTimeField
from .candidate import Candidate
import datetime

class DocumentFile(Document):
    candidate = ReferenceField(Candidate, required=True, reverse_delete_rule=2)  # CASCADE
    file = FileField()  # GridFS pour stocker dans MongoDB
    doc_type = StringField(choices=["cv", "cover_letter", "other"], default="cv")
    uploaded_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {"collection": "documents", "db_alias": "default"}

    def __str__(self):
        return f"{self.candidate} - {self.doc_type}"
