"""
Arduino Code Templates - Simple, practical templates for common tasks
Focus on reusable, working code snippets
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import os
from datetime import datetime

class ArduinoTemplates:
    def __init__(self, parent_frame):
        self.parent = parent_frame
        
        # Template categories and code
        self.templates = {
            "Basic": {
                "Empty Sketch": self.get_empty_template(),
                "Blink LED": self.get_blink_template(),
                "Serial Monitor": self.get_serial_template()
            },
            "Sensors": {
                "Ultrasonic Sensor": self.get_ultrasonic_template(),
                "Temperature Sensor": self.get_temperature_template(),
                "Button Input": self.get_button_template()
            },
            "Actuators": {
                "Servo Control": self.get_servo_template(),
                "Motor Control": self.get_motor_template(),
                "Buzzer Sounds": self.get_buzzer_template()
            },
            "Communication": {
                "Serial Commands": self.get_serial_command_template(),
                "I2C Basic": self.get_i2c_template()
            }
        }
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup template selection UI"""
        
        # Template selection
        select_frame = ttk.LabelFrame(self.parent, text="Code Templates", padding=10)
        select_frame.pack(fill=tk.X, pady=5)
        
        select_row = ttk.Frame(select_frame)
        select_row.pack(fill=tk.X)
        
        ttk.Label(select_row, text="Category:").pack(side=tk.LEFT)
        
        self.category_var = tk.StringVar()
        self.category_combo = ttk.Combobox(select_row, textvariable=self.category_var,
                                          values=list(self.templates.keys()),
                                          state='readonly', width=15)
        self.category_combo.pack(side=tk.LEFT, padx=(10, 0))
        self.category_combo.bind('<<ComboboxSelected>>', self.on_category_change)
        
        ttk.Label(select_row, text="Template:").pack(side=tk.LEFT, padx=(20, 0))
        
        self.template_var = tk.StringVar()
        self.template_combo = ttk.Combobox(select_row, textvariable=self.template_var,
                                          state='readonly', width=20)
        self.template_combo.pack(side=tk.LEFT, padx=(10, 0))
        self.template_combo.bind('<<ComboboxSelected>>', self.on_template_change)
        
        ttk.Button(select_row, text="Load", 
                  command=self.load_template).pack(side=tk.LEFT, padx=(20, 0))
        
        # Code editor
        editor_frame = ttk.LabelFrame(self.parent, text="Code Editor", padding=10)
        editor_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # Editor with line numbers (simple)
        editor_container = ttk.Frame(editor_frame)
        editor_container.pack(fill=tk.BOTH, expand=True)
        
        self.code_text = tk.Text(editor_container, wrap=tk.NONE, font=('Consolas', 10))
        
        # Scrollbars
        v_scroll = ttk.Scrollbar(editor_container, orient=tk.VERTICAL, command=self.code_text.yview)
        h_scroll = ttk.Scrollbar(editor_container, orient=tk.HORIZONTAL, command=self.code_text.xview)
        
        self.code_text.configure(yscrollcommand=v_scroll.set, xscrollcommand=h_scroll.set)
        
        # Grid layout for editor and scrollbars
        self.code_text.grid(row=0, column=0, sticky='nsew')
        v_scroll.grid(row=0, column=1, sticky='ns')
        h_scroll.grid(row=1, column=0, sticky='ew')
        
        editor_container.grid_rowconfigure(0, weight=1)
        editor_container.grid_columnconfigure(0, weight=1)
        
        # Action buttons
        action_frame = ttk.Frame(editor_frame)
        action_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(action_frame, text="Clear", 
                  command=self.clear_code).pack(side=tk.LEFT)
        
        ttk.Button(action_frame, text="Save As...", 
                  command=self.save_code).pack(side=tk.LEFT, padx=(10, 0))
        
        ttk.Button(action_frame, text="Copy to Clipboard", 
                  command=self.copy_to_clipboard).pack(side=tk.LEFT, padx=(10, 0))
        
        # Template info
        info_frame = ttk.LabelFrame(self.parent, text="Template Info", padding=5)
        info_frame.pack(fill=tk.X, pady=5)
        
        self.info_text = tk.Text(info_frame, height=3, wrap=tk.WORD, state=tk.DISABLED)
        self.info_text.pack(fill=tk.X)
        
        # Initialize
        if self.templates:
            first_category = list(self.templates.keys())[0]
            self.category_combo.set(first_category)
            self.on_category_change(None)
    
    def on_category_change(self, event):
        """Handle category selection change"""
        category = self.category_var.get()
        if category and category in self.templates:
            templates = list(self.templates[category].keys())
            self.template_combo['values'] = templates
            if templates:
                self.template_combo.set(templates[0])
                self.on_template_change(None)
    
    def on_template_change(self, event):
        """Handle template selection change"""
        self.update_template_info()
    
    def load_template(self):
        """Load selected template into editor"""
        category = self.category_var.get()
        template = self.template_var.get()
        
        if not category or not template:
            messagebox.showwarning("Warning", "Please select a category and template")
            return
        
        if category in self.templates and template in self.templates[category]:
            code = self.templates[category][template]
            self.code_text.delete(1.0, tk.END)
            self.code_text.insert(1.0, code)
            
            self.update_template_info()
    
    def update_template_info(self):
        """Update template information display"""
        category = self.category_var.get()
        template = self.template_var.get()
        
        info_text = f"Category: {category}\\nTemplate: {template}\\n"
        
        # Add specific info based on template
        if template == "Ultrasonic Sensor":
            info_text += "Requires: HC-SR04 sensor, connects to pins 9(trig) and 8(echo)"
        elif template == "Blink LED":
            info_text += "Basic LED blink example, uses built-in LED on pin 13"
        elif template == "Servo Control":
            info_text += "Requires: Servo library, connects to pin 9"
        elif template == "Temperature Sensor":
            info_text += "For analog temperature sensors like TMP36, connects to A0"
        else:
            info_text += "Standard Arduino template"
        
        self.info_text.config(state=tk.NORMAL)
        self.info_text.delete(1.0, tk.END)
        self.info_text.insert(1.0, info_text)
        self.info_text.config(state=tk.DISABLED)
    
    def clear_code(self):
        """Clear the code editor"""
        self.code_text.delete(1.0, tk.END)
    
    def save_code(self):
        """Save code to file"""
        code = self.code_text.get(1.0, tk.END)
        if not code.strip():
            messagebox.showwarning("Warning", "No code to save")
            return
        
        filename = filedialog.asksaveasfilename(
            defaultextension=".ino",
            filetypes=[("Arduino files", "*.ino"), ("C++ files", "*.cpp"), ("All files", "*.*")]
        )
        
        if filename:
            try:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(code)
                messagebox.showinfo("Success", f"Code saved to {filename}")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save file:\\n{str(e)}")
    
    def copy_to_clipboard(self):
        """Copy code to clipboard"""
        code = self.code_text.get(1.0, tk.END)
        if not code.strip():
            messagebox.showwarning("Warning", "No code to copy")
            return
        
        try:
            self.parent.clipboard_clear()
            self.parent.clipboard_append(code)
            messagebox.showinfo("Success", "Code copied to clipboard")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to copy to clipboard:\\n{str(e)}")
    
    # Template definitions
    def get_empty_template(self):
        return '''/*
  Empty Arduino Sketch
  Created: ''' + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + '''
*/

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Your initialization code here
  
}

void loop() {
  // Your main code here, runs repeatedly
  
}'''
    
    def get_blink_template(self):
        return '''/*
  Blink LED Example
  Blinks the built-in LED on pin 13
*/

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);  // Turn LED on
  delay(1000);                      // Wait 1 second
  digitalWrite(LED_BUILTIN, LOW);   // Turn LED off
  delay(1000);                      // Wait 1 second
}'''
    
    def get_serial_template(self):
        return '''/*
  Serial Monitor Example
  Demonstrates serial communication
*/

void setup() {
  Serial.begin(9600);
  Serial.println("Arduino Serial Monitor Test");
  Serial.println("Type commands and press Enter");
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readString();
    command.trim();
    
    Serial.print("Received: ");
    Serial.println(command);
    
    // Process commands
    if (command == "ping") {
      Serial.println("pong");
    } else if (command == "info") {
      Serial.println("Arduino is running");
    } else {
      Serial.println("Unknown command");
    }
  }
}'''
    
    def get_ultrasonic_template(self):
        return '''/*
  Ultrasonic Sensor (HC-SR04) Example
  Measures distance and prints to serial
*/

#define TRIG_PIN 9
#define ECHO_PIN 8

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println("Ultrasonic Distance Sensor");
}

void loop() {
  long duration, distance;
  
  // Send trigger pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read echo
  duration = pulseIn(ECHO_PIN, HIGH);
  distance = duration / 58.2;  // Convert to cm
  
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  delay(500);
}'''
    
    def get_temperature_template(self):
        return '''/*
  Temperature Sensor (TMP36) Example
  Reads analog temperature sensor
*/

#define TEMP_PIN A0

void setup() {
  Serial.begin(9600);
  Serial.println("Temperature Monitor");
}

void loop() {
  int reading = analogRead(TEMP_PIN);
  
  // Convert to voltage (5V reference)
  float voltage = reading * 5.0 / 1024.0;
  
  // Convert to temperature (TMP36 formula)
  float temperature = (voltage - 0.5) * 100.0;
  
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print("°C (");
  Serial.print(temperature * 9.0 / 5.0 + 32.0);
  Serial.println("°F)");
  
  delay(1000);
}'''
    
    def get_button_template(self):
        return '''/*
  Button Input Example
  Reads button state and controls LED
*/

#define BUTTON_PIN 2
#define LED_PIN 13

int buttonState = 0;
int lastButtonState = 0;
bool ledState = false;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Use internal pullup
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Button Test - Press to toggle LED");
}

void loop() {
  buttonState = digitalRead(BUTTON_PIN);
  
  // Check for button press (LOW when pressed due to pullup)
  if (buttonState == LOW && lastButtonState == HIGH) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    
    Serial.print("Button pressed - LED ");
    Serial.println(ledState ? "ON" : "OFF");
    
    delay(50);  // Debounce delay
  }
  
  lastButtonState = buttonState;
}'''
    
    def get_servo_template(self):
        return '''/*
  Servo Motor Control Example
  Sweeps servo back and forth
*/

#include <Servo.h>

Servo myServo;
int pos = 0;

void setup() {
  Serial.begin(9600);
  myServo.attach(9);  // Servo on pin 9
  Serial.println("Servo Control Test");
}

void loop() {
  // Sweep from 0 to 180 degrees
  for (pos = 0; pos <= 180; pos += 1) {
    myServo.write(pos);
    delay(15);
  }
  
  // Sweep from 180 to 0 degrees
  for (pos = 180; pos >= 0; pos -= 1) {
    myServo.write(pos);
    delay(15);
  }
}'''
    
    def get_motor_template(self):
        return '''/*
  DC Motor Control Example
  Controls motor speed and direction
*/

#define MOTOR_PIN1 3  // PWM pin
#define MOTOR_PIN2 4  // Direction pin

void setup() {
  Serial.begin(9600);
  pinMode(MOTOR_PIN1, OUTPUT);
  pinMode(MOTOR_PIN2, OUTPUT);
  Serial.println("Motor Control Test");
}

void loop() {
  // Forward at different speeds
  Serial.println("Forward - Slow");
  digitalWrite(MOTOR_PIN2, HIGH);
  analogWrite(MOTOR_PIN1, 100);
  delay(2000);
  
  Serial.println("Forward - Fast");
  analogWrite(MOTOR_PIN1, 255);
  delay(2000);
  
  // Stop
  Serial.println("Stop");
  analogWrite(MOTOR_PIN1, 0);
  delay(1000);
  
  // Reverse
  Serial.println("Reverse");
  digitalWrite(MOTOR_PIN2, LOW);
  analogWrite(MOTOR_PIN1, 150);
  delay(2000);
  
  // Stop
  analogWrite(MOTOR_PIN1, 0);
  delay(1000);
}'''
    
    def get_buzzer_template(self):
        return '''/*
  Buzzer/Speaker Example
  Plays different tones
*/

#define BUZZER_PIN 8

void setup() {
  Serial.begin(9600);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.println("Buzzer Test");
}

void loop() {
  // Play scale
  int notes[] = {262, 294, 330, 349, 392, 440, 494, 523};  // C major scale
  String noteNames[] = {"C", "D", "E", "F", "G", "A", "B", "C"};
  
  for (int i = 0; i < 8; i++) {
    Serial.print("Playing: ");
    Serial.println(noteNames[i]);
    
    tone(BUZZER_PIN, notes[i], 500);
    delay(600);
  }
  
  noTone(BUZZER_PIN);
  delay(2000);
}'''
    
    def get_serial_command_template(self):
        return '''/*
  Serial Command Processing
  Processes multiple commands from serial input
*/

String inputString = "";
boolean stringComplete = false;

void setup() {
  Serial.begin(9600);
  Serial.println("Arduino Command Processor");
  Serial.println("Commands: help, led_on, led_off, status, ping");
  inputString.reserve(200);
}

void loop() {
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    if (inChar == '\\n') {
      stringComplete = true;
    } else {
      inputString += inChar;
    }
  }
}

void processCommand(String command) {
  command.trim();
  command.toLowerCase();
  
  if (command == "help") {
    Serial.println("Available commands:");
    Serial.println("  help - Show this help");
    Serial.println("  led_on - Turn LED on");
    Serial.println("  led_off - Turn LED off");
    Serial.println("  status - Show system status");
    Serial.println("  ping - Respond with pong");
    
  } else if (command == "led_on") {
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.println("LED ON");
    
  } else if (command == "led_off") {
    digitalWrite(LED_BUILTIN, LOW);
    Serial.println("LED OFF");
    
  } else if (command == "status") {
    Serial.println("System Status: OK");
    Serial.print("Uptime: ");
    Serial.print(millis());
    Serial.println(" ms");
    
  } else if (command == "ping") {
    Serial.println("pong");
    
  } else {
    Serial.print("Unknown command: ");
    Serial.println(command);
  }
}'''
    
    def get_i2c_template(self):
        return '''/*
  I2C Communication Example
  Basic I2C scanner and communication
*/

#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  Serial.println("I2C Scanner and Test");
  
  scanI2C();
}

void loop() {
  // Main loop - add your I2C communication here
  delay(5000);
  Serial.println("Scanning again...");
  scanI2C();
}

void scanI2C() {
  byte error, address;
  int nDevices = 0;
  
  Serial.println("Scanning I2C bus...");
  
  for(address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    
    if (error == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) Serial.print("0");
      Serial.print(address, HEX);
      Serial.println(" !");
      nDevices++;
    }
  }
  
  if (nDevices == 0) {
    Serial.println("No I2C devices found");
  } else {
    Serial.print("Found ");
    Serial.print(nDevices);
    Serial.println(" devices");
  }
}'''

# Test standalone
if __name__ == "__main__":
    root = tk.Tk()
    root.title("Arduino Code Templates")
    root.geometry("800x700")
    
    style = ttk.Style()
    style.theme_use('clam')
    
    templates = ArduinoTemplates(root)
    root.mainloop()