import { Logger } from "homebridge";

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import querystring from "querystring";

export class NetatmoAPI {
  private token?: string;
  private refreshToken?: string;
  private client: AxiosInstance;

  constructor(
    private readonly username: string,
    private readonly password: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly log: Logger
  ) {
    this.client = axios.create({
      baseURL: "https://app.netatmo.net/api/",
      timeout: 1000,
      // headers: { "X-Custom-Header": "foobar" },
    });

    // this.client.interceptors.request.use(
    //   (config) => {
    //     // const token = localStorageService.getAccessToken();
    //     if (this.token) {
    //       this.log.info("injecting token");
    //       config.headers["Authorization"] = `Bearer ${this.token}`;
    //     } else {
    //       this.log.info("NOT injecting token");
    //     }
    //     // config.headers['Content-Type'] = 'application/json';
    //     return config;
    //   },
    //   (error) => {
    //     Promise.reject(error);
    //   }
    // );

    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const originalRequest = error.config;
        // if (error.response.status === 400 && !this.token) {
        //   this.log.info("Performing login...");
        //   // Login
        //   return this.getToken(
        //     {
        //       username: this.username,
        //       password: this.password,
        //       grant_type: "password",
        //     },
        //     originalRequest
        //   );
        // } else
        if (error.response.status === 401 && !originalRequest._retry) {
          this.log.info("Refreshing token...");
          return this.performRefreshToken(originalRequest);
        }
        //       if (
        //         error.response.status ===
        //         401 /*&& originalRequest.url ===
        //  'http://13.232.130.60:8081/v1/auth/token*/
        //       ) {
        //         log.info("originalRequest.url =>", originalRequest.url);
        //         // router.push('/login');
        //         return Promise.reject(error);
        //       }

        return Promise.reject(error);
      }
    );
  }

  private performLogin() {
    return this.getToken({
      username: this.username,
      password: this.password,
      grant_type: "password",
    });
  }

  private performRefreshToken(originalRequest: AxiosRequestConfig) {
    return this.getToken(
      {
        refresh_token: this.refreshToken,
        grant_type: "refresh_token",
      },
      originalRequest
    );
  }

  private async getToken(
    credentials: any,
    originalRequest?: AxiosRequestConfig
  ) {
    return axios
      .post(
        "https://api.netatmo.com/oauth2/token",
        querystring.stringify({
          ...credentials,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        })
      )
      .then((res) => {
        this.log.info("res.data: ", res.data);
        this.log.info("res.status: ", res.status);
        if (res.status === 200) {
          this.log.info("storing token...", res.data.access_token);
          this.token = res.data.access_token;
          this.refreshToken = res.data.refresh_token;
          if (originalRequest) {
            return axios(originalRequest);
          }
        }
      });
  }

  async getMeasure(
    deviceID: string,
    moduleID: string
    // type: NetatmoAccessoryType
  ) {
    const dateEnd = Math.floor(Date.now() / 1000);
    const dateBegin = dateEnd - 60 * 60; //

    const response = await this.performRequest("/getmeasure", {
      date_begin: dateBegin.toString(),
      date_end: dateEnd.toString(),
      device_id: deviceID,
      module_id: moduleID,
      scale: "max",
      type: "Temperature,Humidity",
    });

    const body = response.data.body;
    const measure = body[body.length - 1];
    const values = measure.value[0];
    const temperature = values[0];
    const humidity = values[1];
    const state = {
      temperature,
      humidity,
    };
    this.log.info("state =>", state);
    return state;
  }

  private async performRequest(endPoint: string, data: any) {
    if (!this.token) {
      await this.performLogin();
    }
    return this.client(endPoint, {
      method: "post",
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : null,
      },
      data,
    });
  }
}
