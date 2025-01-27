const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './questions.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const questionProto = grpc.loadPackageDefinition(packageDefinition).questions;

const client = new questionProto.QuestionService(
  'localhost:50051',
  grpc.credentials.createInsecure(),
  {
    'grpc.max_receive_message_length': 10 * 1024 * 1024, // 10 MB
    'grpc.max_send_message_length': 10 * 1024 * 1024, // 10 MB
  }
);

module.exports = client;
