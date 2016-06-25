/*

  listens for Serial commands

  ^10 5 1 0 1;

  must start with control char ^
  and end with semicolon ;

  will draw a magenta (red and blue on) pixel
  onto position 10, 5

*/
#include <Adafruit_GFX.h>   // Core graphics library
#include <RGBmatrixPanel.h> // Hardware-specific library

#define CLK 8  // MUST be on PORTB! (Use pin 11 on Mega)
#define LAT A3
#define OE  9
#define A   A0
#define B   A1
#define C   A2

#define controlChar 94 // ^

RGBmatrixPanel matrix(A, B, C, CLK, LAT, OE, false);

void setup() {
  Serial.begin(9600);
  matrix.begin();
  uint8_t r=0, g=0, b=0;
}

String getValue(String data, int index)
{
  char separator = ' ';
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length()-1;

  for(int i=0; i<=maxIndex && found<=index; i++){
    if(data.charAt(i)==separator || i==maxIndex){
        found++;
        strIndex[0] = strIndex[1]+1;
        strIndex[1] = (i == maxIndex) ? i+1 : i;
    }
  }

  return found>index ? data.substring(strIndex[0], strIndex[1]) : "";
}

// HACK cause adafruit probably f*cked up!
int hackBrokenGridPositons(int y){
  if(y == 2){ return 4; }
  else if(y == 4){ return 2; }
  if(y == 3){ return 5; }
  else if(y == 5){ return 3; }
  if(y == 10){ return 12; }
  else if(y == 12){ return 10; }
  if(y == 11){ return 13; }
  else if(y == 13){ return 11; }
  return y;
}

void loop() {
  if(Serial.available() > 0)
  {

    // control char: ^ // 94
    if( Serial.read() == controlChar ){
      String command = Serial.readStringUntil(';');
      int x = getValue(command, 0).toInt();
      int y = getValue(command, 1).toInt();
      // HACK cause adafruit probably f*cked up!
      y = hackBrokenGridPositons(y);

      int r = getValue(command, 2).toInt();
      int g = getValue(command, 3).toInt();
      int b = getValue(command, 4).toInt();

      matrix.drawPixel(x, y, matrix.Color333(r, g, b));

      // DEBUG
      Serial.println(String(x) + " " + String(y) + " " + String(r) + " " + String(g) + " " + String(b));
    }

  }
}
