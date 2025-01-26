// src/grpc/grpcClient.js
import * as grpcWeb from 'grpc-web';
import * as protobuf from 'protobufjs';
import { QuestionServiceClient } from 'grpc-web-client'; // Import the grpc-web client (this will be created)

export function loadProto() {
  return new Promise((resolve, reject) => {
    // Load your .proto file using protobuf.js
    protobuf.load('./src/proto/questions.proto', (err, root) => {
      if (err) {
        reject(err);
      } else {
        resolve(root);
      }
    });
  });
}

export async function getQuestions() {
  try {
    const root = await loadProto();
    const QuestionService = root.lookupService('questions.QuestionService');
    const GetQuestionsRequest = root.lookupType('questions.GetQuestionsRequest');
    const GetQuestionsResponse = root.lookupType('questions.GetQuestionsResponse');
    
    const request = GetQuestionsRequest.create({});

    // Initialize the gRPC Web client
    const client = new QuestionServiceClient('http://localhost:8080', null, null); // Update with your server URL

    client.getQuestions(request, {}, (err, response) => {
      if (err) {
        console.error('Error fetching questions:', err);
      } else {
        console.log('Received questions:', response);
        // Handle your response here (e.g., map to display questions)
      }
    });
  } catch (err) {
    console.error('Error loading proto:', err);
  }
}
