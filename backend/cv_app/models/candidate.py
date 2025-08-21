from mongoengine import (
    Document, StringField, EmailField, DateTimeField,
    ListField, EmbeddedDocument, EmbeddedDocumentField
)
from datetime import datetime

class Experience(EmbeddedDocument):
    company_name = StringField(required=True, max_length=150)
    role = StringField(required=True, max_length=150)
    start_date = DateTimeField(required=False)
    end_date = DateTimeField(required=False)
    description = StringField(required=False)

class Candidate(Document):
    first_name = StringField(required=True, max_length=100)
    last_name  = StringField(required=True, max_length=100)

    # On conserve l’email “d’affichage”
    email     = EmailField(required=True)
    # Et on stocke une version normalisée (minuscule, trim) pour l’unicité
    email_lc  = StringField(required=True, unique=True)

    phone = StringField(max_length=20, required=False)
    applied_position = StringField(required=True, max_length=150)
    experiences = ListField(EmbeddedDocumentField(Experience), default=[])
    skills = ListField(StringField(), default=[])
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        "collection": "candidates",
        "db_alias": "default",
        "indexes": [
            {"fields": ["email_lc"], "unique": True, "name": "uniq_email_lc"},
        ],
    }

    def clean(self):
        """Appelée avant save(); assure email_lc cohérent."""
        em = (self.email or "").strip().lower()
        if not em:
            # Si tu crées des candidats sans email, force un placeholder unique
            from time import time
            em = f"unknown_{int(time()*1000)}@local"
            self.email = em
        self.email_lc = em

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.applied_position}"