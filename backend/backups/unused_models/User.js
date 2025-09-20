const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

class User {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '..', '..', 'database.db'));
    this.init();
  }

  init() {
    this.db.serialize(() => {
      // 사용자 테이블 생성
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT CHECK(role IN ('student', 'admin')) DEFAULT 'student',
          class_name TEXT,
          student_number TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          is_active BOOLEAN DEFAULT 1
        )
      `);

      // 학생 진도 테이블 생성
      this.db.run(`
        CREATE TABLE IF NOT EXISTS student_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          level_id TEXT NOT NULL,
          chapter_id INTEGER NOT NULL,
          completed BOOLEAN DEFAULT 0,
          stars INTEGER DEFAULT 0,
          completion_time INTEGER,
          code_solution TEXT,
          attempts INTEGER DEFAULT 0,
          completed_at DATETIME,
          FOREIGN KEY (student_id) REFERENCES users(id)
        )
      `);

      // 평가 결과 테이블 생성
      this.db.run(`
        CREATE TABLE IF NOT EXISTS assessment_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          assessment_type TEXT NOT NULL,
          assessment_name TEXT NOT NULL,
          score INTEGER NOT NULL,
          max_score INTEGER NOT NULL,
          details TEXT,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES users(id)
        )
      `);

      // 기본 관리자 계정 생성
      this.createDefaultAdmin();
    });
  }

  async createDefaultAdmin() {
    const hashedPassword = await bcrypt.hash('admin123!', 10);
    this.db.run(`
      INSERT OR IGNORE INTO users (username, password, name, role) 
      VALUES (?, ?, ?, ?)
    `, ['admin', hashedPassword, '관리자', 'admin']);
  }

  // 사용자 생성
  async createUser(userData) {
    const { username, password, name, role = 'student', className, studentNumber } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO users (username, password, name, role, class_name, student_number)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [username, hashedPassword, name, role, className, studentNumber], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, username, name, role });
        }
      });
    });
  }

  // 사용자 인증
  async authenticateUser(username, password) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT * FROM users WHERE username = ?
      `, [username], async (err, user) => {
        if (err) {
          reject(err);
        } else if (!user) {
          resolve(null);
        } else {
          // 기존 평문 비밀번호와 bcrypt 해시 모두 지원
          let isValid = false;
          if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
            // bcrypt 해시된 비밀번호
            isValid = await bcrypt.compare(password, user.password);
          } else {
            // 평문 비밀번호 (기존 DB 호환성)
            isValid = password === user.password;
          }

          if (isValid) {
            resolve({
              id: user.id,
              username: user.username,
              name: user.name,
              role: user.role
            });
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  // 마지막 로그인 시간 업데이트
  updateLastLogin(userId) {
    this.db.run(`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    `, [userId]);
  }

  // 모든 학생 조회
  async getAllStudents() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT id, username, name, class_name, student_number, created_at, last_login, is_active
        FROM users WHERE role = 'student'
        ORDER BY class_name, student_number, name
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // 학생 삭제
  async deleteStudent(studentId) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE users SET is_active = 0 WHERE id = ? AND role = 'student'
      `, [studentId], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
    });
  }

  // 학생 진도 저장
  async saveProgress(studentId, levelId, chapterId, completed, stars, code, completionTime) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT OR REPLACE INTO student_progress 
        (student_id, level_id, chapter_id, completed, stars, code_solution, completion_time, attempts, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 
          COALESCE((SELECT attempts FROM student_progress WHERE student_id = ? AND level_id = ? AND chapter_id = ?), 0) + 1,
          CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)
      `, [studentId, levelId, chapterId, completed, stars, code, completionTime, studentId, levelId, chapterId, completed], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  // 학생 진도 조회
  async getStudentProgress(studentId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM student_progress WHERE student_id = ?
        ORDER BY chapter_id, level_id
      `, [studentId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // 평가 결과 저장
  async saveAssessmentResult(studentId, assessmentType, assessmentName, score, maxScore, details) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO assessment_results 
        (student_id, assessment_type, assessment_name, score, max_score, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [studentId, assessmentType, assessmentName, score, maxScore, JSON.stringify(details)], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  // 학생 평가 결과 조회
  async getStudentAssessments(studentId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM assessment_results WHERE student_id = ?
        ORDER BY completed_at DESC
      `, [studentId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => ({
          ...row,
          details: JSON.parse(row.details || '{}')
        })));
      });
    });
  }
}

module.exports = User;