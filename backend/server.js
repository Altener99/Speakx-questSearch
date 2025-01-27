require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Questions = require('./models/questions');
const Database = require('./config/database');

Database();

const PROTO_PATH = './questions.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const questionProto = grpc.loadPackageDefinition(packageDefinition).questions;

const getQuestions = async (call, callback) => {
  try {
    const questions = await Questions.find({});
    const questionList = {
      questions: questions.map((q) => ({
        title: q.title,
        type: q.type,
      })),
    };

    console.log('Sending question list:', questionList);
    callback(null, questionList);
  } catch (err) {
    console.error('Error fetching questions:', err);
    callback(err, null);
  }
};

const getUniqueQuestionTypes = async (call, callback) => {
  try {
    const questions = await Questions.find({}).select('type');
    const uniqueTypes = [...new Set(questions.map((q) => q.type))];

    const typesResponse = {
      types: uniqueTypes,
    };

    console.log('Sending unique types:', typesResponse);
    callback(null, typesResponse);
  } catch (err) {
    console.error('Error fetching unique types:', err);
    callback(err, null);
  }
};

const serverOptions = {
  'grpc.max_receive_message_length': 10 * 1024 * 1024,
  'grpc.max_send_message_length': 10 * 1024 * 1024,   
};


const server = new grpc.Server(serverOptions);
server.addService(questionProto.QuestionService.service, {
  GetQuestions: getQuestions,
  GetUniqueQuestionTypes: getUniqueQuestionTypes,
});

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    return;
  }
  console.log(`gRPC server running on port ${port}`);
  server.start();
});
