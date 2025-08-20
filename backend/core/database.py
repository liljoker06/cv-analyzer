import mongoengine
from decouple import config

def init_db():
    mongoengine.connect(
        db=config("MONGO_DB", default="cv-analyzer"),
        host=config("MONGO_URI", default="mongodb://localhost:27017/cv-analyzer"),
        alias="default", 
        uuidRepresentation="standard",
    )
