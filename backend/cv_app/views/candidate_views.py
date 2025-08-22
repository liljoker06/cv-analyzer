from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from cv_app.models.candidate import Candidate
import json
from bson import ObjectId
from datetime import datetime

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super(JSONEncoder, self).default(obj)

@csrf_exempt
def get_candidates(request):
    """
    Récupère tous les candidats de la base de données
    """
    try:
        candidates = Candidate.objects.all().order_by('-created_at')
        candidates_data = []
        
        for candidate in candidates:
            # Calculer l'expérience totale
            total_experience = 0
            experiences = []
            for exp in candidate.experiences:
                exp_data = {
                    'company': exp.company_name,
                    'role': exp.role,
                    'description': exp.description
                }
                
                if exp.start_date and exp.end_date:
                    exp_data['start_date'] = exp.start_date
                    exp_data['end_date'] = exp.end_date
                    duration = exp.end_date - exp.start_date
                    total_experience += duration.days / 365.25
                
                experiences.append(exp_data)
            
            # Créer l'objet candidat
            candidate_data = {
                'id': str(candidate.id),
                'first_name': candidate.first_name,
                'last_name': candidate.last_name,
                'name': f"{candidate.first_name} {candidate.last_name}",
                'email': candidate.email,
                'phone': candidate.phone,
                'applied_position': candidate.applied_position,
                'skills': candidate.skills,
                'experiences': experiences,
                'experience_years': int(total_experience),
                'created_at': candidate.created_at
            }
            candidates_data.append(candidate_data)
        
        return JsonResponse(candidates_data, safe=False, encoder=JSONEncoder)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_candidate(request, candidate_id):
    """
    Récupère les détails d'un candidat spécifique
    """
    try:
        try:
            oid = ObjectId(candidate_id)
        except:
            return JsonResponse({'error': 'ID de candidat invalide'}, status=400)
        
        try:
            candidate = Candidate.objects.get(id=oid)
        except Candidate.DoesNotExist:
            return JsonResponse({'error': 'Candidat introuvable'}, status=404)
        
        # Calculer l'expérience totale
        total_experience = 0
        experiences = []
        for exp in candidate.experiences:
            exp_data = {
                'company': exp.company_name,
                'role': exp.role,
                'description': exp.description
            }
            
            if exp.start_date and exp.end_date:
                exp_data['start_date'] = exp.start_date
                exp_data['end_date'] = exp.end_date
                duration = exp.end_date - exp.start_date
                total_experience += duration.days / 365.25
            
            experiences.append(exp_data)
        
        # Créer l'objet candidat détaillé
        candidate_data = {
            'id': str(candidate.id),
            'first_name': candidate.first_name,
            'last_name': candidate.last_name,
            'name': f"{candidate.first_name} {candidate.last_name}",
            'email': candidate.email,
            'phone': candidate.phone,
            'applied_position': candidate.applied_position,
            'skills': candidate.skills,
            'experiences': experiences,
            'experience_years': int(total_experience),
            'created_at': candidate.created_at
        }
        
        return JsonResponse(candidate_data, encoder=JSONEncoder)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
