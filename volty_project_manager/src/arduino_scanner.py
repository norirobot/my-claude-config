"""
Arduino Scanner - Practical port scanning and basic communication test
Only includes working, useful features
"""

import tkinter as tk
from tkinter import ttk, messagebox
import serial
import serial.tools.list_ports
import threading
import time
from datetime import datetime

class ArduinoScanner:
    def __init__(self, parent_frame):
        self.parent = parent_frame
        self.serial_connection = None
        
        self.setup_ui()
        self.scan_ports()
    
    def setup_ui(self):
        """Setup Arduino scanner UI"""
        
        # Port selection
        port_frame = ttk.LabelFrame(self.parent, text="Port Selection", padding=10)
        port_frame.pack(fill=tk.X, pady=5)
        
        select_row = ttk.Frame(port_frame)
        select_row.pack(fill=tk.X)
        
        ttk.Label(select_row, text="Port:").pack(side=tk.LEFT)
        
        self.port_var = tk.StringVar()
        self.port_combo = ttk.Combobox(select_row, textvariable=self.port_var, 
                                      state='readonly', width=15)
        self.port_combo.pack(side=tk.LEFT, padx=(10, 0))
        
        ttk.Button(select_row, text="Refresh", 
                  command=self.scan_ports).pack(side=tk.LEFT, padx=(10, 0))
        
        # Connection controls
        control_frame = ttk.LabelFrame(self.parent, text="Connection Test", padding=10)
        control_frame.pack(fill=tk.X, pady=5)
        
        control_row = ttk.Frame(control_frame)
        control_row.pack(fill=tk.X)
        
        self.connect_btn = ttk.Button(control_row, text="Test Connection", 
                                     command=self.test_connection)
        self.connect_btn.pack(side=tk.LEFT)
        
        self.disconnect_btn = ttk.Button(control_row, text="Disconnect", 
                                        command=self.disconnect, state='disabled')
        self.disconnect_btn.pack(side=tk.LEFT, padx=(10, 0))
        
        # Connection status
        self.status_label = ttk.Label(control_row, text="Disconnected", foreground='gray')
        self.status_label.pack(side=tk.LEFT, padx=(20, 0))
        
        # Baud rate selection
        baud_row = ttk.Frame(control_frame)
        baud_row.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Label(baud_row, text="Baud Rate:").pack(side=tk.LEFT)
        
        self.baud_var = tk.StringVar(value='9600')
        baud_combo = ttk.Combobox(baud_row, textvariable=self.baud_var, 
                                 values=['9600', '115200', '57600', '38400', '19200'],
                                 state='readonly', width=10)
        baud_combo.pack(side=tk.LEFT, padx=(10, 0))
        
        # Simple communication test
        comm_frame = ttk.LabelFrame(self.parent, text="Communication Test", padding=10)
        comm_frame.pack(fill=tk.X, pady=5)
        
        test_row = ttk.Frame(comm_frame)
        test_row.pack(fill=tk.X)
        
        ttk.Button(test_row, text="Send 'ping'", 
                  command=self.send_ping).pack(side=tk.LEFT)
        
        ttk.Button(test_row, text="Request Info", 
                  command=self.request_info).pack(side=tk.LEFT, padx=(10, 0))
        
        # Response display
        response_frame = ttk.Frame(comm_frame)
        response_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Label(response_frame, text="Response:").pack(anchor=tk.W)
        
        self.response_text = tk.Text(response_frame, height=4, wrap=tk.WORD)
        response_scroll = ttk.Scrollbar(response_frame, orient=tk.VERTICAL, 
                                       command=self.response_text.yview)
        self.response_text.configure(yscrollcommand=response_scroll.set)
        
        self.response_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        response_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Port info display
        info_frame = ttk.LabelFrame(self.parent, text="Port Information", padding=10)
        info_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.info_text = tk.Text(info_frame, height=8, wrap=tk.WORD, state=tk.DISABLED)
        info_scroll = ttk.Scrollbar(info_frame, orient=tk.VERTICAL, command=self.info_text.yview)
        self.info_text.configure(yscrollcommand=info_scroll.set)
        
        self.info_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        info_scroll.pack(side=tk.RIGHT, fill=tk.Y)
    
    def scan_ports(self):
        """Scan for available serial ports"""
        try:
            ports = serial.tools.list_ports.comports()
            port_list = []
            
            self.clear_info()
            self.add_info("=== Port Scan Results ===")
            
            if not ports:
                self.add_info("No serial ports found")
                self.port_combo['values'] = []
                return
            
            for port in ports:
                port_list.append(port.device)
                
                # Display port information
                self.add_info(f"\nPort: {port.device}")
                if port.description:
                    self.add_info(f"  Description: {port.description}")
                if port.manufacturer:
                    self.add_info(f"  Manufacturer: {port.manufacturer}")
                if port.product:
                    self.add_info(f"  Product: {port.product}")
                if hasattr(port, 'vid') and port.vid:
                    self.add_info(f"  VID:PID: {port.vid:04X}:{port.pid:04X}")
                
                # Try to identify Arduino boards
                arduino_type = self.identify_arduino(port)
                if arduino_type:
                    self.add_info(f"  Likely: {arduino_type}")
            
            self.port_combo['values'] = port_list
            if port_list:
                self.port_combo.set(port_list[0])
                
            self.add_info(f"\nFound {len(port_list)} total ports")
            
        except Exception as e:
            self.add_info(f"Port scan error: {str(e)}")
    
    def identify_arduino(self, port):
        """Try to identify Arduino board type based on port info"""
        desc = (port.description or '').lower()
        mfg = (port.manufacturer or '').lower()
        
        # Common Arduino identifiers
        if 'arduino' in desc or 'arduino' in mfg:
            if 'uno' in desc:
                return "Arduino Uno"
            elif 'nano' in desc:
                return "Arduino Nano"
            elif 'mega' in desc:
                return "Arduino Mega"
            else:
                return "Arduino (unknown model)"
        
        # Common USB-to-serial chips used by Arduino clones
        if 'ch340' in desc or 'ch341' in desc:
            return "Arduino clone (CH340/CH341)"
        elif 'cp210' in desc or 'cp2102' in desc:
            return "Arduino clone (CP210x)"
        elif 'ftdi' in desc:
            return "Arduino clone (FTDI)"
        
        return None
    
    def test_connection(self):
        """Test connection to selected port"""
        port = self.port_var.get()
        if not port:
            messagebox.showwarning("Warning", "Please select a port first")
            return
        
        try:
            baud = int(self.baud_var.get())
            
            self.add_response(f"Connecting to {port} at {baud} baud...")
            
            self.serial_connection = serial.Serial(
                port=port,
                baudrate=baud,
                timeout=2,
                write_timeout=2
            )
            
            # Give Arduino time to reset (if it's an Arduino)
            time.sleep(2)
            
            # Test if we can read/write
            self.serial_connection.write(b'\n')  # Send newline
            
            self.status_label.config(text="Connected", foreground='green')
            self.connect_btn.config(state='disabled')
            self.disconnect_btn.config(state='normal')
            
            self.add_response(f"Connected successfully to {port}")
            
        except serial.SerialException as e:
            self.add_response(f"Connection failed: {str(e)}")
            messagebox.showerror("Connection Error", f"Failed to connect to {port}:\n{str(e)}")
        except Exception as e:
            self.add_response(f"Unexpected error: {str(e)}")
    
    def disconnect(self):
        """Disconnect from serial port"""
        try:
            if self.serial_connection and self.serial_connection.is_open:
                self.serial_connection.close()
            
            self.serial_connection = None
            self.status_label.config(text="Disconnected", foreground='gray')
            self.connect_btn.config(state='normal')
            self.disconnect_btn.config(state='disabled')
            
            self.add_response("Disconnected")
            
        except Exception as e:
            self.add_response(f"Disconnect error: {str(e)}")
    
    def send_ping(self):
        """Send a simple ping message"""
        if not self.serial_connection or not self.serial_connection.is_open:
            messagebox.showwarning("Warning", "Not connected to any port")
            return
        
        try:
            self.add_response("Sending: ping")
            self.serial_connection.write(b'ping\n')
            
            # Try to read response
            time.sleep(0.5)
            if self.serial_connection.in_waiting > 0:
                response = self.serial_connection.read(self.serial_connection.in_waiting)
                self.add_response(f"Received: {response.decode('utf-8', errors='ignore')}")
            else:
                self.add_response("No response received")
                
        except Exception as e:
            self.add_response(f"Send error: {str(e)}")
    
    def request_info(self):
        """Request device information"""
        if not self.serial_connection or not self.serial_connection.is_open:
            messagebox.showwarning("Warning", "Not connected to any port")
            return
        
        try:
            # Clear any pending data
            self.serial_connection.reset_input_buffer()
            
            # Send common Arduino info commands
            commands = [b'?\n', b'info\n', b'version\n', b'hello\n']
            
            for cmd in commands:
                self.add_response(f"Sending: {cmd.decode().strip()}")
                self.serial_connection.write(cmd)
                time.sleep(0.5)
                
                if self.serial_connection.in_waiting > 0:
                    response = self.serial_connection.read_all()
                    if response:
                        self.add_response(f"Response: {response.decode('utf-8', errors='ignore').strip()}")
                        break
            else:
                self.add_response("Device doesn't respond to standard commands")
                
        except Exception as e:
            self.add_response(f"Info request error: {str(e)}")
    
    def add_response(self, message):
        """Add message to response area"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        response_msg = f"[{timestamp}] {message}\n"
        
        self.response_text.insert(tk.END, response_msg)
        self.response_text.see(tk.END)
    
    def add_info(self, message):
        """Add message to info area"""
        self.info_text.config(state=tk.NORMAL)
        self.info_text.insert(tk.END, message + '\n')
        self.info_text.see(tk.END)
        self.info_text.config(state=tk.DISABLED)
    
    def clear_info(self):
        """Clear info area"""
        self.info_text.config(state=tk.NORMAL)
        self.info_text.delete(1.0, tk.END)
        self.info_text.config(state=tk.DISABLED)

# Test standalone
if __name__ == "__main__":
    root = tk.Tk()
    root.title("Arduino Port Scanner")
    root.geometry("600x600")
    
    style = ttk.Style()
    style.theme_use('clam')
    
    scanner = ArduinoScanner(root)
    
    # Cleanup on close
    def on_closing():
        if scanner.serial_connection:
            scanner.disconnect()
        root.destroy()
    
    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()