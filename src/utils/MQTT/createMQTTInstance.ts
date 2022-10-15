import { connect, MqttClient } from 'mqtt';
import { ServerConfiguration } from '../../types/serverConfiguration';

export const createMQTTInstance = ({
  communicator = {
    host: 'ws://localhost:1883',
    username: undefined,
    password: undefined,
  },
}: ServerConfiguration): MqttClient => {
  return connect(communicator.host, {
    username: communicator.username,
    password: communicator.password,
  });
};
