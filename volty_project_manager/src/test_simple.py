"""
Volty 프로젝트 관리 시스템 - 간단 테스트 (이모지 제거)
"""

import sqlite3
from pathlib import Path
from datetime import datetime

class SimpleTest:
    def __init__(self):
        self.data_dir = Path("../data")
        self.data_dir.mkdir(exist_ok=True)
        
        # 데이터베이스 초기화
        self.init_database()
    
    def init_database(self):
        """데이터베이스 초기화"""
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
        print("\n[TEST] 프로젝트 생성 테스트...")
        
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
                
                print(f"  [OK] 생성됨: {name}")
                
            except Exception as e:
                print(f"  [ERROR] 실패: {name} - {str(e)}")
    
    def test_read_projects(self):
        """프로젝트 조회 테스트"""
        print("\n[TEST] 프로젝트 목록 조회...")
        
        try:
            self.cursor.execute('''
                SELECT name, status, created_date FROM projects 
                ORDER BY created_date DESC
            ''')
            
            projects = self.cursor.fetchall()
            
            if projects:
                print(f"  [INFO] 총 {len(projects)}개 프로젝트 발견:")
                for name, status, created_date in projects:
                    print(f"    - {name} ({status})")
            else:
                print("  [INFO] 프로젝트가 없습니다.")
                
        except Exception as e:
            print(f"  [ERROR] 조회 실패: {str(e)}")
    
    def test_folders(self):
        """폴더 구조 테스트"""
        print("\n[TEST] 프로젝트 폴더 구조 확인...")
        
        projects_dir = self.data_dir / 'projects'
        
        if projects_dir.exists():
            print(f"  [INFO] 프로젝트 루트: {projects_dir}")
            
            for project_folder in projects_dir.iterdir():
                if project_folder.is_dir():
                    print(f"    - 폴더: {project_folder.name}/")
                    
                    # 하위 폴더들 생성 및 확인
                    subfolders = ['fusion_files', 'arduino_code', 'stl_files', 'scan_files']
                    for subfolder in subfolders:
                        subfolder_path = project_folder / subfolder
                        subfolder_path.mkdir(exist_ok=True)
                        if subfolder_path.exists():
                            print(f"      - {subfolder}/")
        else:
            print(f"  [ERROR] 프로젝트 폴더가 없습니다: {projects_dir}")
    
    def test_statistics(self):
        """통계 테스트"""
        print("\n[TEST] 데이터베이스 통계...")
        
        try:
            # 전체 프로젝트 수
            self.cursor.execute("SELECT COUNT(*) FROM projects")
            total = self.cursor.fetchone()[0]
            print(f"  [INFO] 전체 프로젝트: {total}개")
            
            # 상태별 개수
            self.cursor.execute("SELECT status, COUNT(*) FROM projects GROUP BY status")
            status_counts = self.cursor.fetchall()
            
            for status, count in status_counts:
                print(f"    - {status}: {count}개")
                
        except Exception as e:
            print(f"  [ERROR] 통계 조회 실패: {str(e)}")
    
    def run_tests(self):
        """모든 테스트 실행"""
        print("=" * 60)
        print("Volty 프로젝트 관리 시스템 - 기본 기능 테스트")
        print("=" * 60)
        
        self.test_create_project()
        self.test_read_projects()
        self.test_folders()
        self.test_statistics()
        
        print("\n" + "=" * 60)
        print("[COMPLETE] 모든 테스트 완료!")
        
        # 연결 종료
        self.conn.close()
        
        print("\n다음 단계:")
        print("1. GUI에서 프로젝트 생성/삭제 테스트")
        print("2. 장비 상태 모니터링 기능 추가")
        print("3. Arduino 포트 스캔 기능 구현")

if __name__ == "__main__":
    tester = SimpleTest()
    tester.run_tests()