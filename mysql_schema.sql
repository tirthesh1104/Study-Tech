-- Create Database
CREATE DATABASE IF NOT EXISTS smart_campus;
USE smart_campus;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('student', 'teacher', 'parent', 'admin') NOT NULL,
    admin_role VARCHAR(255),
    password VARCHAR(255),
    mobile VARCHAR(20),
    registered_photo_url TEXT,
    child_id VARCHAR(255),
    enable_scan_on_login BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255) NOT NULL,
    is_access_blocked BOOLEAN DEFAULT FALSE,
    behaviour_status ENUM('Good', 'Needs Improvement') DEFAULT 'Good',
    block_reason TEXT,
    temporary_access_expires BIGINT,
    learning_path JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    timestamp VARCHAR(50) NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(255) PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    submitted_date DATE,
    status ENUM('Graded', 'Submitted', 'Pending', 'Late') NOT NULL,
    score INT,
    max_score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Subject Notes Table
CREATE TABLE IF NOT EXISTS subject_notes (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    data_url LONGTEXT NOT NULL,
    complexity ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    summary TEXT,
    key_concepts JSON,
    uploaded_by VARCHAR(255) NOT NULL,
    read_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Chat Interactions Table
CREATE TABLE IF NOT EXISTS chat_interactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    questions JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Exam Submissions Table
CREATE TABLE IF NOT EXISTS exam_submissions (
    id VARCHAR(255) PRIMARY KEY,
    exam_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    answers JSON NOT NULL,
    submitted_at BIGINT NOT NULL,
    score INT NOT NULL,
    status ENUM('Completed', 'Blocked') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Live Classes Table
CREATE TABLE IF NOT EXISTS live_classes (
    id VARCHAR(255) PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    scheduled_time BIGINT NOT NULL,
    duration_minutes INT NOT NULL,
    meet_link TEXT NOT NULL,
    recording_url TEXT,
    teacher_id VARCHAR(255) NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    status ENUM('Scheduled', 'Live', 'Completed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);
