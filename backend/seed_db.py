import models, auth, database, datetime
from database import SessionLocal, engine

def seed_db():
    # Drop all tables and recreate them to apply new schema
    print("Dropping all tables...")
    models.Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if we already have users
        if db.query(models.User).first():
            print("Database already seeded.")
            return

        # 1. Create Roles (Optional as we use string roles in User model for now, but good to have)
        # roles = [
        #     models.Role(name="admin", description="Full system access", permissions=["all"]),
        #     models.Role(name="learner", description="Standard student access", permissions=["read_courses", "enroll"])
        # ]
        # db.add_all(roles)
        # db.commit()

        # 2. Create Users
        admin = models.User(
            name="Admin User",
            email="admin@gmail.com",
            password_hash=auth.get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        
        learner = models.User(
            name="Ram Kumar",
            email="ram@gmail.com",
            password_hash=auth.get_password_hash("password123"),
            role="learner",
            is_active=True
        )
        
        db.add_all([admin, learner])
        db.commit()
        db.refresh(admin)
        db.refresh(learner)

        # 3. Create Channels
        channels = [
            models.Channel(name="General", description="General discussion for all learners"),
            models.Channel(name="Python Development", description="Discuss Python courses and projects"),
            models.Channel(name="Web Design", description="Frontend and UI/UX design talks")
        ]
        db.add_all(channels)
        db.commit()

        # 4. Create Courses
        courses = [
            models.Course(
                title="Introduction to React",
                description="Learn the basics of React.js including components, hooks, and state management.",
                type="Video",
                status="published",
                duration="10 hours",
                thumbnail_url="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop",
                instructor_id=admin.id
            ),
            models.Course(
                title="Advanced Python Programming",
                description="Master advanced Python concepts like decorators, generators, and async programming.",
                type="SCORM",
                status="published",
                duration="15 hours",
                thumbnail_url="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop",
                instructor_id=admin.id
            ),
            models.Course(
                title="UI/UX Design Essentials",
                description="Learn the fundamentals of design thinking and modern UI/UX principles.",
                type="Video",
                status="published",
                duration="8 hours",
                thumbnail_url="https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?w=800&auto=format&fit=crop",
                instructor_id=admin.id
            )
        ]
        db.add_all(courses)
        db.commit()

        # 5. Enroll learner in a course
        enrollment = models.Enrollment(
            user_id=learner.id,
            course_id=db.query(models.Course).first().id,
            progress=25.5,
            status="enrolled"
        )
        db.add(enrollment)
        
        # 6. Add some notifications
        notification = models.Notification(
            user_id=learner.id,
            title="Welcome!",
            message="Welcome to our E-Learning platform. Start your first course today!",
            is_read=False
        )
        db.add(notification)
        
        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
