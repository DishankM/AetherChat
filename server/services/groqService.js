import Groq from 'groq-sdk';

class GroqService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (apiKey && apiKey && apiKey.length > 10 && apiKey !== 'gsk_your_groq_api_key_here') {
      this.client = new Groq({
        apiKey: apiKey
      });
      this.isConfigured = true;
      console.log('Groq API initialized successfully');
    } else {
      console.warn('Groq API key not configured. AI features will use simulated responses.');
      this.isConfigured = false;
    }
  }

  async getChatCompletion(userMessage, contextMessages = []) {
    if (!this.isConfigured) {
      // Return an enhanced simulated response for demo purposes
      return this.getEnhancedSimulatedResponse(userMessage, contextMessages);
    }

    try {
      // Build context from recent messages
      const contextText = contextMessages.length > 0 
        ? `\n\nRecent conversation context:\n${contextMessages.slice(-5).map(m => {
            const sender = m.sender?.username || 'User';
            return `[${sender}]: ${m.text}`;
          }).join('\n')}`
        : '';

      const systemPrompt = `You are AetherAI, a helpful, friendly, and intelligent AI assistant in a chat application.

Your personality:
- Friendly, conversational, and approachable
- Helpful and informative without being overwhelming
- Thoughtful and insightful in your responses
- Professional but warm in tone

Guidelines:
1. Provide clear, concise, and helpful answers
2. If someone asks about coding, provide code examples with explanations
3. If someone asks general questions, give informative responses
4. Keep responses reasonably sized - not too short, not too long
5. Use formatting like bullet points or numbered lists when appropriate
6. If you don't know something, be honest about it

Current conversation context: ${contextText}`;

      const completion = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response || response.trim() === '') {
        return "I'm sorry, I couldn't generate a response. Could you try asking in a different way?";
      }

      return response;
    } catch (error) {
      console.error('Groq API Error:', error.message);
      
      // If API fails, fall back to simulated response
      return this.getEnhancedSimulatedResponse(userMessage, contextMessages);
    }
  }

  getEnhancedSimulatedResponse(userMessage, contextMessages = []) {
    // Analyze the user message to provide contextual responses
    const message = userMessage.toLowerCase().trim();
    
    // Define contextual response categories
    const responses = {
      greeting: [
        "Hello! 👋 Great to chat with you today! How can I help you?",
        "Hi there! I'm here to help. What would you like to talk about?",
        "Hey! Thanks for reaching out. What questions do you have?",
        "Hello! How's your day going? I'm ready to help with any questions!"
      ],
      coding: {
        javascript: [
          "Great question about JavaScript! 🟨 JavaScript is a versatile programming language used for web development. It runs in browsers and on servers (Node.js). Key features include dynamic typing, first-class functions, and event-driven programming.",
          "JavaScript is one of the most popular programming languages! It's essential for web development and can be used for both frontend and backend. Would you like to know about specific JavaScript features or concepts?",
        ],
        python: [
          "Python is an amazing language! 🐍 It's known for its simplicity and readability. Python is used in web development, data science, AI/ML, automation, and more.",
          "Python is fantastic for beginners and experts alike! Its clean syntax makes it easy to learn. What aspect of Python interests you most?"
        ],
        react: [
          "React is a popular JavaScript library for building user interfaces! ⚛️ It uses a component-based architecture and virtual DOM for efficient rendering.",
          "React is great for building modern web applications! Key concepts include components, props, state, and hooks. Would you like to learn more about any specific React feature?"
        ],
        general: [
          "I'd be happy to help with your coding question! 🖥️ Could you tell me more about what you're trying to accomplish?",
          "Programming is all about problem-solving! What challenge are you working on?",
          "Coding is a superpower! 💪 What would you like to learn or build?"
        ]
      },
      help: [
        "I'm here to help! What do you need assistance with?",
        "How can I help you today? Feel free to ask me anything!",
        "Got a question? I've got answers! What would you like to know about?",
        "I'm your AI assistant - ask me anything! 😊"
      ],
      thanks: [
        "You're welcome! 😊 Happy to help!",
        "My pleasure! Let me know if you have any other questions!",
        "Anytime! That's what I'm here for! 🙏",
        "Glad I could help! Feel free to ask more questions!"
      ],
      how_are_you: [
        "I'm doing great, thanks for asking! 🤖 I'm ready and eager to help you with anything!",
        "I'm functioning perfectly and ready to assist! How about you?",
        "All systems operational! 🚀 What can I help you with today?"
      ],
      what_can_you_do: [
        "I can help with many things! 💡\n\n• Answering questions on various topics\n• Helping with coding and programming questions\n• Explaining complex concepts simply\n• Providing useful information and insights\n• Having thoughtful conversations\n\nWhat interests you?",
        "Great question! I'm a versatile AI assistant. I can:\n• Help with programming and technical questions\n• Explain difficult concepts\n• Provide creative suggestions\n• Answer general knowledge questions\n• And much more!\n\nTry asking me something!"
      ],
      weather: [
          "I don't have access to real-time weather data, but I'd recommend checking a weather app or website for current conditions! 🌤️",
          "I can't check the weather for you, but many weather websites and apps can give you accurate forecasts! ☀️🌧️"
        ],
      time: [
          "I don't have access to real-time clock data, but you can check your device's time! ⏰",
          "I'm not connected to a clock, but your device should show the current time! 🕐"
        ],
      default: [
        "That's an interesting question! 🤔 I'd love to help you explore this topic. Could you tell me more about what specifically interests you?",
        "Thanks for asking! 😊 Here's my take on this:",
        "Great question! Let me share some insights on this topic.",
        "I'd be happy to help with that! Here's what I think:",
        "That's a thoughtful question. Here's my perspective:",
        "Let me help you with that! Based on my knowledge:"
      ]
    };

    // Detect message category
    let category = 'default';
    
    if (message.match(/^(hi|hello|hey|howdy|good morning|good afternoon|good evening)/i)) {
      category = 'greeting';
    } else if (message.includes('javascript') || message.includes('js') || message.includes('react') || 
               message.includes('python') || message.includes('coding') || message.includes('code') ||
               message.includes('programming') || message.includes('function') || message.includes('variable')) {
      category = 'coding';
    } else if (message.includes('help') || message.includes('assist') || message.includes('support')) {
      category = 'help';
    } else if (message.includes('thank') || message.includes('thanks')) {
      category = 'thanks';
    } else if (message.includes('how are you') || message.includes('how do you do')) {
      category = 'how_are_you';
    } else if (message.includes('what can you do') || message.includes('capabilities') || message.includes('abilities')) {
      category = 'what_can_you_do';
    } else if (message.includes('weather')) {
      category = 'weather';
    } else if (message.includes('time') || message.includes('what time') || message.includes("what's the time")) {
      category = 'time';
    }

    // Get contextual sub-category for coding
    let subCategory = 'general';
    if (category === 'coding') {
      if (message.includes('javascript') || message.includes('js') || message.includes('node')) {
        subCategory = 'javascript';
      } else if (message.includes('python')) {
        subCategory = 'python';
      } else if (message.includes('react') || message.includes('jsx')) {
        subCategory = 'react';
      }
    }

    // Get response
    let responseOptions = responses[category];
    if (category === 'coding') {
      responseOptions = responses.coding[subCategory];
    }
    
    const baseResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];
    
    // Add contextual follow-up for longer conversations
    const hasContext = contextMessages && contextMessages.length > 0;
    
    if (hasContext) {
      return baseResponse;
    }
    
    return baseResponse;
  }
}

export default new GroqService();
