from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models.user import User
from mongoengine.errors import DoesNotExist
import jwt, datetime
from django.conf import settings


# Création d'un recruteur (admin seulement)
class CreateRecruiterView(APIView):
    def post(self, request):
        """Création d’un recruteur (admin seulement)"""
        try:
            data = request.data
            email = data.get("email")
            password = data.get("password")
            role = data.get("role", "recruiter")

            if not email or not password:
                return Response({"error": "Email et mot de passe requis"}, status=400)

            # Vérif si admin
            current_user_role = request.headers.get("X-Role")
            if current_user_role != "admin":
                return Response({"error": "Non autorisé"}, status=403)

            # Vérif si existe déjà
            if User.objects(email=email).first():
                return Response({"error": "Utilisateur déjà existant"}, status=400)

            user = User(email=email, role=role)
            user.set_password(password)
            user.save()

            return Response({"message": "Recruteur créé avec succès", "id": str(user.id)}, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Mise à jour d'un utilisateur
class UpdateUserView(APIView):
    def put(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            data = request.data

            if "email" in data:
                user.email = data["email"]
            if "password" in data:
                user.set_password(data["password"])
            if "role" in data:
                user.role = data["role"]
            if "is_active" in data:
                user.is_active = data["is_active"]

            user.save()
            return Response({"message": "Utilisateur mis à jour"}, status=200)

        except DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Suppression d'un utilisateur
class DeleteUserView(APIView):
    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({"message": "Utilisateur supprimé"}, status=200)
        except DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=404)


# Connexion utilisateur
class LoginView(APIView):
    def post(self, request):
        try:
            data = request.data
            email = data.get("email")
            password = data.get("password")

            user = User.objects(email=email).first()
            if not user or not user.check_password(password):
                return Response({"error": "Email ou mot de passe incorrect"}, status=401)

            if not user.is_active:
                return Response({"error": "Compte désactivé"}, status=403)

            # Génération d’un token JWT
            payload = {
                "id": str(user.id),
                "email": user.email,
                "role": user.role,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

            return Response({"token": token, "role": user.role}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Récupération de tout les utilisateurs
class GetAllUsersView(APIView):
    def get(self, request):
        try:
            users = User.objects.all()
            user_data = [{"id": str(user.id), "email": user.email, "role": user.role, "is_active": user.is_active} for user in users]
            return Response(user_data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Récupération des données de l'utilisateurs connecté
class GetCurrentUserView(APIView):
    def get(self, request):
        try:
            user = request.user
            user_data = {
                "id": str(user.id),
                "email": user.email,
                "role": user.role
            }
            return Response(user_data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)