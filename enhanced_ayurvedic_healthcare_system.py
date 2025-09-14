
# ========================================
# ENHANCED AYURVEDIC HEALTHCARE ML SYSTEM
# Complete Implementation with Multi-Language Support
# ========================================

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import json
from datetime import datetime, timedelta
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from typing import Dict, List, Optional, Union
import warnings
warnings.filterwarnings('ignore')

class EnhancedAyurvedicHealthcareSystem:
    def __init__(self):
        self.dosha_classifier = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_names = []
        self.food_database = {}
        self.recipe_database = {}
        self.user_sessions = {}

        # Initialize databases
        self.init_databases()
        self.load_food_database()
        self.load_recipe_database()

    def init_databases(self):
        '''
        Initialize SQLite databases for user management and patient data
        '''
        # User management database
        self.conn_users = sqlite3.connect('users.db', check_same_thread=False)
        self.conn_users.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        ''')

        # Admin specific fields
        self.conn_users.execute('''
            CREATE TABLE IF NOT EXISTS admin_profiles (
                user_id INTEGER PRIMARY KEY,
                govt_employee_id TEXT UNIQUE,
                job_location TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')

        # Doctor specific fields  
        self.conn_users.execute('''
            CREATE TABLE IF NOT EXISTS doctor_profiles (
                user_id INTEGER PRIMARY KEY,
                license_number TEXT UNIQUE NOT NULL,
                govt_id TEXT,
                hospital_location TEXT,
                practice_years INTEGER,
                specialization TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')

        # Patient specific fields
        self.conn_users.execute('''
            CREATE TABLE IF NOT EXISTS patient_profiles (
                user_id INTEGER PRIMARY KEY,
                emergency_contact TEXT,
                assigned_doctor_id INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (assigned_doctor_id) REFERENCES users (id)
            )
        ''')

        # Patient assessments database
        self.conn_patients = sqlite3.connect('patients.db', check_same_thread=False)
        self.conn_patients.execute('''
            CREATE TABLE IF NOT EXISTS patient_assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                doctor_id INTEGER NOT NULL,
                assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,

                -- Demographics
                age INTEGER,
                gender TEXT,
                height REAL,
                weight REAL,
                bmi REAL,
                occupation TEXT,

                -- Vital Signs
                systolic_bp INTEGER,
                diastolic_bp INTEGER,
                heart_rate INTEGER,
                temperature REAL,
                respiratory_rate INTEGER,
                oxygen_saturation REAL,

                -- Blood Parameters
                fasting_glucose REAL,
                post_meal_glucose REAL,
                total_cholesterol REAL,
                hdl_cholesterol REAL,
                ldl_cholesterol REAL,

                -- Lifestyle
                smoking TEXT,
                alcohol TEXT,
                exercise TEXT,
                sleep_quality TEXT,
                stress_level TEXT,
                caffeine_intake TEXT,

                -- Ayurvedic Assessment
                body_frame TEXT,
                skin_type TEXT,
                hair_type TEXT,
                appetite TEXT,
                digestion TEXT,
                bowel_movements TEXT,
                sleep_pattern TEXT,
                mental_state TEXT,

                -- Results
                diagnosed_dosha TEXT,
                dosha_confidence REAL,
                assessment_notes TEXT,

                FOREIGN KEY (patient_id) REFERENCES users (id),
                FOREIGN KEY (doctor_id) REFERENCES users (id)
            )
        ''')

        # Diet plans database
        self.conn_patients.execute('''
            CREATE TABLE IF NOT EXISTS diet_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                doctor_id INTEGER NOT NULL,
                assessment_id INTEGER NOT NULL,
                plan_type TEXT NOT NULL, -- 'weekly' or 'monthly'
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                start_date DATE,
                end_date DATE,
                plan_data TEXT, -- JSON string
                nutritional_targets TEXT, -- JSON string
                is_active BOOLEAN DEFAULT TRUE,

                FOREIGN KEY (patient_id) REFERENCES users (id),
                FOREIGN KEY (doctor_id) REFERENCES users (id),
                FOREIGN KEY (assessment_id) REFERENCES patient_assessments (id)
            )
        ''')

        self.conn_users.commit()
        self.conn_patients.commit()

    def register_user(self, user_data: Dict, role: str) -> Dict:
        '''
        Register a new user with role-specific information
        '''
        try:
            # Hash password
            password_hash = generate_password_hash(user_data['password'])

            # Insert into users table
            cursor = self.conn_users.cursor()
            cursor.execute('''
                INSERT INTO users (email, password_hash, role, name, phone)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                user_data['email'],
                password_hash,
                role,
                user_data['name'],
                user_data.get('phone', '')
            ))

            user_id = cursor.lastrowid

            # Insert role-specific data
            if role == 'admin':
                cursor.execute('''
                    INSERT INTO admin_profiles (user_id, govt_employee_id, job_location)
                    VALUES (?, ?, ?)
                ''', (
                    user_id,
                    user_data['govt_employee_id'],
                    user_data['job_location']
                ))

            elif role == 'doctor':
                cursor.execute('''
                    INSERT INTO doctor_profiles 
                    (user_id, license_number, govt_id, hospital_location, practice_years, specialization)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    user_id,
                    user_data['license_number'],
                    user_data['govt_id'],
                    user_data['hospital_location'],
                    user_data['practice_years'],
                    user_data.get('specialization', '')
                ))

            elif role == 'patient':
                cursor.execute('''
                    INSERT INTO patient_profiles (user_id, emergency_contact)
                    VALUES (?, ?)
                ''', (
                    user_id,
                    user_data.get('emergency_contact', '')
                ))

            self.conn_users.commit()

            return {
                'success': True,
                'message': f'{role.capitalize()} registered successfully',
                'user_id': user_id
            }

        except Exception as e:
            return {'success': False, 'message': str(e)}

    def authenticate_user(self, email: str, password: str) -> Dict:
        '''
        Authenticate user login
        '''
        try:
            cursor = self.conn_users.cursor()
            cursor.execute('''
                SELECT id, password_hash, role, name FROM users 
                WHERE email = ? AND is_active = TRUE
            ''', (email,))

            user = cursor.fetchone()

            if user and check_password_hash(user[1], password):
                # Generate session token (simplified JWT simulation)
                session_token = self.generate_session_token(user[0], user[2])

                return {
                    'success': True,
                    'user': {
                        'id': user[0],
                        'email': email,
                        'role': user[2],
                        'name': user[3]
                    },
                    'token': session_token
                }
            else:
                return {'success': False, 'message': 'Invalid credentials'}

        except Exception as e:
            return {'success': False, 'message': str(e)}

    def generate_session_token(self, user_id: int, role: str) -> str:
        '''
        Generate a session token for authenticated user
        '''
        payload = {
            'user_id': user_id,
            'role': role,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        # In production, use a proper secret key
        token = jwt.encode(payload, 'secret_key', algorithm='HS256')
        return token

    def create_comprehensive_assessment(self, assessment_data: Dict) -> int:
        '''
        Create a comprehensive patient assessment record
        '''
        try:
            cursor = self.conn_patients.cursor()

            # Calculate BMI
            if assessment_data.get('height') and assessment_data.get('weight'):
                height_m = assessment_data['height'] / 100
                bmi = assessment_data['weight'] / (height_m ** 2)
            else:
                bmi = None

            cursor.execute('''
                INSERT INTO patient_assessments (
                    patient_id, doctor_id, age, gender, height, weight, bmi, occupation,
                    systolic_bp, diastolic_bp, heart_rate, temperature, respiratory_rate, oxygen_saturation,
                    fasting_glucose, post_meal_glucose, total_cholesterol, hdl_cholesterol, ldl_cholesterol,
                    smoking, alcohol, exercise, sleep_quality, stress_level, caffeine_intake,
                    body_frame, skin_type, hair_type, appetite, digestion, bowel_movements, sleep_pattern, mental_state
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                assessment_data['patient_id'],
                assessment_data['doctor_id'],
                assessment_data.get('age'),
                assessment_data.get('gender'),
                assessment_data.get('height'),
                assessment_data.get('weight'),
                bmi,
                assessment_data.get('occupation'),
                assessment_data.get('systolic_bp'),
                assessment_data.get('diastolic_bp'),
                assessment_data.get('heart_rate'),
                assessment_data.get('temperature'),
                assessment_data.get('respiratory_rate'),
                assessment_data.get('oxygen_saturation'),
                assessment_data.get('fasting_glucose'),
                assessment_data.get('post_meal_glucose'),
                assessment_data.get('total_cholesterol'),
                assessment_data.get('hdl_cholesterol'),
                assessment_data.get('ldl_cholesterol'),
                assessment_data.get('smoking'),
                assessment_data.get('alcohol'),
                assessment_data.get('exercise'),
                assessment_data.get('sleep_quality'),
                assessment_data.get('stress_level'),
                assessment_data.get('caffeine_intake'),
                assessment_data.get('body_frame'),
                assessment_data.get('skin_type'),
                assessment_data.get('hair_type'),
                assessment_data.get('appetite'),
                assessment_data.get('digestion'),
                assessment_data.get('bowel_movements'),
                assessment_data.get('sleep_pattern'),
                assessment_data.get('mental_state')
            ))

            assessment_id = cursor.lastrowid
            self.conn_patients.commit()

            return assessment_id

        except Exception as e:
            print(f"Error creating assessment: {e}")
            return None

    def diagnose_dosha_comprehensive(self, assessment_data: Dict) -> Dict:
        '''
        Comprehensive dosha diagnosis using ML model
        '''
        # Enhanced dosha diagnosis algorithm
        scores = {'Vata': 0, 'Pitta': 0, 'Kapha': 0}

        # Physical characteristics scoring
        if assessment_data.get('body_frame') == 'Thin':
            scores['Vata'] += 3
        elif assessment_data.get('body_frame') == 'Medium':
            scores['Pitta'] += 3
        elif assessment_data.get('body_frame') == 'Heavy':
            scores['Kapha'] += 3

        # Skin type scoring
        if assessment_data.get('skin_type') == 'Dry':
            scores['Vata'] += 2
        elif assessment_data.get('skin_type') == 'Oily':
            scores['Pitta'] += 2
        elif assessment_data.get('skin_type') == 'Normal':
            scores['Kapha'] += 2

        # Digestion scoring
        if assessment_data.get('digestion') == 'Quick':
            scores['Vata'] += 2
        elif assessment_data.get('digestion') == 'Strong':
            scores['Pitta'] += 2
        elif assessment_data.get('digestion') == 'Slow':
            scores['Kapha'] += 2

        # Heart rate based classification (research-backed)
        heart_rate = assessment_data.get('heart_rate')
        if heart_rate:
            if heart_rate >= 80:  # Vata: 80-90 bpm
                scores['Vata'] += 2
            elif heart_rate >= 70:  # Pitta: 70-80 bpm
                scores['Pitta'] += 2
            elif heart_rate >= 60:  # Kapha: 60-70 bpm
                scores['Kapha'] += 2

        # Blood pressure considerations
        systolic_bp = assessment_data.get('systolic_bp')
        if systolic_bp:
            if systolic_bp > 140:  # Hypertension - often Pitta/Vata
                scores['Pitta'] += 1
                scores['Vata'] += 1

        # Mental state scoring
        if assessment_data.get('mental_state') == 'Anxious':
            scores['Vata'] += 2
        elif assessment_data.get('mental_state') == 'Irritable':
            scores['Pitta'] += 2
        elif assessment_data.get('mental_state') == 'Calm':
            scores['Kapha'] += 2

        # Sleep pattern scoring
        if assessment_data.get('sleep_pattern') == 'Light sleeper':
            scores['Vata'] += 1
        elif assessment_data.get('sleep_pattern') == 'Sound sleeper':
            scores['Kapha'] += 1

        # Determine dominant dosha
        total_score = sum(scores.values())
        if total_score > 0:
            confidence_scores = {k: v/total_score for k, v in scores.items()}
            dominant_dosha = max(scores, key=scores.get)
        else:
            confidence_scores = {'Vata': 0.33, 'Pitta': 0.33, 'Kapha': 0.34}
            dominant_dosha = 'Vata'  # Default

        return {
            'primary_dosha': dominant_dosha,
            'confidence_scores': confidence_scores,
            'detailed_analysis': self.generate_dosha_analysis(dominant_dosha, confidence_scores)
        }

    def generate_dosha_analysis(self, dosha: str, confidence: Dict) -> str:
        '''
        Generate detailed dosha analysis text
        '''
        analyses = {
            'Vata': "Vata constitution indicates air and space elements dominance. You may experience quick thinking, creativity, and variable energy levels. Focus on warm, nourishing foods and regular routines.",
            'Pitta': "Pitta constitution shows fire and water elements dominance. You likely have strong digestion, focused mind, and natural leadership qualities. Emphasize cooling, calming foods and stress management.",
            'Kapha': "Kapha constitution reflects earth and water elements dominance. You probably have steady energy, strong immunity, and calm nature. Choose light, warming foods and regular exercise."
        }

        analysis = analyses.get(dosha, "Balanced constitution.")

        # Add confidence information
        confidence_text = f" Confidence: {confidence[dosha]:.1%}"

        # Check for dual dosha
        sorted_doshas = sorted(confidence.items(), key=lambda x: x[1], reverse=True)
        if sorted_doshas[0][1] - sorted_doshas[1][1] < 0.2:
            analysis += f" You may also have significant {sorted_doshas[1][0]} characteristics."

        return analysis + confidence_text

    def load_food_database(self):
        '''
        Load comprehensive Indian food database with nutritional information
        '''
        self.food_database = {
            'grains': {
                'basmati_rice': {
                    'name': 'Basmati Rice',
                    'calories_per_100g': 356,
                    'protein': 7.9, 'carbs': 78.2, 'fat': 0.9, 'fiber': 1.3,
                    'dosha_effects': {'vata': 'good', 'pitta': 'good', 'kapha': 'moderate'},
                    'micronutrients': {'iron': 1.5, 'calcium': 23, 'vitamin_b1': 0.4, 'magnesium': 25}
                },
                'brown_rice': {
                    'name': 'Brown Rice',
                    'calories_per_100g': 362,
                    'protein': 7.2, 'carbs': 72.9, 'fat': 2.9, 'fiber': 3.4,
                    'dosha_effects': {'vata': 'good', 'pitta': 'good', 'kapha': 'good'},
                    'micronutrients': {'iron': 2.2, 'calcium': 33, 'vitamin_b1': 0.4, 'magnesium': 44}
                }
            },
            'pulses': {
                'moong_dal': {
                    'name': 'Moong Dal',
                    'calories_per_100g': 347,
                    'protein': 24.5, 'carbs': 56.7, 'fat': 1.2, 'fiber': 16.3,
                    'dosha_effects': {'vata': 'good', 'pitta': 'good', 'kapha': 'good'},
                    'micronutrients': {'iron': 4.4, 'calcium': 124, 'vitamin_b1': 0.5, 'folate': 625}
                },
                'chana_dal': {
                    'name': 'Chana Dal',
                    'calories_per_100g': 335,
                    'protein': 22.5, 'carbs': 57.2, 'fat': 1.5, 'fiber': 12.2,
                    'dosha_effects': {'vata': 'moderate', 'pitta': 'good', 'kapha': 'good'},
                    'micronutrients': {'iron': 3.9, 'calcium': 56, 'phosphorus': 324}
                }
            },
            'vegetables': {
                'spinach': {
                    'name': 'Spinach',
                    'calories_per_100g': 23,
                    'protein': 2.9, 'carbs': 3.6, 'fat': 0.4, 'fiber': 2.2,
                    'dosha_effects': {'vata': 'moderate', 'pitta': 'good', 'kapha': 'good'},
                    'micronutrients': {'iron': 2.7, 'calcium': 99, 'vitamin_a': 469, 'folate': 194}
                },
                'carrots': {
                    'name': 'Carrots',
                    'calories_per_100g': 41,
                    'protein': 0.9, 'carbs': 9.6, 'fat': 0.2, 'fiber': 2.8,
                    'dosha_effects': {'vata': 'good', 'pitta': 'good', 'kapha': 'good'},
                    'micronutrients': {'vitamin_a': 835, 'potassium': 320, 'vitamin_k': 13.2}
                }
            },
            'spices': {
                'turmeric': {
                    'name': 'Turmeric',
                    'calories_per_100g': 312,
                    'protein': 9.7, 'carbs': 67.1, 'fat': 3.2, 'fiber': 22.7,
                    'dosha_effects': {'vata': 'good', 'pitta': 'moderate', 'kapha': 'excellent'},
                    'micronutrients': {'curcumin': 3000, 'iron': 55, 'potassium': 2080}
                },
                'ginger': {
                    'name': 'Ginger',
                    'calories_per_100g': 80,
                    'protein': 1.8, 'carbs': 17.8, 'fat': 0.8, 'fiber': 2.0,
                    'dosha_effects': {'vata': 'good', 'pitta': 'moderate', 'kapha': 'good'},
                    'micronutrients': {'vitamin_c': 5, 'magnesium': 43, 'potassium': 415}
                }
            }
        }

    def load_recipe_database(self):
        '''
        Load comprehensive recipe database with cooking instructions
        '''
        self.recipe_database = {
            'khichdi': {
                'name': 'Khichdi',
                'ingredients': [
                    {'name': 'basmati_rice', 'quantity': 1, 'unit': 'cup'},
                    {'name': 'moong_dal', 'quantity': 0.5, 'unit': 'cup'},
                    {'name': 'turmeric', 'quantity': 0.5, 'unit': 'tsp'},
                    {'name': 'ginger', 'quantity': 1, 'unit': 'inch piece'},
                    {'name': 'ghee', 'quantity': 1, 'unit': 'tbsp'}
                ],
                'instructions': [
                    "Wash rice and dal together until water runs clear",
                    "Heat ghee in pressure cooker",
                    "Add ginger and sauté for 1 minute",
                    "Add rice, dal, turmeric and salt",
                    "Add 4 cups water and pressure cook for 3 whistles",
                    "Let pressure release naturally",
                    "Serve hot with ghee"
                ],
                'cooking_time': 25,
                'difficulty': 'Easy',
                'serves': 4,
                'dosha_suitability': {'vata': 'excellent', 'pitta': 'good', 'kapha': 'good'},
                'nutritional_info': {
                    'calories_per_serving': 280,
                    'protein': 12, 'carbs': 52, 'fat': 4
                }
            },
            'dal_tadka': {
                'name': 'Dal Tadka',
                'ingredients': [
                    {'name': 'moong_dal', 'quantity': 1, 'unit': 'cup'},
                    {'name': 'turmeric', 'quantity': 0.5, 'unit': 'tsp'},
                    {'name': 'ginger', 'quantity': 1, 'unit': 'inch piece'},
                    {'name': 'cumin_seeds', 'quantity': 1, 'unit': 'tsp'}
                ],
                'instructions': [
                    "Wash and cook dal with turmeric until soft",
                    "Heat oil in pan for tadka",
                    "Add cumin seeds and ginger",
                    "Pour over cooked dal",
                    "Garnish with cilantro"
                ],
                'cooking_time': 30,
                'difficulty': 'Medium',
                'serves': 4,
                'dosha_suitability': {'vata': 'good', 'pitta': 'good', 'kapha': 'excellent'},
                'nutritional_info': {
                    'calories_per_serving': 220,
                    'protein': 16, 'carbs': 35, 'fat': 3
                }
            }
        }

    def calculate_nutritional_requirements(self, patient_data: Dict) -> Dict:
        '''
        Calculate daily nutritional requirements based on patient profile
        '''
        age = patient_data.get('age', 30)
        gender = patient_data.get('gender', 'Male')
        weight = patient_data.get('weight', 70)
        height = patient_data.get('height', 170)
        activity_level = patient_data.get('exercise', 'Moderate')

        # Calculate BMR (Basal Metabolic Rate)
        if gender.lower() == 'male':
            bmr = 66 + (13.7 * weight) + (5 * height) - (6.8 * age)
        else:
            bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)

        # Activity multipliers
        activity_multipliers = {
            'None': 1.2,
            '1-2 days/week': 1.375,
            '3-4 days/week': 1.55,
            '5+ days/week': 1.725
        }

        multiplier = activity_multipliers.get(activity_level, 1.55)
        daily_calories = bmr * multiplier

        # Macronutrient distribution
        protein_calories = daily_calories * 0.15  # 15% protein
        carb_calories = daily_calories * 0.60     # 60% carbs
        fat_calories = daily_calories * 0.25      # 25% fat

        # Convert to grams
        protein_grams = protein_calories / 4
        carb_grams = carb_calories / 4
        fat_grams = fat_calories / 9

        # Micronutrients (simplified RDA values)
        micronutrients = {
            'iron': 18 if gender.lower() == 'female' else 10,
            'calcium': 1000,
            'vitamin_c': 65,
            'vitamin_a': 700 if gender.lower() == 'female' else 900,
            'folate': 400,
            'vitamin_d': 15,
            'magnesium': 320 if gender.lower() == 'female' else 420,
            'potassium': 4700
        }

        return {
            'daily_calories': round(daily_calories),
            'macronutrients': {
                'protein': round(protein_grams),
                'carbohydrates': round(carb_grams),
                'fat': round(fat_grams),
                'fiber': 25 if gender.lower() == 'female' else 30
            },
            'micronutrients': micronutrients
        }

    def generate_weekly_diet_plan(self, dosha: str, nutritional_req: Dict, dietary_preferences: Dict = None) -> Dict:
        '''
        Generate a comprehensive weekly diet plan
        '''
        # Base meal plans by dosha
        base_plans = {
            'Vata': {
                'principles': ['Warm foods', 'Regular meals', 'Healthy fats', 'Sweet, sour, salty tastes'],
                'avoid': ['Cold foods', 'Dry foods', 'Irregular eating'],
                'daily_template': {
                    'breakfast': ['Warm oatmeal with ghee and dates', 'Hot cereal with nuts', 'Warm milk with spices'],
                    'lunch': ['Khichdi with vegetables', 'Rice with dal and cooked vegetables', 'Warm soup with bread'],
                    'dinner': ['Light khichdi', 'Vegetable soup', 'Rice with dal'],
                    'snacks': ['Dates and nuts', 'Warm milk', 'Herbal tea with biscuits']
                }
            },
            'Pitta': {
                'principles': ['Cool foods', 'Moderate portions', 'Sweet, bitter, astringent tastes'],
                'avoid': ['Spicy foods', 'Sour foods', 'Excessive heat'],
                'daily_template': {
                    'breakfast': ['Cool porridge with coconut', 'Fresh fruit salad', 'Mild cereals'],
                    'lunch': ['Rice with cooling vegetables', 'Salad with yogurt', 'Light dal with rice'],
                    'dinner': ['Light salad', 'Cooling soups', 'Rice with mild curry'],
                    'snacks': ['Sweet fruits', 'Coconut water', 'Milk-based drinks']
                }
            },
            'Kapha': {
                'principles': ['Light foods', 'Warm spices', 'Pungent, bitter, astringent tastes'],
                'avoid': ['Heavy foods', 'Cold foods', 'Excessive dairy'],
                'daily_template': {
                    'breakfast': ['Herbal tea with light snacks', 'Spiced porridge', 'Fresh fruits'],
                    'lunch': ['Barley with spiced vegetables', 'Light dal with vegetables', 'Quinoa salad'],
                    'dinner': ['Vegetable soup', 'Light curry with millet', 'Herbal tea'],
                    'snacks': ['Spiced tea', 'Light crackers', 'Ginger preparations']
                }
            }
        }

        plan = base_plans.get(dosha, base_plans['Vata'])

        # Generate 7-day plan
        weekly_plan = {}
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

        for i, day in enumerate(days):
            daily_plan = {}
            for meal, options in plan['daily_template'].items():
                # Rotate through options
                daily_plan[meal] = options[i % len(options)]

            weekly_plan[day] = daily_plan

        # Calculate approximate nutrition for the week
        daily_nutrition = {
            'calories': nutritional_req['daily_calories'],
            'protein': nutritional_req['macronutrients']['protein'],
            'carbs': nutritional_req['macronutrients']['carbohydrates'],
            'fat': nutritional_req['macronutrients']['fat']
        }

        return {
            'dosha': dosha,
            'principles': plan['principles'],
            'foods_to_avoid': plan['avoid'],
            'weekly_meals': weekly_plan,
            'daily_nutritional_targets': daily_nutrition,
            'shopping_list': self.generate_shopping_list(weekly_plan),
            'cooking_tips': self.get_dosha_cooking_tips(dosha)
        }

    def generate_shopping_list(self, weekly_plan: Dict) -> List[str]:
        '''
        Generate shopping list from weekly meal plan
        '''
        # Simplified shopping list generation
        base_ingredients = {
            'Grains': ['Rice', 'Oats', 'Quinoa', 'Barley'],
            'Pulses': ['Moong dal', 'Chana dal', 'Masoor dal'],
            'Vegetables': ['Carrots', 'Spinach', 'Tomatoes', 'Onions'],
            'Spices': ['Turmeric', 'Ginger', 'Cumin', 'Coriander'],
            'Others': ['Ghee', 'Oil', 'Salt', 'Jaggery']
        }

        shopping_list = []
        for category, items in base_ingredients.items():
            shopping_list.extend([f"{item} (1 week supply)" for item in items])

        return shopping_list

    def get_dosha_cooking_tips(self, dosha: str) -> List[str]:
        '''
        Get dosha-specific cooking tips
        '''
        tips = {
            'Vata': [
                'Cook with warming spices like ginger and cinnamon',
                'Use adequate oil or ghee in cooking',
                'Prefer steaming and sautéing over raw preparations',
                'Eat meals warm and at regular times'
            ],
            'Pitta': [
                'Use cooling spices like coriander and fennel',
                'Avoid excessive heating and frying',
                'Include fresh herbs like cilantro and mint',
                'Cook with coconut oil or moderate ghee'
            ],
            'Kapha': [
                'Use warming spices like black pepper and mustard seeds',
                'Minimize oil and heavy ingredients',
                'Prefer baking, roasting, and steaming',
                'Include plenty of vegetables and light proteins'
            ]
        }

        return tips.get(dosha, tips['Vata'])

    def generate_professional_report(self, patient_id: int, assessment_id: int, doctor_id: int) -> Dict:
        '''
        Generate comprehensive professional medical report
        '''
        try:
            # Get patient details
            cursor = self.conn_users.cursor()
            cursor.execute('''
                SELECT u.name, u.email, u.phone, pp.emergency_contact
                FROM users u
                JOIN patient_profiles pp ON u.id = pp.user_id
                WHERE u.id = ?
            ''', (patient_id,))
            patient_info = cursor.fetchone()

            # Get doctor details
            cursor.execute('''
                SELECT u.name, u.email, dp.license_number, dp.hospital_location, dp.specialization
                FROM users u
                JOIN doctor_profiles dp ON u.id = dp.user_id
                WHERE u.id = ?
            ''', (doctor_id,))
            doctor_info = cursor.fetchone()

            # Get assessment details
            cursor = self.conn_patients.cursor()
            cursor.execute('''
                SELECT * FROM patient_assessments WHERE id = ?
            ''', (assessment_id,))
            assessment = cursor.fetchone()

            if not all([patient_info, doctor_info, assessment]):
                return {'error': 'Required data not found'}

            # Generate report
            report = {
                'report_id': f"AYU-{assessment_id}-{datetime.now().strftime('%Y%m%d')}",
                'generated_date': datetime.now().strftime('%B %d, %Y'),
                'patient_details': {
                    'name': patient_info[0],
                    'email': patient_info[1],
                    'phone': patient_info[2],
                    'emergency_contact': patient_info[3]
                },
                'doctor_details': {
                    'name': doctor_info[0],
                    'license': doctor_info[2],
                    'hospital': doctor_info[3],
                    'specialization': doctor_info[4],
                    'email': doctor_info[1]
                },
                'assessment_summary': {
                    'age': assessment[3],
                    'gender': assessment[4],
                    'bmi': round(assessment[7], 1) if assessment[7] else 'N/A',
                    'blood_pressure': f"{assessment[9]}/{assessment[10]}" if assessment[9] and assessment[10] else 'N/A',
                    'heart_rate': f"{assessment[11]} bpm" if assessment[11] else 'N/A',
                    'diagnosed_dosha': assessment[33] or 'Assessment Pending'
                },
                'recommendations': 'Follow prescribed Ayurvedic diet plan and lifestyle recommendations.',
                'next_followup': (datetime.now() + timedelta(days=30)).strftime('%B %d, %Y')
            }

            return report

        except Exception as e:
            return {'error': str(e)}

    def get_patient_progress(self, patient_id: int) -> Dict:
        '''
        Get patient progress data for tracking
        '''
        cursor = self.conn_patients.cursor()
        cursor.execute('''
            SELECT assessment_date, weight, systolic_bp, diastolic_bp, heart_rate
            FROM patient_assessments 
            WHERE patient_id = ? 
            ORDER BY assessment_date
        ''', (patient_id,))

        assessments = cursor.fetchall()

        if not assessments:
            return {'message': 'No assessment history found'}

        # Format progress data
        progress = {
            'dates': [row[0] for row in assessments],
            'weight': [row[1] for row in assessments if row[1]],
            'systolic_bp': [row[2] for row in assessments if row[2]],
            'diastolic_bp': [row[3] for row in assessments if row[3]],
            'heart_rate': [row[4] for row in assessments if row[4]]
        }

        return progress

