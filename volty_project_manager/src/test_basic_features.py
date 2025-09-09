"""
Volty 프로젝트 관리 시스템 - 기본 기능 테스트
프로젝트 CRUD 기능을 자동으로 테스트
"""

import os
import sys
# 윈도우 콘솔 인코딩 설정
if sys.platform == "win32":
    os.system('chcp 65001 > nul')

import sqlite3
from pathlib import Path
from datetime import datetime
import os

class VoltyBasicTest:
    def __init__(self):
        self.data_dir = Path("../data")
        self.data_dir.mkdir(exist_ok=True)
        
        # 테스트용 데이터베이스 초기화
        self.init_test_database()
    
    def init_test_database(self):
        """테스트용 데이터베이스 초기화"""
        db_path = self.data_dir / 'volty_simple.db'
        print(f"데이터베이스 경로: {db_path}")
        
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        
        # 테이블 생성
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE,
                description TEXT,
                status TEXT DEFAULT 'planning',
                created_date TEXT
            )
        ''')
        
        self.conn.commit()
        print("[OK] 데이터베이스 초기화 완료")
    
    def test_create_project(self):
        """프로젝트 생성 테스트"""
        print("\n🧪 프로젝트 생성 테스트...")
        
        test_projects = [
            ("스미스머신 정렬 시스템", "초음파 센서를 이용한 벤치 정렬", "planning"),
            ("스쿼트 가이드", "압력센서와 각도 측정", "planning"),
            ("운동 카운터", "자이로센서 기반 반복 측정", "active")
        ]
        
        for name, desc, status in test_projects:
            try:
                self.cursor.execute('''
                    INSERT OR IGNORE INTO projects (name, description, status, created_date)
                    VALUES (?, ?, ?, ?)
                ''', (name, desc, status, datetime.now().isoformat()))
                
                self.conn.commit()
                
                # 프로젝트 폴더 생성
                project_dir = self.data_dir / 'projects' / name
                project_dir.mkdir(parents=True, exist_ok=True)
                
                print(f"  ✅ 생성됨: {name}")
                
            except Exception as e:
                print(f"  ❌ 실패: {name} - {str(e)}")
    
    def test_read_projects(self):
        """프로젝트 조회 테스트"""
        print("\n📋 프로젝트 목록 조회...")
        
        try:
            self.cursor.execute('''
                SELECT name, status, created_date FROM projects 
                ORDER BY created_date DESC
            ''')
            
            projects = self.cursor.fetchall()
            
            if projects:
                print(f"  📊 총 {len(projects)}개 프로젝트 발견:")
                for name, status, created_date in projects:
                    status_icon = {"planning": "📋", "active": "⚡", "completed": "✅"}.get(status, "❓")
                    print(f"    {status_icon} {name} ({status})")
            else:
                print("  📭 프로젝트가 없습니다.")
                
        except Exception as e:
            print(f"  ❌ 조회 실패: {str(e)}")
    
    def test_update_project(self):
        """프로젝트 업데이트 테스트"""
        print("\n✏️ 프로젝트 업데이트 테스트...")
        
        try:
            # 첫 번째 프로젝트 설명 업데이트
            new_description = "초음파 센서 HC-SR04 x2 + Arduino Uno + OLED 디스플레이를 사용한 스미스머신 벤치 중앙 정렬 시스템"
            
            self.cursor.execute('''
                UPDATE projects 
                SET description = ? 
                WHERE name = ?
            ''', (new_description, "스미스머신 정렬 시스템"))
            
            rows_affected = self.cursor.rowcount
            self.conn.commit()
            
            if rows_affected > 0:
                print(f"  ✅ 업데이트 완료: {rows_affected}개 행 수정")
            else:
                print(f"  ⚠️ 해당 프로젝트를 찾을 수 없음")
                
        except Exception as e:
            print(f"  ❌ 업데이트 실패: {str(e)}")
    
    def test_project_folders(self):
        """프로젝트 폴더 구조 테스트"""
        print("\n📁 프로젝트 폴더 구조 확인...")
        
        projects_dir = self.data_dir / 'projects'
        
        if projects_dir.exists():
            print(f"  📂 프로젝트 루트: {projects_dir}")
            
            for project_folder in projects_dir.iterdir():
                if project_folder.is_dir():
                    print(f"    📁 {project_folder.name}/")
                    
                    # 하위 폴더들 생성 및 확인
                    subfolders = ['fusion_files', 'arduino_code', 'stl_files', 'scan_files']
                    for subfolder in subfolders:
                        subfolder_path = project_folder / subfolder
                        subfolder_path.mkdir(exist_ok=True)
                        if subfolder_path.exists():
                            print(f"      📁 {subfolder}/")
        else:
            print(f"  ❌ 프로젝트 폴더가 없습니다: {projects_dir}")
    
    def test_delete_project(self):
        """프로젝트 삭제 테스트 (테스트용 프로젝트만)"""
        print("\n🗑️ 테스트 프로젝트 삭제...")
        
        # 테스트용 프로젝트 생성
        test_project = "테스트용 프로젝트"
        
        try:
            # 테스트 프로젝트 생성
            self.cursor.execute('''
                INSERT OR IGNORE INTO projects (name, description, status, created_date)
                VALUES (?, ?, ?, ?)
            ''', (test_project, "삭제 테스트용", "planning", datetime.now().isoformat()))
            
            # 생성 확인
            self.cursor.execute('SELECT COUNT(*) FROM projects WHERE name = ?', (test_project,))
            if self.cursor.fetchone()[0] > 0:
                print(f"  ✅ 테스트 프로젝트 생성됨: {test_project}")
                
                # 삭제
                self.cursor.execute('DELETE FROM projects WHERE name = ?', (test_project,))
                self.conn.commit()
                
                # 삭제 확인
                self.cursor.execute('SELECT COUNT(*) FROM projects WHERE name = ?', (test_project,))
                if self.cursor.fetchone()[0] == 0:
                    print(f"  ✅ 테스트 프로젝트 삭제 완료: {test_project}")
                else:
                    print(f"  ❌ 삭제 실패: {test_project}")
            
        except Exception as e:
            print(f"  ❌ 삭제 테스트 실패: {str(e)}")
    
    def test_database_integrity(self):
        """데이터베이스 무결성 테스트"""
        print("\n🔍 데이터베이스 무결성 검사...")
        
        try:
            # 중복 이름 확인
            self.cursor.execute('''
                SELECT name, COUNT(*) as count 
                FROM projects 
                GROUP BY name 
                HAVING COUNT(*) > 1
            ''')
            
            duplicates = self.cursor.fetchall()
            if duplicates:
                print(f"  ⚠️ 중복 프로젝트 발견:")
                for name, count in duplicates:
                    print(f"    - {name}: {count}개")
            else:
                print(f"  ✅ 중복 프로젝트 없음")
                
            # 빈 이름 확인
            self.cursor.execute("SELECT COUNT(*) FROM projects WHERE name IS NULL OR name = ''")
            empty_names = self.cursor.fetchone()[0]
            
            if empty_names > 0:
                print(f"  ⚠️ 빈 이름 프로젝트: {empty_names}개")
            else:
                print(f"  ✅ 모든 프로젝트에 이름 있음")
                
            # 전체 통계
            self.cursor.execute("SELECT COUNT(*) FROM projects")
            total_projects = self.cursor.fetchone()[0]
            
            self.cursor.execute("SELECT status, COUNT(*) FROM projects GROUP BY status")
            status_counts = self.cursor.fetchall()
            
            print(f"  📊 전체 프로젝트: {total_projects}개")
            for status, count in status_counts:
                print(f"    - {status}: {count}개")
                
        except Exception as e:
            print(f"  ❌ 무결성 검사 실패: {str(e)}")
    
    def run_all_tests(self):
        """모든 테스트 실행"""
        print("🧪 Volty 프로젝트 관리 시스템 - 기본 기능 테스트 시작")
        print("=" * 50)
        
        self.test_create_project()
        self.test_read_projects()
        self.test_update_project()
        self.test_project_folders()
        self.test_delete_project()
        self.test_database_integrity()
        
        print("\n" + "=" * 50)
        print("🎉 모든 테스트 완료!")
        
        # 연결 종료
        self.conn.close()

if __name__ == "__main__":
    tester = VoltyBasicTest()
    tester.run_all_tests()
    
    print("\n📝 다음 단계:")
    print("1. GUI에서 프로젝트 생성/삭제 테스트")
    print("2. 장비 상태 모니터링 기능 추가")
    print("3. Arduino 포트 스캔 기능 구현")
    print("4. 간단한 코드 템플릿 시스템 추가")