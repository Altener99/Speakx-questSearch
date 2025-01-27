require('dotenv').config(); 
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Questions = require('./models/questions');
const Database = require('./config/database');
const grpcClient = require('./grpcClient');


Database();


const app = express();
app.use(cors());
app.use(express.json());


const PROTO_PATH = './public/questions.proto';
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

const grpcServer = new grpc.Server(serverOptions);
grpcServer.addService(questionProto.QuestionService.service, {
  GetQuestions: getQuestions,
  GetUniqueQuestionTypes: getUniqueQuestionTypes,
});


app.get('/', (req, res) => {
  res.send('Speakx API');
});


app.get('/api/questions', (req, res) => {
  grpcClient.GetQuestions({}, (error, response) => {
    if (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).send('Internal Server Error');
    }
    res.json(response.questions);
  });
});


app.get('/api/types', (req, res) => {
  grpcClient.GetUniqueQuestionTypes({}, (error, response) => {
    if (error) {
      console.error('Error fetching unique types:', error);
      return res.status(500).send('Internal Server Error');
    }
    res.json(response.types); 
  });
});

const grpcPort = 50051;
grpcServer.bindAsync(`0.0.0.0:${grpcPort}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind gRPC server:', err);
    return;
  }
  console.log(`gRPC server running on port ${port}`);
  grpcServer.start();
});

const expressPort = process.env.PORT || 4000;
app.listen(expressPort, () => {
  console.log(`Express API server running on http://localhost:${expressPort}`);
});
