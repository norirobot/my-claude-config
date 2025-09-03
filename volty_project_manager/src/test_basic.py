"""
Volty Project Manager - Basic functionality test (English version)
"""

import sqlite3
from pathlib import Path
from datetime import datetime

class BasicTest:
    def __init__(self):
        self.data_dir = Path("../data")
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize database
        self.init_database()
    
    def init_database(self):
        """Initialize test database"""
        db_path = self.data_dir / 'volty_simple.db'
        print(f"Database path: {db_path}")
        
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        
        # Create table
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
        print("[OK] Database initialized")
    
    def test_create_project(self):
        """Test project creation"""
        print("\n[TEST] Project creation...")
        
        test_projects = [
            ("Smith Machine Alignment", "Ultrasonic sensor bench alignment", "planning"),
            ("Squat Guide System", "Pressure sensor and angle measurement", "planning"),
            ("Exercise Counter", "Gyroscope-based rep counter", "active")
        ]
        
        for name, desc, status in test_projects:
            try:
                self.cursor.execute('''
                    INSERT OR IGNORE INTO projects (name, description, status, created_date)
                    VALUES (?, ?, ?, ?)
                ''', (name, desc, status, datetime.now().isoformat()))
                
                self.conn.commit()
                
                # Create project folder
                project_dir = self.data_dir / 'projects' / name
                project_dir.mkdir(parents=True, exist_ok=True)
                
                print(f"  [OK] Created: {name}")
                
            except Exception as e:
                print(f"  [ERROR] Failed: {name} - {str(e)}")
    
    def test_read_projects(self):
        """Test project reading"""
        print("\n[TEST] Reading project list...")
        
        try:
            self.cursor.execute('''
                SELECT name, status, created_date FROM projects 
                ORDER BY created_date DESC
            ''')
            
            projects = self.cursor.fetchall()
            
            if projects:
                print(f"  [INFO] Found {len(projects)} projects:")
                for name, status, created_date in projects:
                    print(f"    - {name} ({status})")
            else:
                print("  [INFO] No projects found")
                
        except Exception as e:
            print(f"  [ERROR] Read failed: {str(e)}")
    
    def test_folders(self):
        """Test folder structure"""
        print("\n[TEST] Checking project folders...")
        
        projects_dir = self.data_dir / 'projects'
        
        if projects_dir.exists():
            print(f"  [INFO] Projects root: {projects_dir}")
            
            for project_folder in projects_dir.iterdir():
                if project_folder.is_dir():
                    print(f"    - Folder: {project_folder.name}/")
                    
                    # Create and check subfolders
                    subfolders = ['fusion_files', 'arduino_code', 'stl_files', 'scan_files']
                    for subfolder in subfolders:
                        subfolder_path = project_folder / subfolder
                        subfolder_path.mkdir(exist_ok=True)
                        if subfolder_path.exists():
                            print(f"      - {subfolder}/")
        else:
            print(f"  [ERROR] Projects folder not found: {projects_dir}")
    
    def test_statistics(self):
        """Test database statistics"""
        print("\n[TEST] Database statistics...")
        
        try:
            # Total projects
            self.cursor.execute("SELECT COUNT(*) FROM projects")
            total = self.cursor.fetchone()[0]
            print(f"  [INFO] Total projects: {total}")
            
            # Count by status
            self.cursor.execute("SELECT status, COUNT(*) FROM projects GROUP BY status")
            status_counts = self.cursor.fetchall()
            
            for status, count in status_counts:
                print(f"    - {status}: {count}")
                
        except Exception as e:
            print(f"  [ERROR] Statistics failed: {str(e)}")
    
    def run_tests(self):
        """Run all tests"""
        print("=" * 60)
        print("Volty Project Manager - Basic Function Tests")
        print("=" * 60)
        
        self.test_create_project()
        self.test_read_projects()
        self.test_folders()
        self.test_statistics()
        
        print("\n" + "=" * 60)
        print("[COMPLETE] All tests finished!")
        
        # Close connection
        self.conn.close()
        
        print("\nNext steps:")
        print("1. Test GUI project creation/deletion")
        print("2. Add equipment monitoring features")
        print("3. Implement Arduino port scanning")

if __name__ == "__main__":
    tester = BasicTest()
    tester.run_tests()