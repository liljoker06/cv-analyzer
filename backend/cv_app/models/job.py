from mongoengine import Document, StringField, DateTimeField, ListField, ReferenceField
from datetime import datetime, timezone
from .user import User

class JobPosting(Document):
    title = StringField(required=True, max_length=150)
    company = StringField(required=False, max_length=150)
    location = StringField(required=False, max_length=150)
    experience_required = StringField(required=False, max_length=50)
    description = StringField(required=False)
    required_skills = ListField(StringField(), default=[])
    created_by = ReferenceField(User, required=False)     
    created_at = DateTimeField(default=lambda: datetime.now(timezone.utc))

    meta = {"collection": "jobs", "db_alias": "default"}

    def __str__(self):
        return f"{self.title} @ {self.company or 'N/A'}"
