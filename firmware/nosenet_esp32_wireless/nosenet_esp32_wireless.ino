/*
 * NoseNet — ESP32 Wireless Firmware (Bluetooth BLE & Wi-Fi)
 * ------------------------------------------------------------
 * Project: IoT-Based Cake Freshness and Adulteration Detection
 * Hardware:
 *   - Microcontroller: ESP32-WROOM-32
 *   - Sensor: SmartElex BME688 (I2C 0x76: SDA=21, SCL=22, 3.3V)
 * Wireless Capabilities:
 *   1. Bluetooth Low Energy (BLE) — name: "NoseNet_ESP32"
 *   2. Wi-Fi Web Server — HTTP endpoints: /status and /api/run-test
 */

#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Adafruit_Sensor.h>
#include "Adafruit_BME680.h"

// --- CONFIGURATION ---
const char* WIFI_SSID = "YOUR_WIFI_NAME";        // Optional: Replace with your Wi-Fi or phone hotspot
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

#define BME688_I2C_ADDR 0x76
#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22

// Nordic UART Service UUIDs for Web Bluetooth compatibility
#define SERVICE_UUID           "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID_RX "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID_TX "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

Adafruit_BME680 bme;
WebServer server(80);

BLEServer *pServer = NULL;
BLECharacteristic *pTxCharacteristic = NULL;
bool deviceConnected = false;
bool sensorReady = false;

// Function prototypes
void triggerSensorTest(String cakeType);

// BLE Server Callbacks
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("[BLE] Web Dashboard Connected Wirelessly!");
    };
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("[BLE] Disconnected. Advertising restarted.");
      pServer->getAdvertising()->start();
    }
};

// BLE Characteristic Callbacks (Receives "RUN_TEST:Cake Type" command from website)
class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String rxValue = pCharacteristic->getValue().c_str();
      if (rxValue.length() > 0) {
        Serial.print("[BLE Command Received]: ");
        Serial.println(rxValue);
        
        if (rxValue.startsWith("RUN_TEST:")) {
          String cakeType = rxValue.substring(9);
          cakeType.trim();
          triggerSensorTest(cakeType);
        }
      }
    }
};

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=== NoseNet ESP32 Wireless Starting ===");

  // 1. Initialize Sensor
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  if (bme.begin(BME688_I2C_ADDR)) {
    sensorReady = true;
    bme.setTemperatureOversampling(BME680_OS_8X);
    bme.setHumidityOversampling(BME680_OS_2X);
    bme.setPressureOversampling(BME680_OS_4X);
    bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
    bme.setGasHeater(320, 150);
    Serial.println("[BME688] Sensor connected and ready at 0x76");
  } else {
    sensorReady = false;
    Serial.println("[BME688] Sensor not detected at 0x76. Running in wireless standby.");
  }

  // 2. Initialize Bluetooth Low Energy (BLE)
  BLEDevice::init("NoseNet_ESP32");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);
  pTxCharacteristic = pService->createCharacteristic(
                        CHARACTERISTIC_UUID_TX,
                        BLECharacteristic::PROPERTY_NOTIFY
                      );
  pTxCharacteristic->addDescriptor(new BLE2902());

  BLECharacteristic *pRxCharacteristic = pService->createCharacteristic(
                                           CHARACTERISTIC_UUID_RX,
                                           BLECharacteristic::PROPERTY_WRITE
                                         );
  pRxCharacteristic->setCallbacks(new MyCallbacks());

  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("[BLE] Bluetooth advertising as 'NoseNet_ESP32'");

  // 3. Initialize Wi-Fi (Optional Station mode + Soft Access Point)
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP("NoseNet_ESP32_WiFi", "nosenet123");
  Serial.print("[Wi-Fi AP] IP Address: ");
  Serial.println(WiFi.softAPIP());

  // Setup Web Server Routes for Wi-Fi communication
  server.on("/status", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    String json = "{\"status\":\"OK\",\"sensor\":" + String(sensorReady ? "true" : "false") + ",\"device\":\"NoseNet_ESP32\"}";
    server.send(200, "application/json", json);
  });

  server.on("/api/run-test", HTTP_POST, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    triggerSensorTest("WiFi Remote Trigger");
    server.send(200, "application/json", "{\"success\":true,\"message\":\"Test triggered on ESP32\"}");
  });

  server.enableCORS(true);
  server.begin();
  Serial.println("[HTTP Server] Started.");
}

void loop() {
  server.handleClient();
  delay(10);
}

// Executes when "Run Test" button is pressed on the website
void triggerSensorTest(String cakeType) {
  Serial.print(">>> TRIGGER SENSOR TEST FOR: ");
  Serial.println(cakeType);

  float temp = 25.0;
  float hum = 60.0;
  float pres = 715.0;
  uint32_t gasOhm = 25000;
  float gasKohm = 25.0;
  String status = "OK";

  if (sensorReady && bme.performReading()) {
    temp = bme.temperature;
    hum = bme.humidity;
    pres = bme.pressure / 100.0F;
    gasOhm = bme.gas_resistance;
    gasKohm = gasOhm / 1000.0F;
  } else {
    status = "SENSOR_ACCESSED";
  }

  // Construct JSON notification
  String payload = "{\"type\":\"reading\",\"cake\":\"" + cakeType +
                   "\",\"gas_kohm\":" + String(gasKohm, 2) +
                   ",\"gas_ohm\":" + String(gasOhm) +
                   ",\"temperature_C\":" + String(temp, 1) +
                   ",\"humidity_percent\":" + String(hum, 1) +
                   ",\"pressure_hPa\":" + String(pres, 1) +
                   ",\"status\":\"" + status + "\"}";

  Serial.println("[Telemetry Sent]: " + payload);

  // Send wirelessly via Bluetooth to connected website
  if (deviceConnected && pTxCharacteristic) {
    pTxCharacteristic->setValue(payload.c_str());
    pTxCharacteristic->notify();
  }
}
