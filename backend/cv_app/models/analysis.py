from mongoengine import Document, ReferenceField, FloatField, StringField, DateTimeField
from datetime import datetime, timezone
from .candidate import Candidate
from .job import JobPosting

class Analysis(Document):
    job = ReferenceField(JobPosting, required=True, reverse_delete_rule=2)
    candidate = ReferenceField(Candidate, required=True, reverse_delete_rule=2)
    overall_score = FloatField(default=0.0)  # 0..10
    skills_score = FloatField(default=0.0)
    experience_score = FloatField(default=0.0)
    education_score = FloatField(default=0.0)
    location_score = FloatField(default=0.0)  
    communication_score = FloatField(default=0.0)
    culture_score = FloatField(default=0.0)

    strengths = StringField()
    weaknesses = StringField()
    recommendations = StringField()

    status = StringField(choices=["pending", "approved", "on_hold", "rejected"], default="pending")
    analyzed_at = DateTimeField(default=lambda: datetime.now(timezone.utc))

    meta = {
        "collection": "analyses",
        "db_alias": "default",
        "indexes": [{"fields": ["job", "candidate"], "unique": True}]
    }

    def __str__(self):
        return f"{self.job.title} -> {self.candidate.email} ({self.overall_score}/10)"
