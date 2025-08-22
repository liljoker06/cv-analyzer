from mongoengine import Document, StringField, ListField, DateTimeField
from datetime import datetime

class JobPosting(Document):
    title = StringField(required=True, max_length=200)
    company = StringField(default="", max_length=200)
    location = StringField(default="", max_length=200)
    experience_required = StringField(default="", max_length=100)
    description = StringField(default="")
    required_skills = ListField(StringField(), default=[])
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "jobs",
        "db_alias": "default",
        "indexes": [
            "title",
            "company",
            {"fields": ["title", "company", "location", "experience_required"]},
        ],
    }

    def __str__(self):
        base = self.title or "Job"
        return f"{base} @ {self.company}".strip()