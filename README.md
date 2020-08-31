<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

# Homebridge Netatmo Weather Station Plugin

This plugin allows you to get temperature & humidity from a Netatmo Wether Station.

This plugin is still in development and not available through npm for now.

# Installation

## Install Development Dependencies

Using a terminal, navigate to the project folder and run this command to install the development dependencies:

```
npm install
```

## Build Plugin

```
npm run build
```

## Link To Homebridge

Run this command so your global install of Homebridge can discover the plugin in your development environment:

```
npm link
```

## Configure

The recommended way to configure this plugin is through `Homebridge Config UI X`. This plugin is available [here](https://www.npmjs.com/package/homebridge-config-ui-x).

### Grab the station info near you

You'll need several info to make it work. First you need to find the mac address of the station and the module associated to the station. You can play around with the [weather map widget](https://dev.netatmo.com/apidocumentation/weather#weathermap-widget) to find a station near your place.

### Get your API credentials

First, you need a Netatmo account. You can create one [here](https://auth.netatmo.com/en-gb/access/login).
Then, you need oauth2 API credential. You'll need to create an application on the [netatmo website](https://dev.netatmo.com/apps/createanapp#form). This will create a `client_id` and a `client_secret`.

### Make your plugin configured

Once you have all the information described in the previous points, you're ready to go to the `Homebridge Config UI X`'s configuration page. On the plugin's setting page, you will be able to enter the API creadentials, station mac address and add some devices connected to the station.
