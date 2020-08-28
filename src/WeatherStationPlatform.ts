import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from "homebridge";

import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import {
  WeatherStationAccessory,
  WeatherStationAccessoryType,
  WeatherStationAccessoryModel,
} from "./WeatherStationAccessory";
import { NetatmoAPI } from "./NetatmoAPI";

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class WeatherStationPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap
    .Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  private readonly netatmoAPI?: NetatmoAPI;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API
  ) {
    this.log.debug("Finished initializing platform: ", this.config.name);

    this.log.info("Loaded configuration: ", this.config);

    const netatmoConnect = this.config.netatmoConnect;
    if (!netatmoConnect) {
      return;
    }
    const username = netatmoConnect.username;
    const password = netatmoConnect.password;
    const clientID = netatmoConnect.clientID;
    const clientSecret = netatmoConnect.clientSecret;
    this.netatmoAPI = new NetatmoAPI(
      username,
      password,
      clientID,
      clientSecret,
      this.log
    );

    this.api.on("didFinishLaunching", () => {
      log.debug("Executed didFinishLaunching callback");
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info("Loading accessory from cache:", accessory.displayName);
    this.accessories.push(accessory);
  }

  discoverDevices() {
    const station = this.config.station;

    if (!this.netatmoAPI) {
      return;
    }

    for (const module of station.modules) {
      const uuid = this.api.hap.uuid.generate(module.macAddress);
      const types: Array<WeatherStationAccessoryType> = module.types.map(
        (type) => WeatherStationAccessoryType[type]
      );

      const model = new WeatherStationAccessoryModel(
        station.macAddress,
        module.macAddress,
        types
      );

      const existingAccessory = this.accessories.find(
        (accessory) => accessory.UUID === uuid
      );

      if (existingAccessory) {
        // the accessory already exists
        this.log.info(
          "Restoring existing accessory from cache:",
          existingAccessory.displayName
        );

        new WeatherStationAccessory(
          this,
          existingAccessory,
          this.netatmoAPI,
          this.log,
          model
        );
      } else {
        this.log.info("Adding new accessory:", module.macAddress);

        const accessory = new this.api.platformAccessory(
          module.macAddress, // name
          uuid
        );

        // accessory.context.device = device;

        new WeatherStationAccessory(
          this,
          accessory,
          this.netatmoAPI,
          this.log,
          model
        );

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
      }
    }

    // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
    // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
  }
}
