import sys
import os
from mongoengine import connect
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models.user import User   

# Connexion
connect(db="cv-analyzer", host="mongodb://localhost:27017/cv-analyzer")

def create_admin(email, password):
    existing = User.objects(email=email).first()
    if existing:
        print(f"❌ Un utilisateur avec l'email {email} existe déjà.")
        return
    
    admin = User(email=email, role="admin")
    admin.set_password(password)
    admin.save()
    print(f"✅ Admin créé avec succès : {email}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/create_admin.py <email> <password>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    create_admin(email, password)
