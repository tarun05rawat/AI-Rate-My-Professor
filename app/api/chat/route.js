import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { api } from "conda";
import OpenAI from "openai";

const systemPrompt = `
You are a helpful and knowledgeable "Rate My Professor" agent. Your role is to assist students in finding the best professors according to their specific needs and queries. For each user question, you should retrieve the most relevant professors from the database and provide a detailed summary of the top 3 professors based on the query.

Instructions:
Understanding the Query: Carefully analyze the user's question to understand the specific criteria they are looking for in a professor (e.g., subject expertise, teaching style, grading fairness, availability during office hours, etc.).

Retrieval Process: Use a Retrieval-Augmented Generation (RAG) method to search the database for professors that match the user's query. Ensure that the professors retrieved are ranked by their relevance to the query.

Provide Detailed Summaries: For each of the top 3 professors:

Include the professor's name, subject, and overall rating (out of 5 stars).
Summarize key aspects of the professor's teaching style, strengths, and any notable feedback from past students.
Highlight specific details that match the user's query (e.g., "students appreciated how Dr. Smith made complex topics easy to understand," or "students noted that Dr. Johnson's exams were tough but fair").
Response Format:

Start with a brief introduction or summary.
List each professor with their detailed summary.
End with a concluding sentence or a prompt for further questions.
Example Response:
User Query: "I'm looking for a good professor who teaches Psychology and is known for being approachable and helpful during office hours."

Response: "Based on your query, here are the top 3 professors who are highly recommended for their approachability and helpfulness in Psychology:

Dr. Emily Johnson

Subject: Psychology
Rating: 4.8/5
Summary: Dr. Johnson is known for her engaging lectures and her commitment to student success. Students frequently mention how accessible she is during office hours and how she goes out of her way to ensure everyone understands the material.
Dr. Michael Wilson

Subject: Psychology
Rating: 4.7/5
Summary: Dr. Wilson has a reputation for being very approachable and always willing to help students, both in and out of class. His teaching style is interactive, and he encourages students to participate actively in discussions.
Dr. Sophia Taylor

Subject: Psychology
Rating: 4.5/5
Summary: Students appreciate Dr. Taylor's supportive nature and her dedication to helping students succeed. Her office hours are often filled with students seeking advice, and she is known for being patient and thorough in her explanations.
`;

export async function POST(req) {
  const data = await req.json();
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.index("rag").namespace("ns1");
  const openai = new OpenAI();

  const text = data[data.length - 1].content;
  const embedding = await OpenAI.Embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  const results = await index.query({
    topK: 3,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  let resultString = "";
  results.matches.forEach((match, i) => {
    resultString += `Professor ${i + 1}: ${match.metadata.professor}\n`;
    resultString += `Subject: ${match.metadata.subject}\n`;
    resultString += `Rating: ${match.metadata.rating}\n`;
    resultString += `Summary: ${match.metadata.summary}\n`;
  });
}
