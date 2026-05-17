import os
from database import engine, Base, SessionLocal
import models
import auth

# Create all tables (drop first to ensure schema update)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Dropped and recreated all tables.")

# Seed initial data
db = SessionLocal()

try:
    # 1. Create Admin
    admin_pass = auth.get_password_hash("admin123")
    admin = models.User(
        name="System Admin",
        email="admin@gmail.com",
        password_hash=admin_pass,
        role="admin",
        bio="I manage the Aged Care Learning platform.",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
    )
    db.add(admin)
    
    # 2. Create Learner
    learner_pass = auth.get_password_hash("ram123")
    learner = models.User(
        name="Ram Learner",
        email="ram@gmail.com",
        password_hash=learner_pass,
        role="learner",
        bio="Healthcare enthusiast and lifelong learner.",
        avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Ram"
    )
    db.add(learner)

    # 3. Create initial channels
    general = models.Channel(name="general", description="General discussion for all learners")
    support = models.Channel(name="support", description="Get help from instructors")
    db.add(general)
    db.add(support)
    db.flush() # Get IDs

    # 4. Create a Course
    course = models.Course(
        title="Introduction to Aged Care",
        description="Learn the basics of elderly care and safety.",
        type="Video",
        duration="5 hours",
        thumbnail_url="https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&auto=format&fit=crop",
        instructor_id=admin.id
    )
    db.add(course)
    db.flush()

    # 5. Enroll Learner
    enrollment = models.Enrollment(user_id=learner.id, course_id=course.id, status="completed", progress=100)
    db.add(enrollment)

    # 6. Create Certificate
    cert = models.Certificate(
        user_id=learner.id,
        course_id=course.id,
        certificate_url=f"/certificates/cert_{learner.id}_{course.id}.pdf"
    )
    db.add(cert)

    # 7. Create Schedule
    event = models.Schedule(
        user_id=learner.id,
        title="Orientation Workshop",
        description="Welcome to the platform!",
        start_time=models.func.now(),
        end_time=models.func.now(),
        type="workshop",
        location="Zoom Room A"
    )
    db.add(event)

    # 8. Create some messages
    msg1 = models.ChannelMessage(channel_id=general.id, sender_id=admin.id, content="Welcome everyone to the Aged Care platform!")
    msg2 = models.ChannelMessage(channel_id=general.id, sender_id=learner.id, content="Thanks! Glad to be here.")
    db.add(msg1)
    db.add(msg2)

    db.commit()
    print("Seeded initial data successfully with enrollments and certs.")
except Exception as e:
    print(f"Error seeding data: {e}")
    db.rollback()
finally:
    db.close()
