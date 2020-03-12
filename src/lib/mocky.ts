import * as grpc from 'grpc';
import * as loader from '@grpc/proto-loader';
import Path from 'path';

const DEFULAT_SERVER_ADDRESS = '0.0.0.0';
const DEFAULT_SERVER_PORT = '50051';

export interface ProtoMockServer {
  address: string;
  port: string;
  protos: MockProtoJson[];
}

export interface MockProtoJson {
  path: string;
  pkg: string;
  options: loader.Options;
  services: MockServiceJson[];
}
export type MockServiceJson = {
  name: string;
  methods: MockMethodJson[];
};
export type MockMethodJson = {
  name: string;
  out: any;
};

export type Proto = {
  path: string;
  pkgName: string;
  options: loader.Options;
};

let server: grpc.Server;

export const makeHandler = (out: string) => (call: any, cb: any): void => {
  cb(null, out);
};

export const run = (
  protoMockServer: ProtoMockServer = {
    address: DEFULAT_SERVER_ADDRESS,
    port: DEFAULT_SERVER_PORT,
    protos: [],
  }
): grpc.Server => {
  const { address, port, protos } = protoMockServer;

  if (protos.length === 0) {
    throw new Error('no proto to mock');
  }

  server = new grpc.Server();

  protos.forEach(({ path, pkg, options, services }) => {
    const pkgDefinition = loader.loadSync(Path.resolve(path), options);
    services.forEach(service => {
      const serviceHandler = service.methods.reduce((prev, curr) => {
        return { ...prev, [curr.name]: makeHandler(curr.out) };
      }, {});

      const svcDefinition = (pkgDefinition as any)[
        `${pkg}.${service.name}`
      ] as grpc.ServiceDefinition<grpc.MethodDefinition<object, object>>;

      console.log('svcDefinition', svcDefinition);

      server.addService(
        (pkgDefinition as any)[`${pkg}.${service.name}`],
        serviceHandler
      );
    });
  });

  server.bind(`${address}:${port}`, grpc.ServerCredentials.createInsecure());
  server.start();

  return server;
};

const _unaryHandler = (out: string) => {
  return (call: any, cb: any): void => {
    cb(null, out);
  };
};
const _serverStreamingHandler = (out: string) => {
  return (call: any, cb: any): void => {
    cb(null, out);
  };
};
const _clientStreamingHandler = (out: string) => {
  return (call: any, cb: any): void => {
    cb(null, out);
  };
};
const _duplexStreamingHandler = (out: string) => {
  return (call: any, cb: any): void => {
    cb(null, out);
  };
};
