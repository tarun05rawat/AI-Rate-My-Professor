"use client";
import {
  Box,
  Button,
  Stack,
  TextField,
  Paper,
  Typography,
  IconButton,
  Switch,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Rate My Professor support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const lightTheme = createTheme({
    palette: {
      mode: "light",
      background: {
        default: "#f0f4f8",
        paper: "#ffffff",
      },
      primary: {
        main: "#00796b",
      },
      secondary: {
        main: "#ffb300",
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      background: {
        default: "#1c1c1c",
        paper: "#2c2c2c",
      },
      primary: {
        main: "#26a69a",
      },
      secondary: {
        main: "#ffcc80",
      },
    },
  });

  const theme = darkMode ? darkTheme : lightTheme;

  // Scroll to the bottom of the chat when a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleToggleMode = () => {
    setDarkMode(!darkMode);
  };

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
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor={theme.palette.background.default}
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
            position: "relative",
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton onClick={handleToggleMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Switch
              checked={darkMode}
              onChange={handleToggleMode}
              color="default"
            />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              bgcolor: theme.palette.background.default,
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
                    bgcolor:
                      message.role === "assistant"
                        ? theme.palette.primary.main
                        : theme.palette.secondary.main,
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
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
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
                bgcolor: theme.palette.background.default,
                borderRadius: "20px",
              }}
              InputLabelProps={{
                style: { color: darkMode ? "#bbb" : "#333" }, // Adjust label color based on mode
              }}
              InputProps={{
                style: { color: darkMode ? "white" : "black" }, // Adjust text color based on mode
              }}
            />
            <Button
              variant="contained"
              sx={{
                bgcolor: theme.palette.primary.main,
                "&:hover": {
                  bgcolor: darkMode ? "#00796b" : "#005a4f",
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
    </ThemeProvider>
  );
}