# Multi-language Support System
class MultiLanguageSupport:
    def __init__(self):
        self.translations = {
            'english': {
                'dashboard': 'Dashboard',
                'patient_assessment': 'Patient Assessment',
                'diet_plan': 'Diet Plan',
                'weekly_plan': 'Weekly Plan',
                'monthly_plan': 'Monthly Plan',
                'blood_pressure': 'Blood Pressure',
                'heart_rate': 'Heart Rate',
                'dosha_diagnosis': 'Dosha Diagnosis',
                'nutritional_requirements': 'Nutritional Requirements',
                'recipe_instructions': 'Recipe Instructions'
            },
            'hindi': {
                'dashboard': 'डैशबोर्ड',
                'patient_assessment': 'रोगी मूल्यांकन', 
                'diet_plan': 'आहार योजना',
                'weekly_plan': 'साप्ताहिक योजना',
                'monthly_plan': 'मासिक योजना',
                'blood_pressure': 'रक्तचाप',
                'heart_rate': 'हृदय गति',
                'dosha_diagnosis': 'दोष निदान',
                'nutritional_requirements': 'पोषण आवश्यकताएं',
                'recipe_instructions': 'व्यंजन विधि'
            }
        }

    def translate(self, text: str, language: str = 'english') -> str:
        '''
        Translate text to specified language
        '''
        return self.translations.get(language, {}).get(text, text)

    def get_supported_languages(self) -> List[str]:
        '''
        Get list of supported languages
        '''
        return list(self.translations.keys())

