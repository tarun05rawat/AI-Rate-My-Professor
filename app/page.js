"use client";
import {
  Box,
  Button,
  Stack,
  TextField,
  Paper,
  Typography,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Rate My Professor support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat when a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      {
        role: "user",
        content: message,
      },
      {
        role: "assistant",
        content: "...", // Placeholder while waiting for the response
      },
    ]);

    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: data.reply || "Sorry, something went wrong.",
          },
        ];
      });
    } catch (error) {
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: "Error: Could not process your request." },
        ];
      });
      console.error("There was an error with the fetch operation:", error);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#1c1c1c" // Darker background for the page
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "600px",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          overflow: "hidden",
          bgcolor: "#2c2c2c", // Dark gray background for the chat window
        }}
      >
        {/* Title Section */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#26a69a",
            textAlign: "center",
            borderBottom: "1px solid #444",
          }}
        >
          <Typography variant="h5" color="white">
            Rate My Professor Chatbot
          </Typography>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            bgcolor: "#3c3c3c", // Lighter gray background for the message area
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
              mb={2}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: "15px",
                  bgcolor: message.role === "assistant" ? "#26a69a" : "#ffcc80", // Teal for assistant, amber for user
                  color: "white",
                  maxWidth: "75%",
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #444", // Slightly lighter border for separation
            bgcolor: "#2c2c2c", // Same as the chat window background
            display: "flex",
            alignItems: "center",
          }}
        >
          <TextField
            label="Type a message..."
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && message.trim()) {
                sendMessage();
              }
            }}
            sx={{
              mr: 2,
              bgcolor: "#444", // Darker input field background
              borderRadius: "20px",
            }}
            InputLabelProps={{
              style: { color: "#bbb" }, // Light gray label color
            }}
            InputProps={{
              style: { color: "white" }, // White text in the input field
            }}
          />
          <Button
            variant="contained"
            sx={{
              bgcolor: "#26a69a",
              "&:hover": {
                bgcolor: "#00796b",
              },
              borderRadius: "20px",
              px: 3,
              height: "100%",
            }}
            onClick={sendMessage}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
