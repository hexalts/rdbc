export interface BrokerConfiguration {
  /**
   * MQTT Host
   *
   * Make sure you have access rights to the host
   *
   * @example
   * host = 'ws://localhost:1883'
   */
  host: string;
  /**
   * MQTT Username
   */
  username?: undefined | string;
  /**
   * MQTT Password
   */
  password?: undefined | string;
}
