import {
  Service,
  PlatformAccessory,
  CharacteristicValue,
  CharacteristicSetCallback,
  CharacteristicGetCallback,
} from "homebridge";

import { WeatherStationPlatform } from "./WeatherStationPlatform";

import { NetatmoAPI } from "./NetatmoAPI";

// class SensorStateCache {
//   private expirationDate: Date;

//   // public readonly state: any;

//   constructor(public readonly state: any, private readonly ttl: number) {
//     this.expirationDate = new Date();
//     this.expirationDate.setSeconds(this.expirationDate.getSeconds() + ttl);
//     this.state = state;
//   }

//   isValid() {
//     const now = new Date();
//     return now < this.expirationDate;
//   }
// }

enum NetatmoAccessoryType {
  Temperature = "temperature",
  Humidity = "humidity",
  Pressure = "pressure",
}

export class WeatherStationPlatformAccessory {
  private services: Service[];

  // private stateCache?: SensorStateCache;

  constructor(
    private readonly platform: WeatherStationPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly api: NetatmoAPI
  ) {
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        "Default-Manufacturer"
      )
      .setCharacteristic(this.platform.Characteristic.Model, "Default-Model")
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        "Default-Serial-AAA"
      );

    this.services = [];

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    const temperatureSensorService =
      this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    temperatureSensorService.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.device.exampleDisplayName
    );

    temperatureSensorService
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .on("get", this.getTemperatureSensorState.bind(this));
    // .setProps({
    //     minValue: -100,
    //     maxValue: 100,
    //     minStep: 0.01,
    //     unit: Characteristic.Units.CELSIUS
    // });

    this.services.push(temperatureSensorService);

    // const humiditySensorService =
    //   this.accessory.getService(this.platform.Service.HumiditySensor) ||
    //   this.accessory.addService(this.platform.Service.HumiditySensor);

    // humiditySensorService.setCharacteristic(
    //   this.platform.Characteristic.Name,
    //   accessory.context.device.exampleDisplayName
    // );

    // humiditySensorService
    //   .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
    //   .on("get", this.getHumiditySensorState.bind(this));

    // this.services.push(humiditySensorService);
  }

  async getTemperatureSensorState(callback: CharacteristicGetCallback) {
    try {
      const state = await this.getState();
      callback(null, state.temperature);
    } catch (error) {
      this.platform.log.error(error);
      callback(error, null);
    }
  }

  async getHumiditySensorState(callback: CharacteristicGetCallback) {
    try {
      const state = await this.getState();
      callback(null, state.humidity);
    } catch (error) {
      this.platform.log.error(error);
      callback(error, null);
    }
  }

  async getState() {
    const state = await this.api.getMeasure(
      "70:ee:50:00:e6:06",
      "02:00:00:03:57:c0"
    );
    // if (this.stateCache && this.stateCache.isValid) {
    //   const state = this.stateCache.state;
    //   this.platform.log.info("Found valid cache ->", state);
    //   return state;
    // }

    // const body = response.data.body;
    // const measure = body[body.length - 1];
    // const values = measure.value[0];
    // const temperature = values[0];
    // const humidity = values[1];
    // const state = {
    //   temperature,
    //   humidity,
    // };
    // this.stateCache = new SensorStateCache(state, 60);
    // this.platform.log.info(measure);
    // this.platform.log.info(`temperature: ${temperature}`);
    // this.platform.log.info(`humidity: ${humidity}`);

    return state;
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  // setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
  //   // implement your own code to turn your device on/off
  //   this.exampleStates.On = value as boolean;

  //   this.platform.log.debug("Set Characteristic On ->", value);

  //   // you must call the callback function
  //   callback(null);
  // }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   * 
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   * 
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  // getOn(callback: CharacteristicGetCallback) {
  //   // implement your own code to check if the device is on
  //   const isOn = this.exampleStates.On;

  //   this.platform.log.debug("Get Characteristic On ->", isOn);

  //   // you must call the callback function
  //   // the first argument should be null if there were no errors
  //   // the second argument should be the value to return
  //   callback(null, isOn);
  // }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  // setBrightness(
  //   value: CharacteristicValue,
  //   callback: CharacteristicSetCallback
  // ) {
  //   // implement your own code to set the brightness
  //   this.exampleStates.Brightness = value as number;

  //   this.platform.log.debug("Set Characteristic Brightness -> ", value);

  //   // you must call the callback function
  //   callback(null);
  // }
}
