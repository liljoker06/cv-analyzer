from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from cv_app.models.analysis import Analysis
from cv_app.models.job import JobPosting
from cv_app.models.document import DocumentFile
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
def get_analysis_results(request):
    """
    Récupère les résultats des analyses, regroupés par offre d'emploi.
    """
    try:
        # Récupérer les analyses regroupées par job
        job_analyses = {}
        analyses = Analysis.objects.all().order_by('-analyzed_at')
        
        for analysis in analyses:
            job_id = str(analysis.job.id)
            if job_id not in job_analyses:
                job_analyses[job_id] = {
                    'job_id': job_id,
                    'title': analysis.job.title,
                    'company': analysis.job.company,
                    'location': analysis.job.location,
                    'experience_required': analysis.job.experience_required,
                    'analyzed_at': analysis.analyzed_at,
                    'total_candidates': 0,
                    'candidates': []
                }
            
            job_analyses[job_id]['total_candidates'] += 1
            
            # Ajouter les 10 meilleurs candidats uniquement
            if len(job_analyses[job_id]['candidates']) < 10:
                candidate_data = {
                    'id': str(analysis.candidate.id),
                    'name': f"{analysis.candidate.first_name} {analysis.candidate.last_name}",
                    'email': analysis.candidate.email,
                    'score': analysis.overall_score,
                    'skills': analysis.candidate.skills,
                    'strengths': analysis.strengths,
                    'weaknesses': analysis.weaknesses,
                    'recommendations': analysis.recommendations,
                    'status': analysis.status
                }
                
                # Calculer l'expérience totale
                total_experience = 0
                for exp in analysis.candidate.experiences:
                    if exp.start_date and exp.end_date:
                        duration = exp.end_date - exp.start_date
                        total_experience += duration.days / 365.25 
                
                candidate_data['experience'] = f"{int(total_experience)} ans"
                job_analyses[job_id]['candidates'].append(candidate_data)
        
        # Convertir en liste
        results = list(job_analyses.values())
        return JsonResponse(results, safe=False, encoder=JSONEncoder)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_analysis_result(request, analysis_id):
    """
    Récupère le détail d'une analyse spécifique
    """
    try:
        # ObjectId pour MongoDB
        try:
            oid = ObjectId(analysis_id)
        except:
            return JsonResponse({'error': 'ID d\'analyse invalide'}, status=400)
        
        # Récupérer l'analyse par job
        job = JobPosting.objects.get(id=oid)
        analyses = Analysis.objects.filter(job=job).order_by('-overall_score')
        
        if not analyses:
            return JsonResponse({'error': 'Analyse introuvable'}, status=404)
        
        # Construire la réponse
        result = {
            'job_id': str(job.id),
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'experience_required': job.experience_required,
            'description': job.description,
            'required_skills': job.required_skills,
            'analyzed_at': analyses[0].analyzed_at,
            'total_candidates': len(analyses),
            'candidates': []
        }
        
        # Ajouter tous les candidats
        for analysis in analyses:
            candidate_data = {
                'id': str(analysis.candidate.id),
                'name': f"{analysis.candidate.first_name} {analysis.candidate.last_name}",
                'email': analysis.candidate.email,
                'score': analysis.overall_score,
                'skills_score': analysis.skills_score,
                'experience_score': analysis.experience_score,
                'education_score': analysis.education_score,
                'communication_score': analysis.communication_score,
                'culture_score': analysis.culture_score,
                'skills': analysis.candidate.skills,
                'strengths': analysis.strengths,
                'weaknesses': analysis.weaknesses,
                'recommendations': analysis.recommendations,
                'status': analysis.status
            }
            
            # Calculer l'expérience totale
            total_experience = 0
            experiences = []
            for exp in analysis.candidate.experiences:
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
            
            candidate_data['experience'] = f"{int(total_experience)} ans"
            candidate_data['experiences'] = experiences
            result['candidates'].append(candidate_data)
        
        return JsonResponse(result, encoder=JSONEncoder)
    
    except JobPosting.DoesNotExist:
        return JsonResponse({'error': 'Analyse introuvable'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_candidate_cv(request, candidate_id):
    """
    Récupère et renvoie le CV d'un candidat en tant que fichier PDF à télécharger
    """
    try:
        try:
            oid = ObjectId(candidate_id)
        except:
            return JsonResponse({'error': 'ID de candidat invalide'}, status=400)
        
        # Récupérer le candidat
        try:
            candidate = Candidate.objects.get(id=oid)
        except Candidate.DoesNotExist:
            return JsonResponse({'error': 'Candidat introuvable'}, status=404)
        
        # Récupérer le document de type CV pour ce candidat
        try:
            document = DocumentFile.objects.filter(candidate=candidate, doc_type="cv").first()
            if not document:
                return JsonResponse({'error': 'CV non disponible pour ce candidat'}, status=404)
            
            response = HttpResponse(document.file.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{candidate.first_name}_{candidate.last_name}_CV.pdf"'
            response['X-Frame-Options'] = 'SAMEORIGIN' 
            
            return response
            
        except Exception as e:
            return JsonResponse({'error': f'Erreur lors de la récupération du CV: {str(e)}'}, status=500)
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
