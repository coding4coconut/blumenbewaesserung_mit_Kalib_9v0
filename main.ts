radio.onReceivedNumber(function (receivedNumber) {
    if (receivedNumber == 1) {
        basic.setLedColor(0xffff00)
        if (Measurement_OnOff < 1) {
            radio.sendValue(convertToText(MoistureValuePercent), 1)
        } else {
            MoistureSensor2_data = pins.analogReadPin(AnalogPin.C17)
            Prozentwert_Berechnung()
            radio.sendValue(convertToText(MoistureValuePercent), 1)
        }
    }
    if (receivedNumber == 2) {
        basic.setLedColor(0x00ffff)
        motors.motorPower(100)
        MotorFernsteuerungOffOn = 1
        if (Measurement_OnOff < 1) {
            radio.sendValue(convertToText(MoistureValuePercent), 2)
        } else {
            MoistureSensor2_data = pins.analogReadPin(AnalogPin.C17)
            Prozentwert_Berechnung()
            radio.sendValue(convertToText(MoistureValuePercent), 2)
            radio.sendValue("EIN", 21)
        }
    }
    if (receivedNumber == 3) {
        basic.setLedColor(0x7f00ff)
        motors.motorCommand(MotorCommand.Coast)
        MotorFernsteuerungOffOn = 0
        if (Measurement_OnOff < 1) {
            radio.sendValue(convertToText(MoistureValuePercent), 3)
        } else {
            MoistureSensor2_data = pins.analogReadPin(AnalogPin.C17)
            Prozentwert_Berechnung()
            radio.sendValue(convertToText(MoistureValuePercent), 3)
            radio.sendValue("STOP", 31)
        }
    }
})
function Pumpentsteuerung (Motorleistung: number, Feuchtigkeit: number) {
    if (Feuchtigkeit < 30) {
        motors.motorPower(Motorleistung)
        PumpeAktiviert = 1
    }
    if (PumpeAktiviert > 0) {
        motors.motorPower(Motorleistung)
        if (Feuchtigkeit > 60) {
            motors.motorPower(Motorleistung - 0)
        }
        if (Feuchtigkeit > 80) {
            motors.motorCommand(MotorCommand.Coast)
            PumpeAktiviert = 0
        }
    }
}
input.onButtonPressed(Button.A, function () {
    if (KalibrierungAktiv < 1) {
        Measurement_OnOff = 0
        basic.clearScreen()
        basic.showIcon(IconNames.Heart)
        basic.pause(500)
    } else if (KalibrierungAktiv == 2) {
        Measurement_OnOff = 1
        Threshold_dry = MoistureSensor2_data
        KalibrierungAktiv = 3
        basic.showIcon(IconNames.Yes)
        basic.pause(200)
    } else if (KalibrierungAktiv == 3) {
        Measurement_OnOff = 1
        Threshold_wet = MoistureSensor2_data
        KalibrierungAktiv = 4
        basic.showIcon(IconNames.Yes)
        basic.pause(200)
    } else {
    	
    }
})
input.onButtonPressed(Button.AB, function () {
    // Messung ausschalten
    Measurement_OnOff = 1
    motors.motorCommand(MotorCommand.Coast)
    basic.showIcon(IconNames.Diamond)
    basic.pause(200)
    basic.showString("Kalibrierung")
    KalibrierungAktiv = 1
})
input.onButtonPressed(Button.B, function () {
    Measurement_OnOff += 1
    motors.motorCommand(MotorCommand.Coast)
    PumpeAktiviert = 0
    basic.clearScreen()
    if (Measurement_OnOff > 1) {
        MoistureSensor2_data = pins.analogReadPin(AnalogPin.C17)
        basic.setLedColor(0xff0000)
        basic.showNumber(MoistureSensor2_data)
        Prozentwert_Berechnung_Debugging()
        basic.pause(100)
        basic.turnRgbLedOff()
    } else {
        Measurement_OnOff = 1
        basic.showIcon(IconNames.No)
    }
})
function Prozentwert_Berechnung () {
    Measurement_Range = Threshold_dry - Threshold_wet
    AbsMoistureValue = MoistureSensor2_data - Threshold_wet
    AbsMoistureValue = Measurement_Range - AbsMoistureValue
    MoistureValuePercent = AbsMoistureValue / Measurement_Range * 100
    MoistureValuePercent = Math.abs(MoistureValuePercent)
    MoistureValuePercent = Math.ceil(MoistureValuePercent)
}
function Prozentwert_Berechnung_Debugging () {
    Measurement_Range = Threshold_dry - Threshold_wet
    AbsMoistureValue = MoistureSensor2_data - Threshold_wet
    AbsMoistureValue = Measurement_Range - AbsMoistureValue
    MoistureValuePercent = AbsMoistureValue / Measurement_Range * 100
    basic.showNumber(Math.ceil(MoistureValuePercent))
    basic.showString("%")
    led.plotBarGraph(
    MoistureValuePercent,
    100
    )
    basic.showNumber(Threshold_dry)
    basic.showNumber(Threshold_wet)
}
let AbsMoistureValue = 0
let PumpeAktiviert = 0
let MoistureValuePercent = 0
let MotorFernsteuerungOffOn = 0
let Measurement_OnOff = 0
let Measurement_Range = 0
let Threshold_wet = 0
let Threshold_dry = 0
let MoistureSensor2_data = 0
let KalibrierungAktiv = 0
basic.showLeds(`
    . . # . .
    . . # . .
    # . # . #
    # . . . #
    . # # # .
    `)
