from mongoengine import Document, ReferenceField, FloatField, StringField, DateTimeField
from .candidate import Candidate
import datetime

class Analysis(Document):
    candidate = ReferenceField(Candidate, required=True, unique=True, reverse_delete_rule=2)
    overall_score = FloatField(default=0.0)

    # Scores détaillés
    skills_score = FloatField(default=0.0)
    experience_score = FloatField(default=0.0)
    education_score = FloatField(default=0.0)
    communication_score = FloatField(default=0.0)
    culture_score = FloatField(default=0.0)

    strengths = StringField()
    weaknesses = StringField()
    recommendations = StringField()

    analyzed_at = DateTimeField(default=datetime.datetime.now(datetime.timezone.utc))

    meta = {"collection": "analyses"}

    def __str__(self):
        return f"Analysis for {self.candidate}"
