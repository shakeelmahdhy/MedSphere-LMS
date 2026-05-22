"""
Populate the database with rich demo data for marketing videos.

Usage:
  cd backend
  python seed_marketing.py          # resets DB and seeds
  python seed_marketing.py --keep   # seed only if empty (no drop)

Demo logins (password for all: demo123):
  Admin:   admin@medsphere.com.au
  Learner: sarah.chen@medsphere.com.au  (primary — use for learner dashboard)
  Also:    james.wilson@medsphere.com.au, emma.taylor@medsphere.com.au, ...
"""

import argparse
import datetime

import auth
import models
from database import SessionLocal, engine

# Public media (works without Supabase uploads)
SAMPLE_VIDEO = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
SAMPLE_PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed={seed}"
THUMB = "https://images.unsplash.com/photo-{id}?w=800&auto=format&fit=crop&q=80"

DEMO_PASSWORD = "demo123"


def avatar(seed: str) -> str:
    return AVATAR.format(seed=seed)


def thumb(photo_id: str) -> str:
    return THUMB.format(id=photo_id)


def days_ago(n: int) -> datetime.datetime:
    return datetime.datetime.now() - datetime.timedelta(days=n)


def seed_marketing(*, reset: bool = True) -> None:
    if reset:
        print("Dropping all tables...")
        models.Base.metadata.drop_all(bind=engine)
        print("Creating all tables...")
        models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if not reset and db.query(models.User).first():
            print("Database already has data. Use default mode to reset, or empty the DB first.")
            return

        pw = auth.get_password_hash(DEMO_PASSWORD)

        # —— Users ——
        admin = models.User(
            name="Dr. Amelia Foster",
            email="admin@medsphere.com.au",
            password_hash=pw,
            role="admin",
            is_active=True,
            bio="Clinical educator and platform administrator with 15+ years in aged care training.",
            avatar_url=avatar("Amelia"),
        )
        learners_data = [
            ("Sarah Chen", "sarah.chen@medsphere.com.au", "Sarah", "Enrolled nurse passionate about dementia-friendly care."),
            ("James Wilson", "james.wilson@medsphere.com.au", "James", "Care coordinator upskilling in medication management."),
            ("Emma Taylor", "emma.taylor@medsphere.com.au", "Emma", "New graduate building confidence in residential aged care."),
            ("Michael O'Brien", "michael.obrien@medsphere.com.au", "Michael", "Team leader completing leadership modules."),
            ("Priya Sharma", "priya.sharma@medsphere.com.au", "Priya", "Allied health assistant focused on palliative care basics."),
            ("Lisa Nguyen", "lisa.nguyen@medsphere.com.au", "Lisa", "RN transitioning from acute care to aged care."),
            ("David Park", "david.park@medsphere.com.au", "David", "Certificate III student on placement preparation."),
            ("Hannah Brooks", "hannah.brooks@medsphere.com.au", "Hannah", "Quality officer reviewing infection control standards."),
        ]
        learners = []
        for name, email, seed, bio in learners_data:
            learners.append(
                models.User(
                    name=name,
                    email=email,
                    password_hash=pw,
                    role="learner",
                    is_active=True,
                    bio=bio,
                    avatar_url=avatar(seed),
                )
            )
        db.add(admin)
        db.add_all(learners)
        db.flush()

        # —— Groups & teams ——
        groups = [
            models.Group(name="Metro Aged Care", location="Sydney, NSW"),
            models.Group(name="Regional Care Network", location="Ballarat, VIC"),
            models.Group(name="Home Care Services", location="Brisbane, QLD"),
        ]
        db.add_all(groups)
        db.flush()
        for i, learner in enumerate(learners[:6]):
            learner.group_id = groups[i % len(groups)].id

        teams = [
            models.Team(
                name="North Ward Training",
                location="Sydney",
                admin_id=admin.id,
            ),
            models.Team(
                name="Clinical Excellence",
                location="Melbourne",
                admin_id=admin.id,
            ),
        ]
        db.add_all(teams)
        db.flush()
        teams[0].members.extend(learners[:4])
        teams[1].members.extend(learners[2:6])

        # —— Channels ——
        channels = [
            models.Channel(
                name="General",
                description="Welcome channel for all MedSphere learners",
                icon="Hash",
                type="public",
            ),
            models.Channel(
                name="Dementia Care",
                description="Share tips and resources for dementia support",
                icon="Heart",
                type="public",
            ),
            models.Channel(
                name="Clinical Updates",
                description="Policy changes and best-practice alerts",
                icon="Bell",
                type="public",
            ),
            models.Channel(
                name="Learner Support",
                description="Ask questions — our educators are here to help",
                icon="LifeBuoy",
                type="public",
            ),
        ]
        db.add_all(channels)
        db.flush()
        for ch in channels:
            ch.members.extend([admin] + learners[:5])

        channel_messages = [
            (0, admin.id, "Welcome to MedSphere Learning! 🎉 Start with Person-Centred Care Essentials."),
            (0, learners[0].id, "Thanks! Just finished Module 1 — really practical scenarios."),
            (0, learners[1].id, "Agreed. The video case studies are excellent."),
            (1, admin.id, "New dementia communication guide uploaded to the resource library."),
            (1, learners[2].id, "This will help our night shift team so much."),
            (2, learners[3].id, "Reminder: infection control refresher due end of month."),
            (2, admin.id, "Use the Medication Safety module — quiz opens Friday."),
            (3, learners[4].id, "Can someone explain the WHS checklist in Module 3?"),
            (3, admin.id, "Happy to walk through it in tomorrow's live Q&A."),
        ]
        for ch_idx, sender_id, content in channel_messages:
            db.add(
                models.ChannelMessage(
                    channel_id=channels[ch_idx].id,
                    sender_id=sender_id,
                    content=content,
                )
            )

        # —— Courses ——
        courses_spec = [
            {
                "title": "Person-Centred Care Essentials",
                "description": "Foundational skills for respectful, individualised care in residential and community settings.",
                "category": "Core Care",
                "duration": "6 hours",
                "thumb": "1581056771107-24ca5f033842",
                "price": 0,
                "status": "published",
            },
            {
                "title": "Medication Management in Aged Care",
                "description": "Safe administration, documentation, and error prevention aligned with Australian standards.",
                "category": "Clinical",
                "duration": "8 hours",
                "thumb": "1576091160399-112ba8d25d1f",
                "price": 89,
                "status": "published",
            },
            {
                "title": "Dementia Support & Communication",
                "description": "Practical strategies for de-escalation, meaningful engagement, and family partnership.",
                "category": "Specialist",
                "duration": "5 hours",
                "thumb": "1559839734-2b71ea197ec2",
                "price": 79,
                "status": "published",
            },
            {
                "title": "Infection Prevention & Control",
                "description": "IPC protocols, PPE, outbreak management, and audit readiness for aged care facilities.",
                "category": "Compliance",
                "duration": "4 hours",
                "thumb": "1584031471658-996b9479da58",
                "price": 0,
                "status": "published",
            },
            {
                "title": "Leadership for Care Coordinators",
                "description": "Team coaching, rostering, incident review, and quality improvement for frontline leaders.",
                "category": "Leadership",
                "duration": "10 hours",
                "thumb": "1521737711861-e3b97375aef7",
                "price": 129,
                "status": "published",
            },
            {
                "title": "Palliative & End-of-Life Care",
                "description": "Comfort measures, advance care planning, and supporting families with compassion.",
                "category": "Specialist",
                "duration": "7 hours",
                "thumb": "1519494026892-80bbd2d45df1",
                "price": 99,
                "status": "published",
            },
            {
                "title": "WHS & Manual Handling Refresher",
                "description": "Workplace health and safety, risk assessment, and safe resident transfers.",
                "category": "Compliance",
                "duration": "3 hours",
                "thumb": "1578491910361-788ef4eaa1b2",
                "price": 0,
                "status": "published",
            },
            {
                "title": "Nutrition & Hydration in Aged Care",
                "description": "Screening tools, texture-modified diets, and preventing malnutrition in older adults.",
                "category": "Clinical",
                "duration": "4 hours",
                "thumb": "1490645934777-aa3e8e9e3aa5",
                "price": 59,
                "status": "published",
            },
            {
                "title": "Cultural Safety & Diversity",
                "description": "Inclusive practice for Aboriginal and Torres Strait Islander peoples and CALD communities.",
                "category": "Core Care",
                "duration": "5 hours",
                "thumb": "1559027812-829ad4f4bca9",
                "price": 0,
                "status": "draft",
            },
        ]

        courses = []
        for spec in courses_spec:
            c = models.Course(
                title=spec["title"],
                description=spec["description"],
                price=spec["price"],
                type="Video",
                category=spec["category"],
                status=spec["status"],
                duration=spec["duration"],
                thumbnail_url=thumb(spec["thumb"]),
                instructor_id=admin.id,
            )
            courses.append(c)
        db.add_all(courses)
        db.flush()

        # Course content + quiz for first 5 published courses
        for idx, course in enumerate(courses[:5]):
            db.add_all(
                [
                    models.CourseContent(
                        course_id=course.id,
                        title="Introduction & learning outcomes",
                        content_type="video",
                        url=SAMPLE_VIDEO,
                        order=0,
                    ),
                    models.CourseContent(
                        course_id=course.id,
                        title="Participant workbook (PDF)",
                        content_type="pdf",
                        url=SAMPLE_PDF,
                        order=1,
                    ),
                    models.CourseContent(
                        course_id=course.id,
                        title="Case study: real-world application",
                        content_type="video",
                        url=SAMPLE_VIDEO,
                        order=2,
                    ),
                ]
            )
            quiz = models.Quiz(course_id=course.id, title=f"{course.title} — Knowledge Check")
            db.add(quiz)
            db.flush()
            q1 = models.QuizQuestion(
                quiz_id=quiz.id,
                question_text="What is the primary goal of person-centred care?",
            )
            db.add(q1)
            db.flush()
            db.add_all(
                [
                    models.QuizOption(
                        question_id=q1.id,
                        option_text="Treat all residents the same way",
                        is_correct=False,
                    ),
                    models.QuizOption(
                        question_id=q1.id,
                        option_text="Respect individual preferences and dignity",
                        is_correct=True,
                    ),
                    models.QuizOption(
                        question_id=q1.id,
                        option_text="Reduce staffing requirements",
                        is_correct=False,
                    ),
                ]
            )

        # —— Enrollments (spread over 7 days for analytics charts) ——
        enrollment_plan = [
            # learner_index, course_index, progress, status, days_ago
            (0, 0, 100, "completed", 6),
            (0, 1, 65, "enrolled", 4),
            (0, 3, 40, "enrolled", 2),
            (1, 0, 100, "completed", 5),
            (1, 1, 100, "completed", 3),
            (1, 2, 30, "enrolled", 1),
            (2, 2, 55, "enrolled", 5),
            (2, 3, 100, "completed", 4),
            (2, 7, 20, "enrolled", 0),
            (3, 4, 75, "enrolled", 6),
            (3, 5, 10, "enrolled", 2),
            (4, 1, 100, "completed", 7),
            (4, 6, 50, "enrolled", 3),
            (5, 0, 80, "enrolled", 1),
            (5, 4, 100, "completed", 5),
            (6, 3, 15, "enrolled", 0),
            (7, 6, 100, "completed", 4),
            (7, 7, 90, "enrolled", 1),
        ]

        enrollments = []
        for li, ci, progress, status, ago in enrollment_plan:
            enrolled_at = days_ago(ago)
            completed_at = enrolled_at + datetime.timedelta(days=2) if status == "completed" else None
            e = models.Enrollment(
                user_id=learners[li].id,
                course_id=courses[ci].id,
                progress=float(progress),
                status=status,
                payment_status="paid",
                enrolled_at=enrolled_at,
                completed_at=completed_at,
            )
            enrollments.append(e)
        db.add_all(enrollments)
        db.flush()

        # Completed content for Sarah on course 0
        sarah_enrollment = next(
            e for e in enrollments if e.user_id == learners[0].id and e.course_id == courses[0].id
        )
        contents_c0 = (
            db.query(models.CourseContent)
            .filter(models.CourseContent.course_id == courses[0].id)
            .all()
        )
        for content in contents_c0[:2]:
            db.add(
                models.CompletedContent(
                    enrollment_id=sarah_enrollment.id,
                    content_id=content.id,
                )
            )

        # —— Quiz attempts ——
        quiz0 = db.query(models.Quiz).filter(models.Quiz.course_id == courses[0].id).first()
        if quiz0:
            for learner, score in [(learners[0], 92), (learners[1], 88), (learners[4], 95)]:
                db.add(
                    models.QuizAttempt(
                        user_id=learner.id,
                        quiz_id=quiz0.id,
                        score=float(score),
                        passed=score >= 80,
                        attempted_at=days_ago(2),
                    )
                )

        # —— Certificates ——
        cert_pairs = [
            (0, 0),
            (1, 0),
            (1, 1),
            (2, 3),
            (4, 1),
            (5, 4),
            (7, 6),
        ]
        for li, ci in cert_pairs:
            db.add(
                models.Certificate(
                    user_id=learners[li].id,
                    course_id=courses[ci].id,
                    domain="Aged Care",
                    certificate_url=f"https://medsphere.demo/cert/{learners[li].id}-{courses[ci].id}.pdf",
                    issued_at=days_ago(1),
                )
            )

        # —— Notifications ——
        notifs = [
            (learners[0].id, "Course completed!", "Congratulations on finishing Person-Centred Care Essentials."),
            (learners[0].id, "New message", "Dr. Foster replied in Learner Support."),
            (learners[1].id, "Certificate ready", "Your Medication Management certificate is available to download."),
            (learners[2].id, "Reminder", "Complete Infection Prevention quiz by Friday."),
            (learners[3].id, "Team assignment", "You have been added to Clinical Excellence team."),
            (admin.id, "Weekly report", "12 new enrollments this week across all courses."),
        ]
        for uid, title, message in notifs:
            db.add(
                models.Notification(
                    user_id=uid,
                    title=title,
                    message=message,
                    is_read=False,
                )
            )

        # —— Direct messages ——
        db.add_all(
            [
                models.Message(
                    sender_id=admin.id,
                    receiver_id=learners[0].id,
                    content="Hi Sarah — great work on your first certificate! Let me know if you need help with Medication Management.",
                    is_read=True,
                ),
                models.Message(
                    sender_id=learners[0].id,
                    receiver_id=admin.id,
                    content="Thank you! The case studies were really helpful for my placement.",
                    is_read=True,
                ),
                models.Message(
                    sender_id=learners[2].id,
                    receiver_id=admin.id,
                    content="Is there a live session for the dementia module this week?",
                    is_read=False,
                ),
                models.Message(
                    sender_id=admin.id,
                    receiver_id=learners[2].id,
                    content="Yes — Thursday 2pm AEST. Link is in the course announcements.",
                    is_read=False,
                ),
            ]
        )

        # —— Schedules ——
        schedule_data = [
            (learners[0].id, "Medication Management — Final Quiz", "assignment", 3),
            (learners[1].id, "Team huddle: IPC audit prep", "class", 1),
            (learners[3].id, "Leadership module — coaching practice", "workshop", 5),
            (learners[5].id, "Placement orientation", "class", 2),
            (admin.id, "Platform analytics review", "exam", 0),
        ]
        for uid, title, stype, start_days in schedule_data:
            start = days_ago(-start_days)  # future
            db.add(
                models.Schedule(
                    user_id=uid,
                    title=title,
                    description=f"Scheduled via MedSphere — {title}",
                    start_time=start,
                    end_time=start + datetime.timedelta(hours=2),
                    type=stype,
                    location="MedSphere Virtual Classroom",
                )
            )

        # —— System settings ——
        db.add(
            models.SystemSetting(
                key="platform",
                value={
                    "platformName": "Medsphere Learning",
                    "supportEmail": "support@medspherelearning.com.au",
                    "timezone": "Australia/Sydney",
                },
            )
        )

        db.commit()
        print("\n[OK] Marketing database seeded successfully!\n")
        print("=" * 60)
        print("  DEMO LOGINS  (password for all accounts: demo123)")
        print("=" * 60)
        print("  Admin:    admin@medsphere.com.au")
        print("  Learner:  sarah.chen@medsphere.com.au  ← best for learner UI")
        print("            james.wilson@medsphere.com.au")
        print("            emma.taylor@medsphere.com.au")
        print("-" * 60)
        print(f"  Users: {1 + len(learners)}  |  Courses: {len(courses)}  |  Enrollments: {len(enrollments)}")
        print(f"  Channels: {len(channels)}  |  Certificates: {len(cert_pairs)}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed MedSphere marketing demo data")
    parser.add_argument(
        "--keep",
        action="store_true",
        help="Do not drop tables; skip if data already exists",
    )
    args = parser.parse_args()
    seed_marketing(reset=not args.keep)
