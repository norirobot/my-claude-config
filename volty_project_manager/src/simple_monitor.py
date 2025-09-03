"""
Simple Equipment Monitor - Only practical, working features
Focus on: Fusion 360 process check, Arduino port detection
"""

import tkinter as tk
from tkinter import ttk
import psutil
import serial.tools.list_ports
import threading
import time
from datetime import datetime

class SimpleMonitor:
    def __init__(self, parent_frame):
        self.parent = parent_frame
        self.monitoring = False
        
        self.setup_ui()
        
        # Do initial scan
        self.check_fusion()
        self.scan_ports()
    
    def setup_ui(self):
        """Setup simple monitoring UI"""
        
        # Fusion 360 status
        fusion_frame = ttk.LabelFrame(self.parent, text="Fusion 360", padding=10)
        fusion_frame.pack(fill=tk.X, pady=5)
        
        fusion_row = ttk.Frame(fusion_frame)
        fusion_row.pack(fill=tk.X)
        
        ttk.Label(fusion_row, text="Status:").pack(side=tk.LEFT)
        self.fusion_status = ttk.Label(fusion_row, text="Checking...", foreground='orange')
        self.fusion_status.pack(side=tk.LEFT, padx=(10, 0))
        
        ttk.Button(fusion_row, text="Check", 
                  command=self.check_fusion).pack(side=tk.RIGHT)
        
        # Arduino ports
        arduino_frame = ttk.LabelFrame(self.parent, text="Arduino Ports", padding=10)
        arduino_frame.pack(fill=tk.X, pady=5)
        
        port_row = ttk.Frame(arduino_frame)
        port_row.pack(fill=tk.X)
        
        ttk.Label(port_row, text="Available:").pack(side=tk.LEFT)
        self.port_status = ttk.Label(port_row, text="Scanning...", foreground='orange')
        self.port_status.pack(side=tk.LEFT, padx=(10, 0))
        
        ttk.Button(port_row, text="Refresh", 
                  command=self.scan_ports).pack(side=tk.RIGHT)
        
        # Auto-monitoring toggle
        monitor_frame = ttk.Frame(self.parent)
        monitor_frame.pack(fill=tk.X, pady=10)
        
        self.auto_monitor = tk.BooleanVar()
        ttk.Checkbutton(monitor_frame, text="Auto-monitor every 10 seconds", 
                       variable=self.auto_monitor,
                       command=self.toggle_auto_monitor).pack(side=tk.LEFT)
        
        # Activity log
        log_frame = ttk.LabelFrame(self.parent, text="Activity", padding=5)
        log_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.log_text = tk.Text(log_frame, height=6, wrap=tk.WORD, state=tk.DISABLED)
        log_scroll = ttk.Scrollbar(log_frame, orient=tk.VERTICAL, command=self.log_text.yview)
        self.log_text.configure(yscrollcommand=log_scroll.set)
        
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        log_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.add_log("Simple monitor ready")
    
    def check_fusion(self):
        """Check if Fusion 360 is running"""
        try:
            fusion_found = False
            
            for process in psutil.process_iter(['name']):
                try:
                    if 'Fusion360' in process.info['name'] or 'fusion' in process.info['name'].lower():
                        fusion_found = True
                        break
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            if fusion_found:
                self.fusion_status.config(text="Running", foreground='green')
                self.add_log("Fusion 360 is running")
            else:
                self.fusion_status.config(text="Not running", foreground='gray')
                self.add_log("Fusion 360 not detected")
                
        except Exception as e:
            self.fusion_status.config(text="Check failed", foreground='red')
            self.add_log(f"Fusion check error: {str(e)}")
    
    def scan_ports(self):
        """Scan for Arduino/serial ports"""
        try:
            all_ports = serial.tools.list_ports.comports()
            
            if not all_ports:
                self.port_status.config(text="None found", foreground='gray')
                self.add_log("No serial ports detected")
                return
            
            # Show all available ports
            port_names = [port.device for port in all_ports]
            port_text = f"{len(port_names)} ports: {', '.join(port_names)}"
            
            self.port_status.config(text=port_text, foreground='green')
            self.add_log(f"Found ports: {', '.join(port_names)}")
            
            # Log detailed info
            for port in all_ports:
                if port.description and 'Standard' not in port.description:
                    self.add_log(f"  {port.device}: {port.description}")
                    
        except Exception as e:
            self.port_status.config(text="Scan failed", foreground='red')
            self.add_log(f"Port scan error: {str(e)}")
    
    def toggle_auto_monitor(self):
        """Toggle automatic monitoring"""
        if self.auto_monitor.get():
            self.start_auto_monitor()
        else:
            self.stop_auto_monitor()
    
    def start_auto_monitor(self):
        """Start automatic monitoring"""
        if not self.monitoring:
            self.monitoring = True
            self.monitor_thread = threading.Thread(target=self.auto_monitor_loop, daemon=True)
            self.monitor_thread.start()
            self.add_log("Started auto-monitoring")
    
    def stop_auto_monitor(self):
        """Stop automatic monitoring"""
        self.monitoring = False
        self.add_log("Stopped auto-monitoring")
    
    def auto_monitor_loop(self):
        """Auto-monitoring loop"""
        while self.monitoring and self.auto_monitor.get():
            try:
                self.check_fusion()
                self.scan_ports()
                time.sleep(10)  # Check every 10 seconds
            except Exception as e:
                self.add_log(f"Auto-monitor error: {str(e)}")
                break
    
    def add_log(self, message):
        """Add message to activity log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, log_entry)
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)

# Test standalone
if __name__ == "__main__":
    root = tk.Tk()
    root.title("Simple Equipment Monitor")
    root.geometry("500x400")
    
    style = ttk.Style()
    style.theme_use('clam')
    
    monitor = SimpleMonitor(root)
    root.mainloop()