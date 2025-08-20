from mongoengine import Document, StringField, EmailField, DateTimeField, ListField, EmbeddedDocument, EmbeddedDocumentField
from datetime import datetime


class Experience(EmbeddedDocument):
    company_name = StringField(required=True, max_length=150)
    role = StringField(required=True, max_length=150)
    start_date = DateTimeField(required=False)
    end_date = DateTimeField(required=False)
    description = StringField(required=False)


class Candidate(Document):
    first_name = StringField(required=True, max_length=100)
    last_name = StringField(required=True, max_length=100)
    email = EmailField(required=True)
    phone = StringField(max_length=20, required=False)
    applied_position = StringField(required=True, max_length=150)
    experiences = ListField(EmbeddedDocumentField(Experience), default=[])  # plusieurs entreprises
    skills = ListField(StringField(), default=[])  # liste de compétences
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "candidates"}

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.applied_position}"
