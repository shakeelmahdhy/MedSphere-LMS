from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

# ==================== AUTH SCHEMAS ====================

class UserBase(BaseModel):
    email: str
    name: str
    role: str
    organization: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    settings: Optional[dict] = {}



class UserCreate(UserBase):
    password: str
    group_id: Optional[int] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class GroupBrief(BaseModel):
    id: int
    name: str
    location: Optional[str] = None

    class Config:
        from_attributes = True


class UserAdmin(User):
    group_id: Optional[int] = None
    group: Optional[GroupBrief] = None
    enrollments: List["Enrollment"] = []

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    settings: Optional[dict] = None
    is_active: Optional[bool] = None
    group_id: Optional[int] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# ==================== COURSE SCHEMAS ====================

class QuizOptionBase(BaseModel):
    option_text: str
    is_correct: bool

class QuizOptionCreate(QuizOptionBase):
    pass

class QuizOption(QuizOptionBase):
    id: int
    question_id: int

    class Config:
        from_attributes = True

class QuizQuestionBase(BaseModel):
    question_text: str
    question_type: str = "multiple_choice"

class QuizQuestionCreate(QuizQuestionBase):
    options: List[QuizOptionCreate]

class QuizQuestion(QuizQuestionBase):
    id: int
    quiz_id: int
    options: List[QuizOption]

    class Config:
        from_attributes = True

class QuizBase(BaseModel):
    title: str

class QuizCreate(QuizBase):
    questions: List[QuizQuestionCreate]

class Quiz(QuizBase):
    id: int
    course_id: int
    questions: List[QuizQuestion]

    class Config:
        from_attributes = True

class QuizSubmission(BaseModel):
    course_id: int
    answers: List[Any]

class CourseContentBase(BaseModel):
    title: str
    content_type: str
    url: str
    order: int = 0

class CourseContentCreate(CourseContentBase):
    pass