# Usage Example
def main():
    # Initialize the enhanced system
    ayurvedic_system = EnhancedAyurvedicHealthcareSystem()
    language_support = MultiLanguageSupport()

    print("=== ENHANCED AYURVEDIC HEALTHCARE MANAGEMENT SYSTEM ===")

    # Example: Register a doctor
    doctor_data = {
        'email': 'dr.sharma@hospital.com',
        'password': 'secure_password',
        'name': 'Dr. Rajesh Sharma',
        'phone': '9876543210',
        'license_number': 'MED123456',
        'govt_id': 'GOVT789',
        'hospital_location': 'Delhi AIIMS',
        'practice_years': 15,
        'specialization': 'Ayurvedic Medicine'
    }

    doctor_registration = ayurvedic_system.register_user(doctor_data, 'doctor')
    print(f"Doctor Registration: {doctor_registration}")

    # Example: Register a patient
    patient_data = {
        'email': 'patient@email.com',
        'password': 'patient_password',
        'name': 'Priya Patel',
        'phone': '9876543211',
        'emergency_contact': '9876543212'
    }

    patient_registration = ayurvedic_system.register_user(patient_data, 'patient')
    print(f"Patient Registration: {patient_registration}")

    # Example comprehensive assessment
    sample_assessment = {
        'patient_id': patient_registration.get('user_id', 1),
        'doctor_id': doctor_registration.get('user_id', 1),
        'age': 32,
        'gender': 'Female',
        'height': 165,
        'weight': 58,
        'systolic_bp': 120,
        'diastolic_bp': 80,
        'heart_rate': 72,
        'temperature': 98.6,
        'body_frame': 'Medium',
        'skin_type': 'Normal',
        'digestion': 'Strong',
        'mental_state': 'Calm',
        'exercise': '3-4 days/week',
        'stress_level': 'Low'
    }

    # Create assessment
    assessment_id = ayurvedic_system.create_comprehensive_assessment(sample_assessment)
    print(f"Assessment Created: ID {assessment_id}")

    # Diagnose dosha
    dosha_diagnosis = ayurvedic_system.diagnose_dosha_comprehensive(sample_assessment)
    print(f"Dosha Diagnosis: {dosha_diagnosis}")

    # Calculate nutritional requirements
    nutrition_req = ayurvedic_system.calculate_nutritional_requirements(sample_assessment)
    print(f"Daily Calorie Requirement: {nutrition_req['daily_calories']}")

    # Generate weekly diet plan
    diet_plan = ayurvedic_system.generate_weekly_diet_plan(
        dosha_diagnosis['primary_dosha'], 
        nutrition_req
    )

    print("\nWeekly Diet Plan Generated:")
    for day, meals in diet_plan['weekly_meals'].items():
        print(f"{day}: Breakfast - {meals['breakfast']}")

    # Generate professional report
    if assessment_id:
        report = ayurvedic_system.generate_professional_report(
            patient_registration.get('user_id', 1),
            assessment_id,
            doctor_registration.get('user_id', 1)
        )
        print(f"\nProfessional Report Generated: {report.get('report_id')}")

    # Multi-language example
    print(f"\nEnglish: {language_support.translate('dashboard', 'english')}")
    print(f"Hindi: {language_support.translate('dashboard', 'hindi')}")

if __name__ == "__main__":
    main()
