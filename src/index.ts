import { API } from "homebridge";

import { PLATFORM_NAME } from "./settings";
import { WeatherStationPlatform } from "./WeatherStationPlatform";

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, WeatherStationPlatform);
};
