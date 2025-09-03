const OpenAI = require('openai');
const axios = require('axios');

// AI 클라이언트 초기화
let openai = null;
let ollama = null;
const apiKey = process.env.OPENAI_API_KEY;

// OpenAI 초기화
if (apiKey && apiKey.startsWith('sk-') && !apiKey.includes('demo') && !apiKey.includes('test')) {
  try {
    openai = new OpenAI({
      apiKey: apiKey
    });
    console.log('✅ OpenAI client initialized with API key');
  } catch (error) {
    console.warn('⚠️ OpenAI initialization failed:', error.message);
    openai = null;
  }
} else if (apiKey) {
  console.warn('⚠️ Demo/test OpenAI API key detected. Will try Ollama first.');
} else {
  console.warn('⚠️ OpenAI API key not found. Will try Ollama first.');
}

// Ollama 클라이언트 초기화 및 테스트
async function initializeOllama() {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    if (response.data && response.data.models) {
      const availableModels = response.data.models;
      console.log('🦙 Ollama available models:', availableModels.map(m => m.name));
      
      // llama3.1 모델 확인
      const llama31Model = availableModels.find(m => m.name.includes('llama3.1'));
      if (llama31Model) {
        ollama = {
          baseURL: 'http://localhost:11434',
          model: llama31Model.name
        };
        console.log(`✅ Ollama client initialized with model: ${llama31Model.name}`);
        return true;
      }
    }
  } catch (error) {
    console.warn('⚠️ Ollama not available:', error.message);
  }
  return false;
}

// Ollama 초기화 시도
initializeOllama();

// Ollama API 호출 함수
async function callOllama(messages, systemPrompt = '') {
  if (!ollama) return null;
  
  try {
    // Ollama 메시지 포맷 변환
    const ollamaMessages = [];
    if (systemPrompt) {
      ollamaMessages.push({
        role: 'system',
        content: systemPrompt
      });
    }
    ollamaMessages.push(...messages);

    const response = await axios.post(`${ollama.baseURL}/api/chat`, {
      model: ollama.model,
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 150
      }
    });

    if (response.data && response.data.message) {
      return response.data.message.content;
    }
  } catch (error) {
    console.warn('🦙 Ollama API error:', error.message);
  }
  return null;
}

