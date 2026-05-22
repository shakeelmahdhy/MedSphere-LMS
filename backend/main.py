from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
import os
import datetime
import shutil
from sqlalchemy.orm import Session, joinedload

import models, schemas, auth, database
from database import engine

def create_notification(db: Session, user_id: int, title: str, message: str):
    notification = models.Notification(user_id=user_id, title=title, message=message)
    db.add(notification)
    # Caller should commit

# Create tables
models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="E-Learning API")

@app.on_event("startup")
def create_default_channel():
    db = database.SessionLocal()
    try:
        if db.query(models.Channel).count() == 0:
            general_channel = models.Channel(name="General", description="General discussion for all members")
            db.add(general_channel)
            db.commit()
    finally:
        db.close()

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"DEBUG: Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Static Files for Uploads
UPLOAD_DIR = "uploads"
PROFILE_PIX_DIR = os.path.join(UPLOAD_DIR, "profile_pictures")
COURSE_CONTENT_DIR = os.path.join(UPLOAD_DIR, "course_content")
os.makedirs(PROFILE_PIX_DIR, exist_ok=True)
os.makedirs(COURSE_CONTENT_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/favicon.ico")
def favicon():
    return "" # Or return a 204 No Content

# ==================== AUTH ROUTES ====================

@app.post("/api/auth/register")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    print(f"DEBUG: Registering user: {user.dict()}")
    try:
        # Check if user already exists
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = auth.get_password_hash(user.password)
        
        # Create new user
        new_user = models.User(
            name=user.name,
            email=user.email,
            password_hash=hashed_password,
            role=user.role,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {
            "success": True, 
            "message": "User registered successfully", 
            "user": new_user
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: schemas.LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ID or password does not exist",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/api/auth/logout")
def logout():
    return {"success": True}

@app.get("/api/auth/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@app.put("/api/auth/me", response_model=schemas.User)
def update_profile(
    user_data: schemas.UserUpdate, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(current_user, key, value)
    
    db.commit()

    db.refresh(current_user)
    return current_user

@app.post("/api/auth/change-password")
def change_password(
    data: schemas.ChangePasswordRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if not auth.verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.password_hash = auth.get_password_hash(data.new_password)
    db.commit()
    return {"success": True}

@app.get("/api/auth/admin-exists")
def check_admin_exists(db: Session = Depends(database.get_db)):
    admin = db.query(models.User).filter(models.User.role == "admin").first()
    return {"exists": admin is not None}

# ==================== COURSE MANAGEMENT ====================

@app.get("/api/courses", response_model=List[schemas.Course])
def get_courses(status: Optional[str] = None, db: Session = Depends(database.get_db)):
    query = db.query(models.Course).options(joinedload(models.Course.instructor))
    if status:
        query = query.filter(models.Course.status == status)
    return query.all()

@app.get("/api/courses/{course_id}", response_model=schemas.Course)
def get_course(course_id: int, db: Session = Depends(database.get_db)):
    course = db.query(models.Course).options(joinedload(models.Course.instructor)).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.post("/api/courses", response_model=schemas.Course)
def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    new_course = models.Course(
        title=course.title,
        description=course.description,
        price=course.price,
        type=course.type,
        category=course.category,
        status="published",
        duration=course.duration,
        thumbnail_url=course.thumbnail_url,
        instructor_id=admin.id
    )
    db.add(new_course)
    db.flush() # Get ID for relationships

    # Add Contents
    for i, content in enumerate(course.contents):
        new_content = models.CourseContent(
            course_id=new_course.id,
            title=content.title,
            content_type=content.content_type,
            url=content.url,
            order=content.order or i
        )
        db.add(new_content)

    # Add Quizzes
    for quiz in course.quizzes:
        new_quiz = models.Quiz(course_id=new_course.id, title=quiz.title)
        db.add(new_quiz)
        db.flush()
        
        for question in quiz.questions:
            new_q = models.QuizQuestion(quiz_id=new_quiz.id, question_text=question.question_text)
            db.add(new_q)
            db.flush()
            
            for option in question.options:
                new_opt = models.QuizOption(
                    question_id=new_q.id,
                    option_text=option.option_text,
                    is_correct=option.is_correct
                )
                db.add(new_opt)

    db.commit()
    db.refresh(new_course)
    return new_course

@app.put("/api/courses/{course_id}", response_model=schemas.Course)
def update_course(
    course_id: int,
    course_data: schemas.CourseUpdate,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for key, value in course_data.dict(exclude_unset=True).items():
        if key not in ["contents", "quizzes"]:
            setattr(db_course, key, value)
    
    db.commit()
    db.refresh(db_course)
    return db_course

@app.delete("/api/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(db_course)
    db.commit()
    return {"success": True}

@app.post("/api/courses/{course_id}/buy")
def buy_course(course_id: int, db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    
    existing = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == user.id,
        models.Enrollment.course_id == course_id
    ).first()
    
    if existing:
        existing.payment_status = "paid"
    else:
        new_enrollment = models.Enrollment(
            user_id=user.id,
            course_id=course_id,
            payment_status="paid"
        )
        db.add(new_enrollment)
    
    # Auto-assign task
    new_task = models.Schedule(
        user_id=user.id,
        title=f"Complete Course: {course.title}",
        description=f"You have enrolled in {course.title}. Please complete all contents and quizzes.",
        start_time=datetime.datetime.now() + datetime.timedelta(days=7),
        type="assignment"
    )
    db.add(new_task)
    create_notification(db, user.id, "New Task Assigned", f"Auto-assigned: Complete {course.title}")
    
    db.commit()
    return {"success": True}

@app.get("/api/enrollments/course/{course_id}")
def get_enrollment(course_id: int, db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    print(f"DEBUG: get_enrollment called for course {course_id} by {user.email}")
    enrollment = db.query(models.Enrollment).options(joinedload(models.Enrollment.completed_contents)).filter(
        models.Enrollment.user_id == user.id,
        models.Enrollment.course_id == course_id
    ).first()
    return enrollment

@app.post("/api/enrollments/{enrollment_id}/complete-content/{content_id}")
def complete_course_content(enrollment_id: int, content_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id, models.Enrollment.user_id == current_user.id).first()
    if not enrollment: raise HTTPException(status_code=404, detail="Enrollment not found")

    # Check if already completed
    existing = db.query(models.CompletedContent).filter(
        models.CompletedContent.enrollment_id == enrollment_id,
        models.CompletedContent.content_id == content_id
    ).first()

    if not existing:
        new_complete = models.CompletedContent(enrollment_id=enrollment_id, content_id=content_id)
        db.add(new_complete)
        db.flush() 

    # Recalculate Progress
    course = enrollment.course
    total_contents = len(course.contents)
    total_quizzes = len(course.quizzes)
    total_items = total_contents + total_quizzes

    if total_items == 0:
        enrollment.progress = 100.0
    else:
        completed_contents_count = db.query(models.CompletedContent).filter(models.CompletedContent.enrollment_id == enrollment_id).count()
        
        # Count unique passed quizzes
        passed_quizzes_count = db.query(models.QuizAttempt).filter(
            models.QuizAttempt.user_id == current_user.id,
            models.QuizAttempt.quiz_id.in_([q.id for q in course.quizzes]),
            models.QuizAttempt.passed == True
        ).distinct(models.QuizAttempt.quiz_id).count()

        enrollment.progress = min(round(((completed_contents_count + passed_quizzes_count) / total_items) * 100, 2), 100.0)
    
    if enrollment.progress >= 100:
        enrollment.status = "completed"
        enrollment.completed_at = datetime.datetime.now()
    
    db.commit()
    return {"success": True, "progress": enrollment.progress}

@app.post("/api/courses/{course_id}/publish")
def publish_course(course_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    course.status = "published"
    db.commit()
    return {"success": True}

@app.post("/api/courses/{course_id}/archive")
def archive_course(course_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course: raise HTTPException(status_code=404, detail="Course not found")
    course.status = "archived"
    db.commit()
    return {"success": True}

@app.post("/api/courses/{course_id}/enroll")
def enroll_users(
    course_id: int,
    data: dict, # {"user_ids": [], "due_date": ""}
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    user_ids = data.get("user_ids", [])
    due_date_str = data.get("due_date")
    due_date = datetime.datetime.fromisoformat(due_date_str) if due_date_str else None
    
    for user_id in user_ids:
        existing = db.query(models.Enrollment).filter(
            models.Enrollment.user_id == user_id,
            models.Enrollment.course_id == course_id
        ).first()
        if not existing:
            new_enroll = models.Enrollment(user_id=user_id, course_id=course_id, due_date=due_date)
            db.add(new_enroll)
            
            # Auto-assign task
            course = db.query(models.Course).filter(models.Course.id == course_id).first()
            new_task = models.Schedule(
                user_id=user_id,
                title=f"Complete Course: {course.title if course else 'New Course'}",
                description=f"Admin assigned you to {course.title if course else 'a course'}. Please complete it.",
                start_time=due_date if due_date else datetime.datetime.now() + datetime.timedelta(days=7),
                type="assignment"
            )
            db.add(new_task)
            create_notification(db, user_id, "New Course Assigned", f"You have been assigned to: {course.title if course else 'a new course'}")
    
    db.commit()
    return {"success": True}

@app.post("/api/courses/{course_id}/withdraw")
def withdraw_users(
    course_id: int,
    data: dict,
    db: Session = Depends(database.get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    user_ids = data.get("user_ids", [])
    db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id,
        models.Enrollment.user_id.in_(user_ids)
    ).delete(synchronize_session=False)
    db.commit()
    return {"success": True}

@app.get("/api/courses/{course_id}/enrollments")
def get_course_enrollments(course_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    return db.query(models.Enrollment).filter(models.Enrollment.course_id == course_id).all()

# ==================== USER / LEARNER ROUTES ====================

@app.get("/api/users/me/courses", response_model=List[schemas.Enrollment])
def get_my_courses(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    return db.query(models.Enrollment).filter(models.Enrollment.user_id == user.id).all()

@app.get("/api/users/me/courses/{course_id}/progress")
def get_course_progress(course_id: int, db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == user.id,
        models.Enrollment.course_id == course_id
    ).first()
    if not enrollment: raise HTTPException(status_code=404, detail="Not enrolled")
    return enrollment

@app.get("/api/users/me/certificates")
def get_my_certificates_me(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    return db.query(models.Certificate).options(
        joinedload(models.Certificate.user),
        joinedload(models.Certificate.course)
    ).filter(models.Certificate.user_id == user.id).all()


@app.get("/api/users/me/dashboard")
def get_user_dashboard(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.user_id == user.id).all()
    certificates = db.query(models.Certificate).filter(models.Certificate.user_id == user.id).count()
    
    in_progress = [e for e in enrollments if e.status == "enrolled"]
    completed = [e for e in enrollments if e.status == "completed"]
    
    return {
        "courses_in_progress": len(in_progress),
        "certificates_earned": certificates,
        "recent_courses": enrollments[:5],
        "notifications": db.query(models.Notification).filter(models.Notification.user_id == user.id).limit(5).all()
    }

@app.get("/api/learner/analytics", response_model=schemas.LearnerAnalytics)
def get_learner_analytics(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.user_id == user.id).all()
    completed = [e for e in enrollments if e.status == "completed"]
    rate = (len(completed) / len(enrollments) * 100) if enrollments else 0
    return {
        "courses_in_progress": len(enrollments) - len(completed),
        "certificates_earned": len(completed),
        "learning_hours": 12.5, # Mock
        "completion_rate": rate
    }

# ==================== ADMIN ROUTES ====================

@app.get("/api/admin/team-learning-stats/{team_id}")
def get_team_courses(team_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team: return []
    
    member_ids = [m.id for m in team.members]
    if not member_ids: return []
    
    # Get all unique courses enrolled by team members
    enrollments = db.query(models.Enrollment).options(joinedload(models.Enrollment.course)).filter(
        models.Enrollment.user_id.in_(member_ids)
    ).all()
    
    courses_dict = {}
    for e in enrollments:
        if not e.course: continue
        if e.course.id not in courses_dict:
            courses_dict[e.course.id] = {
                "id": e.course.id,
                "title": e.course.title,
                "thumbnail_url": e.course.thumbnail_url,
                "category": e.course.category,
                "enrollment_count": 0,
                "completion_count": 0
            }
        courses_dict[e.course.id]["enrollment_count"] += 1
        if e.status == "completed":
            courses_dict[e.course.id]["completion_count"] += 1
            
    return list(courses_dict.values())

@app.get("/api/admin/users", response_model=List[schemas.User])
def get_admin_users(status: Optional[str] = None, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    print(f"DEBUG: get_admin_users called by {admin.email}")
    try:
        query = db.query(models.User)
        if status == "active": query = query.filter(models.User.is_active == True)
        elif status == "inactive": query = query.filter(models.User.is_active == False)
        users = query.all()
        print(f"DEBUG: Found {len(users)} users")
        return users
    except Exception as e:
        print(f"Error in get_admin_users: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/users/{user_id}", response_model=schemas.User)
def get_admin_user(user_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/admin/users")
def admin_create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user: raise HTTPException(status_code=400, detail="Email exists")
    new_user = models.User(name=user.name, email=user.email, password_hash=auth.get_password_hash(user.password), role=user.role)
    db.add(new_user)
    db.commit()
    return {"success": True}

@app.put("/api/admin/users/{user_id}")
def admin_update_user(user_id: int, data: schemas.UserUpdate, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    return {"success": True}

@app.delete("/api/admin/users/{user_id}")
def delete_admin_user(user_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    
    # Delete associated data
    db.query(models.Enrollment).filter(models.Enrollment.user_id == user_id).delete()
    db.query(models.Notification).filter(models.Notification.user_id == user_id).delete()
    
    db.delete(user)
    db.commit()
    return {"success": True}

@app.post("/api/admin/users/bulk-assign-course")
def bulk_assign_course(data: schemas.BulkAssignCourseRequest, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    course = db.query(models.Course).filter(models.Course.id == data.course_id).first()
    for user_id in data.user_ids:
        existing = db.query(models.Enrollment).filter(models.Enrollment.user_id == user_id, models.Enrollment.course_id == data.course_id).first()
        if not existing:
            db.add(models.Enrollment(user_id=user_id, course_id=data.course_id, due_date=data.due_date))
            create_notification(db, user_id, "New Course Assigned", f"You have been assigned to: {course.title if course else 'a new course'}")
    db.commit()
    return {"success": True}

@app.post("/api/admin/users/bulk-assign-group")
def bulk_assign_group(data: schemas.BulkAssignGroupRequest, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    db.query(models.User).filter(models.User.id.in_(data.user_ids)).update({models.User.group_id: data.group_id}, synchronize_session=False)
    db.commit()
    return {"success": True}

@app.get("/api/admin/groups", response_model=List[schemas.Group])
def get_admin_groups(db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    return db.query(models.Group).all()

@app.post("/api/admin/groups", response_model=schemas.Group)
def create_admin_group(group: schemas.GroupCreate, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    new_group = models.Group(**group.dict())
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group

@app.get("/api/admin/test-stats")
def test_stats():
    return {"status": "ok"}

@app.get("/api/admin/teams", response_model=List[schemas.Team])
def get_admin_teams(db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    return db.query(models.Team).options(
        joinedload(models.Team.admin),
        joinedload(models.Team.members)
    ).all()

@app.post("/api/admin/teams", response_model=schemas.Team)
def create_admin_team(team: schemas.TeamCreate, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    new_team = models.Team(**team.dict())
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    return new_team

@app.put("/api/admin/teams/{team_id}", response_model=schemas.Team)
def update_admin_team(team_id: int, team_data: schemas.TeamCreate, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team: raise HTTPException(status_code=404, detail="Team not found")
    
    for key, value in team_data.dict().items():
        setattr(team, key, value)
    
    db.commit()
    db.refresh(team)
    return team

@app.delete("/api/admin/teams/{team_id}")
def delete_admin_team(team_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team: raise HTTPException(status_code=404, detail="Team not found")
    
    db.delete(team)
    db.commit()
    return {"success": True}
@app.post("/api/admin/teams/{team_id}/members")
def add_team_member(team_id: int, data: dict, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team: raise HTTPException(status_code=404, detail="Team not found")
    
    user_id = data.get("user_id")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    
    if user not in team.members:
        team.members.append(user)
        create_notification(db, user_id, "Added to Team", f"You have been added to team: {team.name}")
        db.commit()
    return {"success": True}

@app.delete("/api/admin/teams/{team_id}/members/{user_id}")
def remove_team_member(team_id: int, user_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if not team: raise HTTPException(status_code=404, detail="Team not found")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    
    if user in team.members:
        team.members.remove(user)
        db.commit()
    
    return {"success": True}

@app.get("/api/admin/roles", response_model=List[schemas.Role])
def get_admin_roles(db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    return db.query(models.Role).all()

@app.post("/api/admin/roles", response_model=schemas.Role)
def create_admin_role(role: schemas.RoleCreate, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    new_role = models.Role(**role.dict())
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

@app.put("/api/admin/roles/{role_id}", response_model=schemas.Role)
def update_admin_role(role_id: int, role_data: schemas.RoleCreate, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role: raise HTTPException(status_code=404, detail="Role not found")
    
    for key, value in role_data.dict().items():
        setattr(role, key, value)
    
    db.commit()
    db.refresh(role)
    return role

@app.delete("/api/admin/roles/{role_id}")
def delete_admin_role(role_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role: raise HTTPException(status_code=404, detail="Role not found")
    
    db.delete(role)
    db.commit()
    return {"success": True}

@app.get("/api/admin/analytics/dashboard", response_model=schemas.AnalyticsDashboard)
def get_admin_analytics(db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    try:
        total_users = db.query(models.User).count()
        active_learners = db.query(models.User).filter(models.User.role == "learner", models.User.is_active == True).count()
        total_enr = db.query(models.Enrollment).count()
        comp_enr = db.query(models.Enrollment).filter(models.Enrollment.status == "completed").count()
        rate = (comp_enr / total_enr * 100) if total_enr > 0 else 0
        
        # Enrollment Trends (Last 7 days)
        trends = []
        for i in range(6, -1, -1):
            target_date = (datetime.datetime.now() - datetime.timedelta(days=i)).date()
            date_str = target_date.strftime("%Y-%m-%d")
            count = db.query(models.Enrollment).filter(func.date(models.Enrollment.enrolled_at) == date_str).count()
            trends.append({"date": date_str, "count": count})
            
        # Course Popularity
        popularity = []
        courses = db.query(models.Course).all()
        for course in courses:
            count = db.query(models.Enrollment).filter(models.Enrollment.course_id == course.id).count()
            popularity.append({"title": course.title, "enrollments": count})
        popularity = sorted(popularity, key=lambda x: x["enrollments"], reverse=True)[:5]
        
        # User Distribution
        distribution = [
            {"role": "learner", "count": db.query(models.User).filter(models.User.role == "learner").count()},
            {"role": "admin", "count": db.query(models.User).filter(models.User.role == "admin").count()},
        ]
        
        # Dynamic Recent Activity
        activities = []
        
        # 1. New Users
        new_users = db.query(models.User).order_by(models.User.created_at.desc()).limit(5).all()
        for u in new_users:
            activities.append({
                "action": "User Registered",
                "details": f"{u.name} joined as {u.role}",
                "time": u.created_at.strftime("%b %d, %H:%M"),
                "icon": "UserPlus",
                "color": "bg-green-100 text-green-600",
                "timestamp": u.created_at
            })
            
        # 2. New Courses
        new_courses = db.query(models.Course).order_by(models.Course.created_at.desc()).limit(5).all()
        for c in new_courses:
            activities.append({
                "action": "Course Created",
                "details": f"'{c.title}' was added",
                "time": c.created_at.strftime("%b %d, %H:%M"),
                "icon": "BookOpen",
                "color": "bg-blue-100 text-blue-600",
                "timestamp": c.created_at
            })
            
        # 3. New Enrollments
        new_enrolls = db.query(models.Enrollment).options(joinedload(models.Enrollment.user), joinedload(models.Enrollment.course)).order_by(models.Enrollment.enrolled_at.desc()).limit(5).all()
        for e in new_enrolls:
            if e.user and e.course:
                activities.append({
                    "action": "Learner Enrolled",
                    "details": f"{e.user.name} started '{e.course.title}'",
                    "time": e.enrolled_at.strftime("%b %d, %H:%M"),
                    "icon": "Activity",
                    "color": "bg-purple-100 text-purple-600",
                    "timestamp": e.enrolled_at
                })

        # 4. New Schedules/Tasks
        new_schedules = db.query(models.Schedule).order_by(models.Schedule.id.desc()).limit(5).all()
        for s in new_schedules:
            activities.append({
                "action": "Task Scheduled",
                "details": s.title,
                "time": "Recently",
                "icon": "Clock",
                "color": "bg-orange-100 text-orange-600",
                "timestamp": datetime.datetime.now() # Fallback if no created_at
            })

        # Sort all by timestamp
        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        # Remove timestamp before returning
        for a in activities: a.pop("timestamp", None)
        
        # Recent Completions
        recent_completions = []
        completions = db.query(models.Enrollment).options(joinedload(models.Enrollment.user), joinedload(models.Enrollment.course)).filter(models.Enrollment.status == "completed").order_by(models.Enrollment.completed_at.desc()).limit(5).all()
        for e in completions:
            if e.user and e.course:
                recent_completions.append({
                    "user_name": e.user.name,
                    "course_title": e.course.title,
                    "date": e.completed_at.strftime("%Y-%m-%d") if e.completed_at else "Recently"
                })
        
        # Average Quiz Score
        avg_score = db.query(func.avg(models.QuizAttempt.score)).scalar() or 0
        
        return {
            "total_users": total_users,
            "active_learners": active_learners,
            "course_completion_rate": rate,
            "avg_quiz_score": round(float(avg_score), 1),
            "enrollment_trends": trends,
            "course_popularity": popularity,
            "user_distribution": distribution,
            "recent_activity": activities[:10],
            "recent_completions": recent_completions
        }
    except Exception as e:
        print(f"ERROR in get_admin_analytics: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learner/analytics", response_model=schemas.LearnerAnalytics)
def get_learner_analytics(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    courses_in_progress = db.query(models.Enrollment).filter(models.Enrollment.user_id == current_user.id, models.Enrollment.status == "in-progress").count()
    certificates_earned = db.query(models.Certificate).filter(models.Certificate.user_id == current_user.id).count()
    # Mock data for hours/rate for now
    return {
        "courses_in_progress": courses_in_progress,
        "certificates_earned": certificates_earned,
        "learning_hours": 15.4,
        "completion_rate": 78.0
    }
@app.get("/api/users/me/dashboard", response_model=schemas.UserDashboard)
def get_user_dashboard(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # 1. Continue Learning (Enrollments in progress)
    enrollments = db.query(models.Enrollment).options(joinedload(models.Enrollment.course)).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.payment_status == "paid"
    ).all()
    
    continue_learning = []
    for e in enrollments:
        if e.progress < 100:
            continue_learning.append({
                "id": e.course.id,
                "title": e.course.title,
                "instructor": "Lead Instructor",
                "progress": e.progress,
                "timeLeft": "4 hours left", # Dummy calculation
                "color": "blue" if e.id % 3 == 0 else "green" if e.id % 3 == 1 else "purple"
            })
            
    # 2. Recent Activities
    recent_activities = []
    # Recently Enrolled
    latest_enrolls = sorted(enrollments, key=lambda x: x.enrolled_at, reverse=True)[:3]
    for e in latest_enrolls:
        recent_activities.append({
            "title": f"Enrolled in {e.course.title}",
            "description": "Start learning today!",
            "time": "Recently",
            "icon": "PlayCircle",
            "iconColor": "text-blue-600",
            "iconBg": "bg-blue-50",
            "link": f"/dashboard/courses/{e.course.id}"
        })
        
    # Completed Courses
    completions = [e for e in enrollments if e.status == "completed"]
    for e in completions:
        recent_activities.append({
            "title": f"Completed {e.course.title}",
            "description": "Certificate earned!",
            "time": "Recently",
            "icon": "Award",
            "iconColor": "text-green-600",
            "iconBg": "bg-green-50",
            "link": "/dashboard/certificates",
            "timestamp": e.completed_at or e.enrolled_at
        })

    # 3. New Messages
    recent_msgs = db.query(models.Message).options(joinedload(models.Message.sender)).filter(
        models.Message.receiver_id == current_user.id
    ).order_by(models.Message.timestamp.desc()).limit(3).all()
    
    for m in recent_msgs:
        recent_activities.append({
            "title": f"Message from {m.sender.name}",
            "description": m.content[:50] + ("..." if len(m.content) > 50 else ""),
            "time": "New",
            "icon": "PlayCircle", # fallback icon
            "iconColor": "text-purple-600",
            "iconBg": "bg-purple-50",
            "link": "/dashboard/messages",
            "timestamp": m.timestamp
        })

    # 4. Community Activity
    user_channels = db.query(models.Channel).filter(models.Channel.members.any(models.User.id == current_user.id)).all()
    channel_ids = [c.id for c in user_channels]
    if channel_ids:
        recent_community = db.query(models.ChannelMessage).options(joinedload(models.ChannelMessage.sender)).filter(
            models.ChannelMessage.channel_id.in_(channel_ids),
            models.ChannelMessage.sender_id != current_user.id
        ).order_by(models.ChannelMessage.timestamp.desc()).limit(3).all()
        
        for cm in recent_community:
            recent_activities.append({
                "title": f"New in Community",
                "description": f"{cm.sender.name}: {cm.content[:40]}...",
                "time": "Activity",
                "icon": "Clock",
                "iconColor": "text-orange-600",
                "iconBg": "bg-orange-50",
                "link": "/dashboard/community",
                "timestamp": cm.timestamp
            })

    # Sort all by timestamp if available
    recent_activities.sort(key=lambda x: x.get("timestamp", datetime.datetime.min), reverse=True)
    for a in recent_activities: a.pop("timestamp", None)

    # 3. Upcoming Tasks
    upcoming_tasks = []
    now = datetime.datetime.now(datetime.timezone.utc)
    for e in enrollments:
        if e.progress < 100:
            due = e.due_date or (e.enrolled_at + datetime.timedelta(days=30))
            days_diff = (due - now).days if due.tzinfo else (due - datetime.datetime.now()).days
            
            upcoming_tasks.append({
                "id": e.id,
                "title": f"{e.course.title} Deadline",
                "type": "Course Deadline",
                "dueDate": due.strftime("%Y-%m-%d"),
                "priority": "high" if days_diff < 7 else "medium",
                "color": "red" if days_diff < 7 else "orange"
            })

    return {
        "recent_activities": recent_activities[:5],
        "continue_learning": continue_learning[:3],
        "upcoming_tasks": upcoming_tasks[:5]
    }

@app.get("/api/users/me/courses", response_model=List[schemas.Enrollment])
def get_my_courses(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Enrollment).filter(models.Enrollment.user_id == current_user.id).all()

@app.post("/api/courses/{course_id}/buy")
def buy_course(course_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Check if already enrolled
    existing = db.query(models.Enrollment).filter(models.Enrollment.user_id == current_user.id, models.Enrollment.course_id == course_id).first()
    if existing:
        return {"success": True, "message": "Already enrolled"}
    
    new_enrollment = models.Enrollment(
        user_id=current_user.id,
        course_id=course_id,
        status="in-progress",
        progress=0.0,
        payment_status="paid"
    )
    db.add(new_enrollment)
    db.commit()
    db.commit()
    return {"success": True}

@app.patch("/api/enrollments/{enrollment_id}/progress")
def update_enrollment_progress(enrollment_id: int, data: dict, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id, models.Enrollment.user_id == current_user.id).first()
    if not enrollment: raise HTTPException(status_code=404, detail="Enrollment not found")
    
    progress = data.get("progress", 0.0)
    enrollment.progress = min(max(progress, 0.0), 100.0)
    if enrollment.progress >= 100:
        enrollment.status = "completed"
        enrollment.completed_at = datetime.datetime.now()
    
    db.commit()
    return {"success": True, "progress": enrollment.progress}

@app.post("/api/quizzes/{quiz_id}/submit")
def submit_quiz(quiz_id: int, submission: schemas.QuizSubmission, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    print(f"DEBUG: Quiz submission received for quiz {quiz_id} by user {current_user.email}")
    print(f"DEBUG: Submission data: {submission.dict()}")
    
    # Load quiz with questions and options eagerly
    quiz = db.query(models.Quiz).options(
        joinedload(models.Quiz.questions).joinedload(models.QuizQuestion.options)
    ).filter(models.Quiz.id == quiz_id).first()
    
    if not quiz: 
        print(f"ERROR: Quiz {quiz_id} not found")
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    total_questions = len(quiz.questions)
    correct_answers = 0
    
    print(f"DEBUG: Quiz has {total_questions} questions")
    
    # submission.answers is a list of {question_id: int, selected_option_id: int}
    answers_dict = {}
    for a in submission.answers:
        if isinstance(a, dict) and 'question_id' in a and 'selected_option_id' in a:
            answers_dict[int(a['question_id'])] = int(a['selected_option_id'])
    
    for q in quiz.questions:
        selected_opt_id = answers_dict.get(q.id)
        if selected_opt_id:
            # Find the option in the already loaded question options
            opt = next((o for o in q.options if o.id == selected_opt_id), None)
            if opt and opt.is_correct:
                correct_answers += 1
                
    score = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    print(f"DEBUG: Score calculated: {score}% ({correct_answers}/{total_questions})")
    
    # Save Attempt
    new_attempt = models.QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score,
        passed=score >= 70
    )
    db.add(new_attempt)

    # Update enrollment progress
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id, 
        models.Enrollment.course_id == quiz.course_id
    ).first()
    
    if enrollment:
        # Pass score update logic
        new_progress = max(enrollment.progress, 20.0)
        if score >= 70:
             new_progress = max(new_progress, 100.0)
        
        enrollment.progress = min(new_progress, 100.0)
        if enrollment.progress >= 100:
            enrollment.status = "completed"
            enrollment.completed_at = datetime.datetime.now()
        
    db.commit()
    return {
        "score": score,
        "correct_answers": correct_answers,
        "total_questions": total_questions,
        "passed": score >= 70
    }

# ==================== COMMUNICATION & COMMUNITY ====================

@app.post("/api/admin/community/channels/{channel_id}/members")
def add_channel_members(channel_id: int, user_ids: List[int], db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    if not channel: raise HTTPException(status_code=404, detail="Channel not found")
    
    users = db.query(models.User).filter(models.User.id.in_(user_ids)).all()
    for user in users:
        if user not in channel.members:
            channel.members.append(user)
            create_notification(db, user.id, "Added to Channel", f"You have been added to #{channel.name}")
            
    db.commit()
    return {"success": True}

@app.get("/api/community/channels", response_model=List[schemas.Channel])

def get_channels(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    if user.role == "admin":
        return db.query(models.Channel).options(joinedload(models.Channel.members)).all()
    
    # Non-admins see public channels OR channels they are members of
    return db.query(models.Channel).options(joinedload(models.Channel.members)).filter(
        (models.Channel.type == "public") | 
        (models.Channel.members.any(models.User.id == user.id))
    ).all()


@app.post("/api/admin/community/channels", response_model=schemas.Channel)
def create_admin_channel(channel: schemas.ChannelCreate, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    new_channel = models.Channel(
        name=channel.name, 
        description=channel.description, 
        icon=channel.icon,
        type=channel.type
    )

    if channel.user_ids:
        users = db.query(models.User).filter(models.User.id.in_(channel.user_ids)).all()
        new_channel.members = users
    
    # Ensure creator is a member
    if admin not in new_channel.members:
        new_channel.members.append(admin)
        
    db.add(new_channel)
    db.commit()
    db.refresh(new_channel)
    return new_channel

@app.delete("/api/admin/community/channels/{channel_id}")
def delete_admin_channel(channel_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    if not channel: raise HTTPException(status_code=404, detail="Channel not found")
    db.delete(channel)
    db.commit()
    return {"success": True}

@app.get("/api/community/channels/{channel_id}/messages", response_model=List[schemas.ChannelMessage])
def get_channel_messages(channel_id: int, limit: int = 50, db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    # Check membership
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    if not channel: raise HTTPException(status_code=404, detail="Channel not found")
    
    if user.role != "admin" and channel.type != "public":
        is_member = db.query(models.channel_members).filter(
            models.channel_members.c.channel_id == channel_id,
            models.channel_members.c.user_id == user.id
        ).first()
        if not is_member:
            raise HTTPException(status_code=403, detail="Not a member of this channel")
            
    try:
        messages = db.query(models.ChannelMessage).options(joinedload(models.ChannelMessage.sender)).filter(models.ChannelMessage.channel_id == channel_id).order_by(models.ChannelMessage.timestamp.desc()).limit(limit).all()
        return messages[::-1]
    except Exception as e:
        print(f"DEBUG ERROR in get_channel_messages: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/community/channels/{channel_id}/messages")
def send_channel_message(channel_id: int, msg: schemas.ChannelMessageCreate, db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    # Check membership
    channel = db.query(models.Channel).options(joinedload(models.Channel.members)).filter(models.Channel.id == channel_id).first()
    if not channel: raise HTTPException(status_code=404, detail="Channel not found")
    
    if user.role != "admin" and channel.type != "public":
        is_member = db.query(models.channel_members).filter(
            models.channel_members.c.channel_id == channel_id,
            models.channel_members.c.user_id == user.id
        ).first()
        if not is_member:
            raise HTTPException(status_code=403, detail="Not a member of this channel")
            
    new_msg = models.ChannelMessage(channel_id=channel_id, sender_id=user.id, content=msg.content)

    db.add(new_msg)
    
    # Notify other members
    for u in channel.members:
        if u.id != user.id:
            create_notification(db, u.id, f"New in #{channel.name}", f"{user.name}: {msg.content[:50]}...")
        
    db.commit()
    return {"success": True}

@app.delete("/api/community/messages/{message_id}")
def delete_community_message(message_id: int, db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    msg = db.query(models.ChannelMessage).filter(models.ChannelMessage.id == message_id).first()
    if not msg: raise HTTPException(status_code=404, detail="Message not found")
    if user.role != "admin" and msg.sender_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")
    db.delete(msg)
    db.commit()
    return {"success": True}

@app.get("/api/messages/users", response_model=List[schemas.User])
def get_chat_users(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    return db.query(models.User).filter(models.User.id != user.id).all()

@app.get("/api/messages/conversations")
def get_conversations(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    # Simple logic: get unique users that current user has chatted with
    sent = db.query(models.Message.receiver_id).filter(models.Message.sender_id == user.id).distinct()
    received = db.query(models.Message.sender_id).filter(models.Message.receiver_id == user.id).distinct()
    user_ids = set([r[0] for r in sent] + [r[0] for r in received])
    users = db.query(models.User).filter(models.User.id.in_(user_ids)).all()
    return users

@app.get("/api/messages/conversations/{other_user_id}", response_model=List[schemas.Message])
def get_private_messages(other_user_id: int, db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    # Mark messages as read
    db.query(models.Message).filter(
        models.Message.sender_id == other_user_id,
        models.Message.receiver_id == user.id,
        models.Message.is_read == False
    ).update({models.Message.is_read: True})
    db.commit()

    return db.query(models.Message).options(joinedload(models.Message.sender)).filter(
        ((models.Message.sender_id == user.id) & (models.Message.receiver_id == other_user_id)) |
        ((models.Message.sender_id == other_user_id) & (models.Message.receiver_id == user.id))
    ).order_by(models.Message.timestamp).all()

@app.post("/api/messages/send")
def send_private_message(msg: schemas.MessageBase, db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    new_msg = models.Message(sender_id=user.id, receiver_id=msg.receiver_id, content=msg.content)
    db.add(new_msg)
    create_notification(db, msg.receiver_id, "New Private Message", f"You received a message from {user.name}")
    db.commit()
    return {"success": True}

@app.get("/api/messages/unread-count")
def get_unread_message_count(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    count = db.query(models.Message).filter(models.Message.receiver_id == user.id, models.Message.is_read == False).count()
    return {"unread_count": count}

@app.post("/api/users/profile-picture")
async def upload_profile_picture(file: UploadFile = File(...), user: models.User = Depends(auth.get_current_active_user), db: Session = Depends(database.get_db)):
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"user_{user.id}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}{file_extension}"
    file_path = os.path.join(PROFILE_PIX_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    user.avatar_url = f"/uploads/profile_pictures/{filename}"
    db.commit()
    return {"url": user.avatar_url}


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), admin: models.User = Depends(auth.get_admin_user)):
    print(f"DEBUG: Received upload request for file: {file.filename}")
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"content_{datetime.datetime.now().strftime('%Y%m%d%H%M%S_%f')}{file_extension}"
    file_path = os.path.join(COURSE_CONTENT_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()
    
    file_url = f"http://localhost:8000/uploads/course_content/{filename}"
    return {"url": file_url, "filename": file.filename}

# ==================== ANALYTICS ROUTES ====================

@app.get("/api/schedules", response_model=List[schemas.Schedule])
def get_schedules(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    return db.query(models.Schedule).filter(models.Schedule.user_id == user.id).all()

@app.get("/api/learner/analytics")
def get_learner_analytics(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    enrolled = db.query(models.Enrollment).filter(models.Enrollment.user_id == user.id).count()
    completed = db.query(models.Enrollment).filter(models.Enrollment.user_id == user.id, models.Enrollment.status == "completed").count()
    completion_rate = (completed / enrolled * 100) if enrolled > 0 else 0
    return {
        "enrolled_courses": enrolled,
        "completed_courses": completed,
        "completion_rate": round(completion_rate, 1),
        "learning_hours": enrolled * 5 # Mock multiplier for hours
    }

@app.get("/api/courses/{course_id}/enrolled-users", response_model=List[schemas.User])
def get_enrolled_users(course_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    enrollments = db.query(models.Enrollment).options(joinedload(models.Enrollment.user)).filter(models.Enrollment.course_id == course_id).all()
    return [e.user for e in enrollments if e.user]



@app.post("/api/admin/schedules", response_model=schemas.Schedule)
def create_schedule(
    schedule: schemas.ScheduleCreate, 
    db: Session = Depends(database.get_db), 
    admin: models.User = Depends(auth.get_admin_user)
):
    new_schedule = models.Schedule(**schedule.dict())
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return new_schedule

@app.get("/api/admin/schedules", response_model=List[schemas.Schedule])
def get_admin_schedules(db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    return db.query(models.Schedule).all()

@app.delete("/api/admin/schedules/{schedule_id}")
def delete_admin_schedule(schedule_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    schedule = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if not schedule: raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()
    return {"success": True}

# ==================== NOTIFICATIONS ====================

@app.get("/api/notifications", response_model=List[schemas.Notification])
def get_notifications(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    return db.query(models.Notification).filter(models.Notification.user_id == user.id).order_by(models.Notification.created_at.desc()).all()

@app.put("/api/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id, models.Notification.user_id == user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}

@app.put("/api/notifications/mark-all-read")
def mark_all_notifications_read(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    db.query(models.Notification).filter(models.Notification.user_id == user.id).update({models.Notification.is_read: True})
    db.commit()
    return {"success": True}

# ==================== CERTIFICATES ====================

@app.get("/api/certificates/my", response_model=List[schemas.Certificate])
def get_my_certificates(db: Session = Depends(database.get_db), user: models.User = Depends(auth.get_current_active_user)):
    return db.query(models.Certificate).options(
        joinedload(models.Certificate.user),
        joinedload(models.Certificate.course)
    ).filter(models.Certificate.user_id == user.id).all()


@app.post("/api/admin/certificates/generate")
def generate_certificate(data: dict, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    user_id = data.get("user_id")
    course_id = data.get("course_id")
    domain = data.get("domain")
    
    cert = models.Certificate(
        user_id=user_id,
        course_id=course_id if course_id else None,
        domain=domain,
        certificate_url=f"/certificates/cert_{user_id}_{course_id or 'custom'}.pdf"
    )
    db.add(cert)
    db.commit()
    return {"success": True}


@app.get("/api/admin/certificates/all", response_model=List[schemas.Certificate])
def get_all_certificates(db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    print(f"DEBUG: get_all_certificates called by {admin.email}")
    try:
        certs = db.query(models.Certificate).options(
            joinedload(models.Certificate.user), 
            joinedload(models.Certificate.course)
        ).all()
        print(f"DEBUG: Found {len(certs)} certificates")
        return certs
    except Exception as e:
        print(f"Error in get_all_certificates: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/settings")
def get_admin_settings(db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    settings = db.query(models.SystemSetting).all()
    return {s.key: s.value for s in settings}

@app.post("/api/admin/settings")
def update_admin_settings(data: dict, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    for key, value in data.items():
        setting = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
        if setting:
            setting.value = value
        else:
            setting = models.SystemSetting(key=key, value=value)
            db.add(setting)
    db.commit()
    return {"success": True}

@app.delete("/api/admin/certificates/{cert_id}")

def delete_admin_certificate(cert_id: int, db: Session = Depends(database.get_db), admin: models.User = Depends(auth.get_admin_user)):
    cert = db.query(models.Certificate).filter(models.Certificate.id == cert_id).first()
    if not cert: raise HTTPException(status_code=404, detail="Certificate not found")
    db.delete(cert)
    db.commit()
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
