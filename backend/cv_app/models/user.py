from mongoengine import Document, StringField, BooleanField, DateTimeField
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(Document):
    email = StringField(required=True, unique=True)
    password_hash = StringField(required=True)
    role = StringField(default="recruiter", choices=["admin", "recruiter"])
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.datetime.now(datetime.UTC))
    meta = {"collection": "users", "db_alias": "default"}

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