const openaiService = {
  // 첫 메시지 생성
  async generateFirstMessage(situation) {
    const systemPrompt = `You are an English conversation partner helping Korean learners practice real-life situations.
    Current situation: ${situation.title}
    Description: ${situation.description}
    Difficulty: ${situation.difficulty}
    
    Start the conversation naturally as if you are in this real situation.
    Keep it simple for ${situation.difficulty} level.
    Be encouraging and patient.`;

    // 1. Ollama 시도 (무료, 로컬)
    if (ollama) {
      const ollamaResponse = await callOllama([
        { role: "user", content: `Start the conversation for: ${situation.title}` }
      ], systemPrompt);
      
      if (ollamaResponse) {
        console.log('🦙 Using Ollama for first message');
        return ollamaResponse;
      }
    }

    // 2. OpenAI 시도 (유료)
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Start the conversation for: ${situation.title}` }
          ],
          temperature: 0.7,
          max_tokens: 150
        });

        console.log('🔑 Using OpenAI for first message');
        return completion.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API error:', error);
      }
    }

    // 3. 지능형 폴백 시스템
    console.log('💡 Using intelligent fallback for first message');
    return this.getFallbackFirstMessage(situation);
  },

  // AI 응답 생성
  async generateResponse(situation, messages, currentUserMessage = '') {
    const systemPrompt = `You are an English conversation partner in a ${situation.title} situation.
    Difficulty level: ${situation.difficulty}
    Keep responses natural and appropriate for the situation.
    Be encouraging and help the learner practice.
    If they make mistakes, continue the conversation naturally without directly correcting them.`;

    // 최근 5개 메시지만 컨텍스트로 사용
    const recentMessages = messages.slice(-5).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // 1. Ollama 시도 (무료, 로컬)
    if (ollama) {
      const ollamaResponse = await callOllama(recentMessages, systemPrompt);
      
      if (ollamaResponse) {
        console.log('🦙 Using Ollama for response generation');
        return {
          content: ollamaResponse,
          finishReason: 'stop'
        };
      }
    }

    // 2. OpenAI 시도 (유료)
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            ...recentMessages
          ],
          temperature: 0.7,
          max_tokens: 150
        });

        console.log('🔑 Using OpenAI for response generation');
        return {
          content: completion.choices[0].message.content,
          finishReason: completion.choices[0].finish_reason
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
      }
    }

    // 3. 지능형 폴백 시스템
    console.log('💡 Using intelligent fallback for response');
    return {
      content: this.getFallbackResponse(situation, currentUserMessage),
      finishReason: 'fallback'
    };
  },

  // 피드백 분석
  async analyzeFeedback(userMessage, situation) {
    if (!openai) {
      return {
        corrections: [],
        suggestions: ["Keep practicing! API not available."],
        score: 75,
        positives: ["Good effort!"]
      };
    }
    
    try {
      const systemPrompt = `You are an English teacher analyzing a student's response.
      Situation: ${situation.title}
      Difficulty: ${situation.difficulty}
      
      Analyze the grammar, vocabulary, and appropriateness.
      Provide constructive feedback in a supportive way.
      Return JSON format with corrections and suggestions.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this response: "${userMessage}"` }
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" }
      });

      const feedback = JSON.parse(completion.choices[0].message.content);
      
      return {
        corrections: feedback.corrections || [],
        suggestions: feedback.suggestions || [],
        score: feedback.score || 70,
        positives: feedback.positives || []
      };
    } catch (error) {
      console.error('Feedback analysis error:', error);
      return {
        corrections: [],
        suggestions: ["Keep practicing! You're doing great."],
        score: 70,
        positives: ["Good effort!"]
      };
    }
  },

  // 세션 평가
  async evaluateSession(messages, situation, feedbackHistory) {
    if (!openai) {
      return this.getDefaultEvaluation();
    }
    
    try {
      const userMessages = messages.filter(m => m.role === 'user');
      
      const systemPrompt = `Evaluate the overall performance in this English conversation practice.
      Situation: ${situation.title}
      Total exchanges: ${messages.length}
      
      Consider: grammar accuracy, vocabulary usage, conversation flow, appropriateness.
      Provide an overall score (0-100) and detailed feedback.
      Return JSON format.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Evaluate these responses: ${JSON.stringify(userMessages.map(m => m.content))}`
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      const evaluation = JSON.parse(completion.choices[0].message.content);
      
      return {
        score: evaluation.score || 75,
        strengths: evaluation.strengths || ["Good participation"],
        improvements: evaluation.improvements || ["Keep practicing"],
        grammar: evaluation.grammar || 70,
        vocabulary: evaluation.vocabulary || 70,
        fluency: evaluation.fluency || 70,
        appropriateness: evaluation.appropriateness || 80
      };
    } catch (error) {
      console.error('Session evaluation error:', error);
      return this.getDefaultEvaluation();
    }
  },

  // 폴백 메시지들
  getFallbackFirstMessage(situation) {
    const fallbacks = {
      'daegu_taxi': "Hello! Where would you like to go today?",
      'daegu_food': "Welcome! How many people in your party?",
      'daegu_shopping': "Hello! What are you looking for today?",
      'coffee_order': "Hi! Welcome to our cafe. What can I get for you today?",
      'hospital_visit': "Hello, how can I help you today? What brings you in?",
      'meeting_intro': "Good morning! Nice to meet you. I'm glad we could arrange this meeting."
    };
    
    return fallbacks[situation.id] || "Hello! How can I help you today?";
  },

  getFallbackResponse(situation, userMessage = '') {
    // 상황 ID 추출
    const situationId = typeof situation === 'string' ? situation : situation?.title || situation?.id || 'default';
    
    // 사용자 메시지를 소문자로 변환해서 키워드 분석
    const message = userMessage.toLowerCase();
    
    // 키워드 기반 지능형 응답 시스템
    return this.getSmartResponse(situationId, message);
  },

  // 지능형 키워드 분석 응답 시스템
  getSmartResponse(situationId, message) {
    // 공통 키워드 응답 (모든 상황에서 사용)
    const commonResponses = {
      greetings: {
        keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
        responses: {
          'daegu_taxi': "Hello! Where would you like to go today?",
          'daegu_food': "Welcome! What would you like to try today?",
          'daegu_shopping': "Hello! What are you looking for?",
          'coffee_order': "Hi! Welcome to our cafe. What can I get you?",
          'hospital_visit': "Hello! How can I help you today?",
          'meeting_intro': "Hello! Nice to meet you. Thanks for coming.",
          'default': "Hello! How can I help you today?"
        }
      },
      thanks: {
        keywords: ['thank', 'thanks', 'thank you'],
        responses: {
          'default': "You're welcome! Is there anything else I can help you with?"
        }
      },
      goodbye: {
        keywords: ['bye', 'goodbye', 'see you', 'have a good'],
        responses: {
          'default': "Goodbye! Have a wonderful day!"
        }
      },
      how_are_you: {
        keywords: ['how are you', 'how do you do', 'how have you been'],
        responses: {
          'default': "I'm doing great, thank you for asking! How about you?"
        }
      }
    };

    // 상황별 특정 키워드 응답
    const situationSpecificResponses = {
      'daegu_taxi': {
        location: {
          keywords: ['go to', 'take me', 'airport', 'station', 'hotel', 'downtown', 'suseong', 'dongdaegu'],
          responses: [
            "Sure, I can take you there. It will take about {time} minutes.",
            "That's a popular destination. Do you have the exact address?",
            "No problem! That's about {distance} away from here.",
            "Of course! I know that area well."
          ]
        },
        price: {
          keywords: ['how much', 'cost', 'price', 'fare', 'expensive'],
          responses: [
            "The fare will be around 10,000 to 15,000 won depending on traffic.",
            "It's usually about 12,000 won to that area.",
            "Don't worry, it's not too expensive. About 8,000 won."
          ]
        },
        time: {
          keywords: ['how long', 'time', 'minutes', 'quick', 'fast'],
          responses: [
            "It will take about 15-20 minutes depending on traffic.",
            "Usually about 10 minutes, but there might be some traffic.",
            "Pretty quick - just 5 minutes from here."
          ]
        }
      },
      'daegu_food': {
        recommendation: {
          keywords: ['recommend', 'suggest', 'popular', 'famous', 'best', 'good'],
          responses: [
            "I recommend our bulgogi! It's very popular with customers.",
            "Our bibimbap is excellent - it's a local specialty.",
            "You should try the galbi. It's one of our signature dishes.",
            "The kimchi jjigae is really good here."
          ]
        },
        spicy: {
          keywords: ['spicy', 'hot', 'mild', 'not spicy'],
          responses: [
            "How spicy would you like it? We can make it mild or very spicy.",
            "This dish is quite spicy. Would you like it less spicy?",
            "Don't worry, this one is not spicy at all.",
            "We can adjust the spice level for you."
          ]
        },
        menu: {
          keywords: ['menu', 'what do you have', 'options', 'dishes'],
          responses: [
            "We have Korean BBQ, bibimbap, bulgogi, and many soups.",
            "Our menu includes traditional Korean dishes and some fusion options.",
            "Would you like to see our menu? We have pictures too."
          ]
        }
      },
      'coffee_order': {
        drinks: {
          keywords: ['coffee', 'latte', 'americano', 'cappuccino', 'tea', 'drink'],
          responses: [
            "Great choice! Would you like that hot or iced?",
            "What size would you prefer - small, medium, or large?",
            "That's one of our most popular drinks!",
            "Would you like any extra shots or syrup with that?"
          ]
        },
        size: {
          keywords: ['size', 'small', 'medium', 'large', 'grande', 'venti'],
          responses: [
            "Perfect! And would you like that hot or iced?",
            "Good choice! Anything else I can add for you?",
            "Coming right up! Will that be for here or to go?"
          ]
        },
        food: {
          keywords: ['sandwich', 'cake', 'pastry', 'cookie', 'muffin', 'food'],
          responses: [
            "We have fresh sandwiches and pastries today!",
            "Our chocolate cake is really popular. Would you like to try it?",
            "All our pastries are made fresh daily."
          ]
        }
      }
    };

    // 1. 공통 키워드 체크
    for (const [category, data] of Object.entries(commonResponses)) {
      if (data.keywords.some(keyword => message.includes(keyword))) {
        const response = data.responses[situationId] || data.responses['default'];
        return response;
      }
    }

    // 2. 상황별 키워드 체크
    if (situationSpecificResponses[situationId]) {
      for (const [category, data] of Object.entries(situationSpecificResponses[situationId])) {
        if (data.keywords.some(keyword => message.includes(keyword))) {
          const responses = data.responses;
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          // 간단한 변수 치환
          return randomResponse
            .replace('{time}', Math.floor(Math.random() * 20) + 5)
            .replace('{distance}', Math.floor(Math.random() * 10) + 2 + 'km');
        }
      }
    }

    // 3. 기본 상황별 응답
    const defaultSituationResponses = {
      'daegu_taxi': [
        "Where would you like to go?",
        "Which area in Daegu are you heading to?",
        "Do you have a specific destination in mind?"
      ],
      'daegu_food': [
        "What kind of food are you in the mood for?",
        "Are you familiar with Korean cuisine?",
        "Would you like me to recommend something?"
      ],
      'daegu_shopping': [
        "What are you looking for today?",
        "Are you looking for anything specific?",
        "Let me know if you need any help finding something."
      ],
      'coffee_order': [
        "What can I get started for you?",
        "What would you like to try today?",
        "How can I help you today?"
      ],
      'hospital_visit': [
        "How are you feeling today?",
        "What brings you in today?",
        "How can I assist you?"
      ],
      'meeting_intro': [
        "Nice to meet you!",
        "Thank you for meeting with me.",
        "I'm looking forward to our discussion."
      ]
    };

    const responses = defaultSituationResponses[situationId] || [
      "I see. Can you tell me more about that?",
      "That's interesting. How can I help you?",
      "Could you please tell me more details?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  },

  getDefaultEvaluation() {
    return {
      score: 75,
      strengths: [
        "Good effort in completing the conversation",
        "Showed willingness to communicate"
      ],
      improvements: [
        "Practice more common phrases",
        "Work on grammar structures"
      ],
      grammar: 70,
      vocabulary: 70,
      fluency: 70,
      appropriateness: 80
    };
  }
};

module.exports = openaiService;