class CourseContent(CourseContentBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: str
    category: str
    level: str = "Beginner"
    price: float = 0.0
    duration: str = "Self-paced"
    type: str = "Video"
    status: str = "published"
    thumbnail_url: Optional[str] = None

class CourseCreate(CourseBase):
    contents: List[CourseContentCreate] = []
    quizzes: List[QuizCreate] = []

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[str] = None
    type: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: Optional[str] = None
    contents: Optional[List[CourseContentCreate]] = None
    quizzes: Optional[List[QuizCreate]] = None

class Course(CourseBase):
    id: int
    instructor_id: int
    status: str
    created_at: datetime
    contents: List[CourseContent] = []
    instructor: Optional[User] = None
    quizzes: List[Quiz] = []

    class Config:
        from_attributes = True

# ==================== ENROLLMENT SCHEMAS ====================

class EnrollmentBase(BaseModel):
    course_id: int

class EnrollmentCreate(EnrollmentBase):
    user_id: int

class BulkAssignCourseRequest(BaseModel):
    user_ids: List[int]
    course_id: int
    due_date: Optional[datetime] = None

class BulkAssignGroupRequest(BaseModel):
    user_ids: List[int]
    group_id: int

class CompletedContent(BaseModel):
    id: int
    content_id: int
    completed_at: datetime
    class Config:
        from_attributes = True

class Enrollment(EnrollmentBase):
    id: int
    user_id: int
    progress: float
    status: str
    payment_status: str
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    completed_contents: List[CompletedContent] = []

    class Config:
        from_attributes = True


class EnrollmentWithCourse(Enrollment):
    course: Optional[Course] = None

    class Config:
        from_attributes = True

# ==================== GROUP SCHEMAS ====================

class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class GroupCreate(GroupBase):
    pass

class GroupUpdate(GroupBase):
    pass

class Group(GroupBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== COMMUNITY SCHEMAS ====================

class ChannelBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "Hash"
    type: Optional[str] = "public"


class ChannelCreate(ChannelBase):
    user_ids: List[int] = []

class Channel(ChannelBase):
    id: int
    members: List[User] = []

    class Config:
        from_attributes = True

class ChannelMessageBase(BaseModel):
    content: str

class ChannelMessageCreate(ChannelMessageBase):
    pass

class ChannelMessage(ChannelMessageBase):
    id: int
    channel_id: int
    sender_id: int
    timestamp: datetime
    sender: Optional[User] = None

    class Config:
        from_attributes = True

# ==================== MESSAGE SCHEMAS ====================

class MessageBase(BaseModel):
    receiver_id: int
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    sender_id: int
    is_read: bool
    timestamp: datetime
    sender: User

    class Config:
        from_attributes = True

# ==================== NOTIFICATION SCHEMAS ====================

class NotificationBase(BaseModel):
    title: str
    message: str

class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== ROLE SCHEMAS ====================

class RoleBase(BaseModel):
    name: str
    permissions: List[str]

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==================== TEAM SCHEMAS ====================

class TeamBase(BaseModel):
    name: str
    location: str
    admin_id: Optional[int] = None

class TeamCreate(TeamBase):
    pass

class Team(TeamBase):
    id: int
    created_at: datetime
    members: List[User] = []
    admin: Optional[User] = None
    course_count: int = 0

    class Config:
        from_attributes = True

# ==================== SCHEDULE SCHEMAS ====================

class ScheduleBase(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: Optional[datetime] = None
    type: str = "assignment"
    location: Optional[str] = None

class ScheduleCreate(ScheduleBase):
    user_id: int


class ScheduleCreateSelf(ScheduleBase):
    """Learner-created schedule (user_id set server-side)."""
    pass

class TaskAssign(BaseModel):
    course_id: int
    user_ids: List[int]
    title: str
    description: str
    due_date: datetime

class Schedule(ScheduleBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# ==================== ANALYTICS SCHEMAS ====================

class AnalyticsTrend(BaseModel):
    date: str
    count: int

class CoursePopularity(BaseModel):
    title: str
    enrollments: int

class UserDistribution(BaseModel):
    role: str
    count: int

class Completion(BaseModel):
    user_name: str
    course_title: str
    date: str

class Activity(BaseModel):
    action: str
    details: str
    time: str
    icon: str
    color: str

class AnalyticsDashboard(BaseModel):
    total_users: int
    active_learners: int
    course_completion_rate: float
    avg_quiz_score: float
    enrollment_trends: List[AnalyticsTrend]
    course_popularity: List[CoursePopularity]
    user_distribution: List[UserDistribution]
    recent_activity: List[Activity]
    recent_completions: List[Completion]

# ==================== CERTIFICATE SCHEMAS ====================

class CertificateBase(BaseModel):
    user_id: int
    course_id: Optional[int] = None
    domain: Optional[str] = None
    certificate_url: str

class CertificateCreate(CertificateBase):
    pass


class Certificate(CertificateBase):
    id: int
    issued_at: datetime
    user: User
    course: Optional[Course] = None


    class Config:
        from_attributes = True

class LearnerAnalytics(BaseModel):
    courses_in_progress: int
    certificates_earned: int
    learning_hours: float
    completion_rate: float

# ==================== USER DASHBOARD SCHEMAS ====================

class DashboardActivity(BaseModel):
    title: str
    description: str
    time: str
    icon: str
    iconColor: str
    iconBg: str
    link: str

class ContinueLearning(BaseModel):
    id: int
    title: str
    instructor: str
    progress: float
    timeLeft: str
    image: Optional[str] = None
    color: str

class UpcomingTask(BaseModel):
    id: int
    title: str
    type: str
    dueDate: str
    priority: str
    color: str

class UserDashboard(BaseModel):
    recent_activities: List[DashboardActivity]
    continue_learning: List[ContinueLearning]
    upcoming_tasks: List[UpcomingTask]


UserAdmin.model_rebuild()