KalibrierungAktiv = 0
let MoistureSensor1_data = 0
MoistureSensor2_data = 0
Threshold_dry = 705
Threshold_wet = 205
Measurement_Range = Threshold_dry - Threshold_wet
Measurement_OnOff = 1
let MotorleistungInProzent = 100
MotorFernsteuerungOffOn = 0
radio.setGroup(1)
radio.setTransmitPower(7)
radio.setFrequencyBand(20)
radio.setTransmitSerialNumber(false)
basic.forever(function () {
    if (KalibrierungAktiv == 1) {
        Measurement_OnOff = 1
        basic.showString("trocken")
        MoistureSensor2_data = pins.analogReadPin(AnalogPin.C17)
        basic.showNumber(MoistureSensor2_data)
        basic.showString("<-A")
        // Kalibrierung des Sensorwertes für trockene Erde
        // 
        KalibrierungAktiv = 2
    } else if (KalibrierungAktiv == 3) {
        Measurement_OnOff = 1
        basic.showString("nass")
        MoistureSensor2_data = pins.analogReadPin(AnalogPin.C17)
        basic.showNumber(MoistureSensor2_data)
        basic.showString("<-A")
    } else if (KalibrierungAktiv == 4) {
        Measurement_OnOff = 1
        basic.showString("fertig!")
        // Kalibrierung des Sensorwertes für trockene Erde
        // 
        KalibrierungAktiv = 0
    } else if (KalibrierungAktiv == 2) {
        Measurement_OnOff = 1
        MoistureSensor2_data = pins.analogReadPin(AnalogPin.C17)
        basic.showNumber(MoistureSensor2_data)
        basic.showString("<-A")
    } else {
    	
    }
    if (Measurement_OnOff < 1) {
        motors.motorCommand(MotorCommand.Break)
        basic.pause(300)
        MoistureSensor2_data = pins.analogReadPin(AnalogPin.C17)
        Prozentwert_Berechnung()
        led.plotBarGraph(
        MoistureValuePercent,
        100
        )
        Pumpentsteuerung(MotorleistungInProzent, MoistureValuePercent)
        basic.pause(200)
    }
    if (MotorFernsteuerungOffOn == 1) {
        if (Measurement_OnOff < 1) {
            radio.sendValue(convertToText(MoistureValuePercent), 22)
        } else {
            MoistureSensor2_data = pins.analogReadPin(AnalogPin.C17)
            Prozentwert_Berechnung()
            radio.sendValue(convertToText(MoistureValuePercent), 22)
        }
    }
})
