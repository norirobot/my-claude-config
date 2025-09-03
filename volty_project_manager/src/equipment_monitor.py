"""
Equipment Monitor - Stage 1: Basic display functionality
Monitor user's actual equipment: Fusion 360, Bambu Lab printers, 3D scanners, Arduino
"""

import tkinter as tk
from tkinter import ttk
import psutil
import serial.tools.list_ports
import subprocess
import threading
import time
from datetime import datetime

class EquipmentMonitor:
    def __init__(self, parent_frame):
        self.parent = parent_frame
        self.monitoring = False
        self.monitor_thread = None
        
        # Equipment status
        self.equipment_status = {
            'fusion_360': False,
            'arduino_ports': [],
            'printers': {
                'p1sc_1': 'offline',
                'p1sc_2': 'offline', 
                'p1sc_3': 'offline',
                'p1sc_4': 'offline'
            },
            'scanners': {
                'pop2': 'disconnected',
                'einscan': 'disconnected'
            }
        }
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup equipment monitoring UI"""
        
        # Main frame
        main_frame = ttk.Frame(self.parent)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Title
        title_frame = ttk.Frame(main_frame)
        title_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(title_frame, text="Equipment Monitor", 
                 font=('Arial', 12, 'bold')).pack(side=tk.LEFT)
        
        self.monitor_button = ttk.Button(title_frame, text="Start Monitor", 
                                        command=self.toggle_monitoring)
        self.monitor_button.pack(side=tk.RIGHT)
        
        # Equipment sections
        self.setup_fusion_section(main_frame)
        self.setup_printer_section(main_frame) 
        self.setup_scanner_section(main_frame)
        self.setup_arduino_section(main_frame)
        
        # Status log
        self.setup_log_section(main_frame)
    
    def setup_fusion_section(self, parent):
        """Fusion 360 monitoring section"""
        fusion_frame = ttk.LabelFrame(parent, text="Fusion 360", padding=5)
        fusion_frame.pack(fill=tk.X, pady=2)
        
        status_frame = ttk.Frame(fusion_frame)
        status_frame.pack(fill=tk.X)
        
        ttk.Label(status_frame, text="Status:").pack(side=tk.LEFT)
        self.fusion_status = ttk.Label(status_frame, text="Checking...", 
                                      foreground='orange')
        self.fusion_status.pack(side=tk.LEFT, padx=(5, 0))
        
        ttk.Button(status_frame, text="Launch", 
                  command=self.launch_fusion).pack(side=tk.RIGHT)
    
    def setup_printer_section(self, parent):
        """Bambu Lab P1SC printers section"""
        printer_frame = ttk.LabelFrame(parent, text="Bambu Lab P1SC Printers (4x)", padding=5)
        printer_frame.pack(fill=tk.X, pady=2)
        
        # Create status labels for 4 printers
        self.printer_labels = {}
        for i in range(4):
            printer_row = ttk.Frame(printer_frame)
            printer_row.pack(fill=tk.X, pady=1)
            
            ttk.Label(printer_row, text=f"P1SC #{i+1}:").pack(side=tk.LEFT, padx=(0, 5))
            
            status_label = ttk.Label(printer_row, text="Offline", foreground='gray')
            status_label.pack(side=tk.LEFT)
            
            # Placeholder for future controls
            ttk.Button(printer_row, text="Connect", state='disabled', 
                      width=8).pack(side=tk.RIGHT)
            
            self.printer_labels[f'p1sc_{i+1}'] = status_label
    
    def setup_scanner_section(self, parent):
        """3D scanners section"""
        scanner_frame = ttk.LabelFrame(parent, text="3D Scanners", padding=5)
        scanner_frame.pack(fill=tk.X, pady=2)
        
        # POP2 Scanner
        pop2_row = ttk.Frame(scanner_frame)
        pop2_row.pack(fill=tk.X, pady=1)
        
        ttk.Label(pop2_row, text="Revopoint POP2:").pack(side=tk.LEFT, padx=(0, 5))
        self.pop2_status = ttk.Label(pop2_row, text="Disconnected", foreground='gray')
        self.pop2_status.pack(side=tk.LEFT)
        
        ttk.Button(pop2_row, text="Scan", state='disabled', 
                  width=8).pack(side=tk.RIGHT)
        
        # EinScan Pro
        einscan_row = ttk.Frame(scanner_frame)
        einscan_row.pack(fill=tk.X, pady=1)
        
        ttk.Label(einscan_row, text="EinScan-Pro:").pack(side=tk.LEFT, padx=(0, 5))
        self.einscan_status = ttk.Label(einscan_row, text="Disconnected", foreground='gray')
        self.einscan_status.pack(side=tk.LEFT)
        
        ttk.Button(einscan_row, text="Scan", state='disabled', 
                  width=8).pack(side=tk.RIGHT)
    
    def setup_arduino_section(self, parent):
        """Arduino section"""
        arduino_frame = ttk.LabelFrame(parent, text="Arduino", padding=5)
        arduino_frame.pack(fill=tk.X, pady=2)
        
        port_row = ttk.Frame(arduino_frame)
        port_row.pack(fill=tk.X)
        
        ttk.Label(port_row, text="Ports:").pack(side=tk.LEFT, padx=(0, 5))
        
        self.arduino_ports_text = ttk.Label(port_row, text="Scanning...", foreground='orange')
        self.arduino_ports_text.pack(side=tk.LEFT)
        
        ttk.Button(port_row, text="Refresh", 
                  command=self.scan_arduino_ports).pack(side=tk.RIGHT)
    
    def setup_log_section(self, parent):
        """Status log section"""
        log_frame = ttk.LabelFrame(parent, text="Activity Log", padding=5)
        log_frame.pack(fill=tk.BOTH, expand=True, pady=(5, 0))
        
        # Log text with scrollbar
        log_container = ttk.Frame(log_frame)
        log_container.pack(fill=tk.BOTH, expand=True)
        
        self.log_text = tk.Text(log_container, height=8, wrap=tk.WORD, state=tk.DISABLED)
        scrollbar = ttk.Scrollbar(log_container, orient=tk.VERTICAL, command=self.log_text.yview)
        self.log_text.configure(yscrollcommand=scrollbar.set)
        
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Clear button
        ttk.Button(log_frame, text="Clear Log", 
                  command=self.clear_log).pack(anchor=tk.E, pady=(5, 0))
        
        # Initial log
        self.add_log("Equipment monitor initialized")
    
    def toggle_monitoring(self):
        """Start/stop equipment monitoring"""
        if not self.monitoring:
            self.start_monitoring()
        else:
            self.stop_monitoring()
    
    def start_monitoring(self):
        """Start background monitoring"""
        self.monitoring = True
        self.monitor_button.config(text="Stop Monitor", style='Accent.TButton')
        
        # Start monitoring thread
        self.monitor_thread = threading.Thread(target=self.monitor_loop, daemon=True)
        self.monitor_thread.start()
        
        self.add_log("Started equipment monitoring")
    
    def stop_monitoring(self):
        """Stop background monitoring"""
        self.monitoring = False
        self.monitor_button.config(text="Start Monitor", style='TButton')
        self.add_log("Stopped equipment monitoring")
    
    def monitor_loop(self):
        """Main monitoring loop"""
        while self.monitoring:
            try:
                # Check Fusion 360
                self.check_fusion_360()
                
                # Check Arduino ports
                self.scan_arduino_ports()
                
                # Check printers (placeholder for future network discovery)
                self.check_printers()
                
                # Check scanners (placeholder)
                self.check_scanners()
                
                time.sleep(5)  # Check every 5 seconds
                
            except Exception as e:
                self.add_log(f"Monitor error: {str(e)}")
                time.sleep(10)  # Wait longer on error
    
    def check_fusion_360(self):
        """Check if Fusion 360 is running"""
        try:
            fusion_running = False
            
            for process in psutil.process_iter(['name']):
                try:
                    if 'Fusion360' in process.info['name']:
                        fusion_running = True
                        break
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            # Update status
            current_status = self.equipment_status['fusion_360']
            if fusion_running != current_status:
                self.equipment_status['fusion_360'] = fusion_running
                
                if fusion_running:
                    self.fusion_status.config(text="Running", foreground='green')
                    self.add_log("Fusion 360 detected")
                else:
                    self.fusion_status.config(text="Not running", foreground='red')
                    self.add_log("Fusion 360 not running")
                    
        except Exception as e:
            self.fusion_status.config(text="Error checking", foreground='red')
            self.add_log(f"Fusion 360 check error: {str(e)}")
    
    def scan_arduino_ports(self):
        """Scan for Arduino ports"""
        try:
            ports = serial.tools.list_ports.comports()
            arduino_ports = []
            
            for port in ports:
                # Look for Arduino-like devices
                if any(keyword in (port.description or '').lower() 
                      for keyword in ['arduino', 'ch340', 'ch341', 'ftdi', 'cp210']):
                    arduino_ports.append(port.device)
            
            # Update display
            current_ports = self.equipment_status['arduino_ports']
            if arduino_ports != current_ports:
                self.equipment_status['arduino_ports'] = arduino_ports
                
                if arduino_ports:
                    ports_text = f"Found: {', '.join(arduino_ports)}"
                    self.arduino_ports_text.config(text=ports_text, foreground='green')
                    self.add_log(f"Arduino ports: {', '.join(arduino_ports)}")
                else:
                    self.arduino_ports_text.config(text="None found", foreground='gray')
                    if current_ports:  # Only log if we had ports before
                        self.add_log("No Arduino ports found")
                        
        except Exception as e:
            self.arduino_ports_text.config(text="Error scanning", foreground='red')
            self.add_log(f"Arduino scan error: {str(e)}")
    
    def check_printers(self):
        """Check printer status (placeholder for network discovery)"""
        # Future implementation: scan network for Bambu Lab printers
        # For now, just simulate checking
        pass
    
    def check_scanners(self):
        """Check scanner status (placeholder)"""
        # Future implementation: check for scanner software/drivers
        pass
    
    def launch_fusion(self):
        """Try to launch Fusion 360"""
        try:
            self.add_log("Attempting to launch Fusion 360...")
            
            # Common Fusion 360 installation paths
            fusion_paths = [
                r"C:\Users\{}\AppData\Local\Autodesk\webdeploy\production\*.exe".format(
                    os.environ.get('USERNAME', '')),
                r"C:\Program Files\Autodesk\Fusion 360\Fusion360.exe"
            ]
            
            launched = False
            for path_pattern in fusion_paths:
                try:
                    import glob
                    matches = glob.glob(path_pattern)
                    if matches:
                        subprocess.Popen(matches[0])
                        launched = True
                        break
                except:
                    continue
            
            if launched:
                self.add_log("Fusion 360 launch attempted")
            else:
                self.add_log("Fusion 360 executable not found")
                
        except Exception as e:
            self.add_log(f"Launch error: {str(e)}")
    
    def add_log(self, message):
        """Add message to log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_message = f"[{timestamp}] {message}\n"
        
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, log_message)
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
    
    def clear_log(self):
        """Clear the log"""
        self.log_text.config(state=tk.NORMAL)
        self.log_text.delete(1.0, tk.END)
        self.log_text.config(state=tk.DISABLED)
        self.add_log("Log cleared")

# Test the equipment monitor standalone
if __name__ == "__main__":
    import os
    
    root = tk.Tk()
    root.title("Equipment Monitor Test")
    root.geometry("600x700")
    
    # Style
    style = ttk.Style()
    style.theme_use('clam')
    
    monitor = EquipmentMonitor(root)
    
    print("Equipment Monitor Test - Check console and GUI")
    root.mainloop()