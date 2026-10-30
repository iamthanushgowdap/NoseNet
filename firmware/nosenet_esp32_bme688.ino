/*
 * NoseNet — ESP32 + SmartElex BME688 Serial Firmware
 * ----------------------------------------------------
 * Project: IoT-Based Cake Freshness and Adulteration Testing System
 * Hardware:
 *   - Microcontroller: ESP32-WROOM-32 Development Board
 *   - Sensor: SmartElex BME688 Environmental & Gas Sensor
 *   - Communication: USB Serial @ 115200 baud
 *   - I2C Address: 0x76
 *   - Wiring:
 *       BME688 VCC  --> ESP32 3.3V
 *       BME688 GND  --> ESP32 GND
 *       BME688 SDA  --> ESP32 GPIO 21
 *       BME688 SCL  --> ESP32 GPIO 22
 *
 * Dependencies (install via Arduino Library Manager):
 *   - "Adafruit BME680 Library" by Adafruit
 *   - "Adafruit Unified Sensor" by Adafruit
 *
 * Output Protocol:
 *   Newline-delimited JSON (JSON-lines) format.
 *   One self-contained JSON object per line terminated with \n.
 */

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include "Adafruit_BME680.h"

// Hardware Pin Configuration
#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22
#define BME688_I2C_ADDR 0x76

// Sampling Interval (milliseconds)
#define SAMPLING_INTERVAL_MS 1000

// Initialize BME680/BME688 sensor object over I2C
Adafruit_BME680 bme;

// State tracking
unsigned long lastSampleTime = 0;
unsigned long sequenceNumber = 0;
bool sensorInitialized = false;

void setup() {
  // Initialize USB Serial communication at 115200 baud
  Serial.begin(115200);
  
  // Wait up to 2 seconds for serial port to open (helpful on native USB)
  unsigned long startWait = millis();
  while (!Serial && (millis() - startWait < 2000)) {
    delay(10);
  }

  // 1. Send Boot Event Message
  Serial.println("{\"type\":\"boot\",\"board\":\"ESP32-WROOM-32\",\"sensor\":\"BME688\",\"version\":\"1.0.0\",\"i2c_sda\":21,\"i2c_scl\":22,\"baud\":115200}");

  // 2. Initialize I2C with specified GPIO pins
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

  // 3. Initialize BME688 Sensor
  if (!bme.begin(BME688_I2C_ADDR)) {
    sensorInitialized = false;
    Serial.println("{\"type\":\"status\",\"sensor\":\"BME688\",\"initialized\":false,\"i2c_addr\":\"0x76\",\"message\":\"Failed to find BME688 sensor at I2C 0x76. Check wiring: SDA=21, SCL=22, 3.3V.\"}");
  } else {
    sensorInitialized = true;
    
    // Set oversampling and filter configuration
    bme.setTemperatureOversampling(BME680_OS_8X);
    bme.setHumidityOversampling(BME680_OS_2X);
    bme.setPressureOversampling(BME680_OS_4X);
    bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
    
    // Gas heater settings: 320 degrees Celsius for 150 milliseconds
    bme.setGasHeater(320, 150);

    Serial.println("{\"type\":\"status\",\"sensor\":\"BME688\",\"initialized\":true,\"i2c_addr\":\"0x76\",\"heater_temp_C\":320,\"heater_time_ms\":150,\"message\":\"BME688 sensor initialized and calibrated successfully.\"}");
  }
}

void loop() {
  unsigned long currentTime = millis();

  // Retry sensor initialization if it was not detected on boot
  if (!sensorInitialized) {
    if (currentTime - lastSampleTime >= 3000) {
      lastSampleTime = currentTime;
      if (bme.begin(BME688_I2C_ADDR)) {
        sensorInitialized = true;
        bme.setTemperatureOversampling(BME680_OS_8X);
        bme.setHumidityOversampling(BME680_OS_2X);
        bme.setPressureOversampling(BME680_OS_4X);
        bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
        bme.setGasHeater(320, 150);
        Serial.println("{\"type\":\"status\",\"sensor\":\"BME688\",\"initialized\":true,\"i2c_addr\":\"0x76\",\"message\":\"BME688 sensor reconnected and initialized.\"}");
      } else {
        Serial.println("{\"type\":\"error\",\"sensor\":\"BME688\",\"initialized\":false,\"message\":\"Sensor not detected. Verify connections to SDA (21) and SCL (22).\"}");
      }
    }
    return;
  }

  // Periodic sensor reading
  if (currentTime - lastSampleTime >= SAMPLING_INTERVAL_MS) {
    lastSampleTime = currentTime;
    sequenceNumber++;

    // Trigger BME688 reading
    if (!bme.performReading()) {
      Serial.print("{\"type\":\"reading_error\",\"seq\":");
      Serial.print(sequenceNumber);
      Serial.print(",\"elapsed_ms\":");
      Serial.print(currentTime);
      Serial.println(",\"message\":\"Sensor read failure or heater timeout\",\"status\":\"ERROR\"}");
      return;
    }

    // Extract measurements
    float tempC = bme.temperature;
    float humidity = bme.humidity;
    float pressureHpa = bme.pressure / 100.0F; // Convert Pa to hPa
    uint32_t gasOhm = bme.gas_resistance;
    float gasKohm = gasOhm / 1000.0F;

    // Format single line JSON object
    Serial.print("{\"type\":\"reading\"");
    Serial.print(",\"seq\":");
    Serial.print(sequenceNumber);
    Serial.print(",\"elapsed_ms\":");
    Serial.print(currentTime);
    Serial.print(",\"temperature_C\":");
    Serial.print(tempC, 2);
    Serial.print(",\"humidity_percent\":");
    Serial.print(humidity, 2);
    Serial.print(",\"pressure_hPa\":");
    Serial.print(pressureHpa, 2);
    Serial.print(",\"gas_resistance_ohm\":");
    Serial.print(gasOhm);
    Serial.print(",\"gas_resistance_kohm\":");
    Serial.print(gasKohm, 3);
    Serial.print(",\"status\":\"OK\"}");
    Serial.println(); // Crucial: Newline termination
  }
}
