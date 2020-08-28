import {
  Service,
  Logger,
  PlatformAccessory,
  CharacteristicGetCallback,
} from "homebridge";

import { WeatherStationPlatform } from "./WeatherStationPlatform";

import { NetatmoAPI } from "./NetatmoAPI";

export enum WeatherStationAccessoryType {
  Temperature = "Temperature",
  Humidity = "Humidity",
  // Pressure = "pressure",
}

export class WeatherStationAccessoryModel {
  readonly manufacturer: string;
  constructor(
    readonly stationMacAddress: string,
    readonly deviceMacAddress: string,
    readonly types: Array<WeatherStationAccessoryType>
  ) {
    this.manufacturer = "Netatmo";
  }
}

export class WeatherStationAccessory {
  private services: Service[];

  constructor(
    private readonly platform: WeatherStationPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly api: NetatmoAPI,
    private readonly log: Logger,
    private readonly model: WeatherStationAccessoryModel
  ) {
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        model.manufacturer
      )
      .setCharacteristic(
        this.platform.Characteristic.Model,
        model.deviceMacAddress
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        model.deviceMacAddress
      );

    this.services = [];
    for (const type of model.types) {
      let service: Service | undefined;
      switch (type) {
        case WeatherStationAccessoryType.Temperature:
          service = this.makeTemperatureSensorService();
          break;
        case WeatherStationAccessoryType.Humidity:
          service = this.makeHumiditySensorService();
          break;
        default:
          service = undefined;
      }
      if (service) {
        this.services.push(service);
      }
    }
  }

  async getTemperatureSensorState(callback: CharacteristicGetCallback) {
    try {
      const measures = await this.getMeasures();
      callback(null, measures.get(WeatherStationAccessoryType.Temperature));
    } catch (error) {
      this.platform.log.error(error);
      callback(error, null);
    }
  }

  async getHumiditySensorState(callback: CharacteristicGetCallback) {
    try {
      const measures = await this.getMeasures();
      callback(null, measures.get(WeatherStationAccessoryType.Humidity));
    } catch (error) {
      this.platform.log.error(error);
      callback(error, null);
    }
  }

  private async getMeasures() {
    const values = await this.api.getMeasure(
      this.model.stationMacAddress,
      this.model.deviceMacAddress,
      this.model.types
    );
    const measures = new Map<WeatherStationAccessoryType, number>();
    for (let i = 0; i < this.model.types.length; i++) {
      const type = this.model.types[i];
      const value = values[i];
      measures.set(type, value);
    }
    return measures;
  }

  private makeTemperatureSensorService(): Service {
    const serviceID = this.platform.Service.TemperatureSensor;
    const service =
      this.accessory.getService(serviceID) ||
      this.accessory.addService(serviceID);
    service.setCharacteristic(
      this.platform.Characteristic.Name,
      "TemperatureSensor"
    );
    service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .on("get", this.getTemperatureSensorState.bind(this));
    return service;
  }

  private makeHumiditySensorService(): Service {
    const serviceID = this.platform.Service.HumiditySensor;
    const service =
      this.accessory.getService(serviceID) ||
      this.accessory.addService(serviceID);
    service.setCharacteristic(
      this.platform.Characteristic.Name,
      "HumiditySensor"
    );
    service
      .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .on("get", this.getHumiditySensorState.bind(this));
    return service;
  }
}
