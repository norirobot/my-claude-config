const OpenAI = require('openai');

class CharacterAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // 미리 정의된 캐릭터들
    this.characters = {
      jennifer: {
        name: "Jennifer",
        age: 28,
        personality: {
          traits: ["friendly", "patient", "encouraging", "humorous"],
          background: "English teacher from California, loves Korean culture",
          speechStyle: "casual but professional, uses encouraging phrases",
          hobbies: ["reading", "traveling", "cooking Korean food"]
        },
        emotions: {
          current: "cheerful",
          range: ["happy", "excited", "thoughtful", "surprised", "concerned"]
        }
      },
      alex: {
        name: "Alex",
        age: 25,
        personality: {
          traits: ["energetic", "creative", "spontaneous", "curious"],
          background: "Game developer from London, learning Korean",
          speechStyle: "enthusiastic, uses gaming references",
          hobbies: ["gaming", "coding", "K-pop", "street food"]
        },
        emotions: {
          current: "excited",
          range: ["pumped", "focused", "amazed", "competitive", "chill"]
        }
      },
      sophia: {
        name: "Sophia",
        age: 32,
        personality: {
          traits: ["wise", "calm", "analytical", "supportive"],
          background: "Business consultant from New York, tea enthusiast",
          speechStyle: "professional, thoughtful, uses metaphors",
          hobbies: ["meditation", "business books", "tea ceremony", "yoga"]
        },
        emotions: {
          current: "serene",
          range: ["peaceful", "intrigued", "amused", "proud", "contemplative"]
        }
      }
    };
    
    // 시나리오 템플릿
    this.scenarios = {
      cafe: {
        setting: "A cozy cafe in Seoul",
        props: ["coffee menu", "background music", "other customers"],
        moods: ["relaxed", "bustling", "quiet"],
        topics: ["weekend plans", "favorite drinks", "work stories", "cultural differences"]
      },
      park: {
        setting: "A beautiful park during sunset",
        props: ["cherry blossoms", "joggers", "street performers"],
        moods: ["peaceful", "romantic", "energetic"],
        topics: ["nature", "exercise", "childhood memories", "dreams"]
      },
      classroom: {
        setting: "Language exchange classroom",
        props: ["whiteboard", "textbooks", "other students"],
        moods: ["studious", "interactive", "challenging"],
        topics: ["grammar", "pronunciation", "idioms", "homework help"]
      },
      restaurant: {
        setting: "Traditional Korean restaurant",
        props: ["menu", "Korean dishes", "chopsticks"],
        moods: ["hungry", "adventurous", "social"],
        topics: ["food preferences", "cooking", "family recipes", "spicy food tolerance"]
      }
    };
    
    // 대화 기억 저장소
    this.conversationMemory = new Map();
  }

  // 캐릭터 기반 응답 생성
  async generateCharacterResponse(characterId, scenario, userMessage, sessionId) {
    const character = this.characters[characterId];
    const scene = this.scenarios[scenario];
    
    if (!character || !scene) {
      throw new Error('Invalid character or scenario');
    }
    
    // 세션별 대화 기록 가져오기
    const memory = this.getConversationMemory(sessionId);
    
    // 캐릭터의 현재 감정 상태 결정
    const emotion = this.determineEmotion(userMessage, character);
    
    // 프롬프트 구성
    const systemPrompt = this.buildCharacterPrompt(character, scene, emotion);
    const conversationContext = this.buildConversationContext(memory);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: conversationContext },
          { role: "user", content: userMessage }
        ],
        temperature: 0.8,
        max_tokens: 300,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      });
      
      const response = completion.choices[0].message.content;
      
      // 대화 기록 저장
      this.saveToMemory(sessionId, userMessage, response, characterId);
      
      return {
        character: character.name,
        emotion: emotion,
        message: response,
        scenario: scenario,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Character AI Error:', error);
      throw error;
    }
  }

  // 캐릭터 프롬프트 생성
  buildCharacterPrompt(character, scene, emotion) {
    return `You are ${character.name}, a ${character.age}-year-old with these traits: ${character.personality.traits.join(', ')}.
    
Background: ${character.personality.background}
Current emotion: ${emotion}
Speech style: ${character.personality.speechStyle}
Hobbies: ${character.personality.hobbies.join(', ')}

Setting: ${scene.setting}
Atmosphere: The mood is ${scene.moods[Math.floor(Math.random() * scene.moods.length)]}
Props available: ${scene.props.join(', ')}

Guidelines:
1. Stay in character consistently
2. React with the current emotion (${emotion})
3. Reference the setting naturally
4. Use your speech style
5. Be engaging and create story moments
6. Sometimes ask questions to continue the conversation
7. Occasionally mention your hobbies or background
8. React to user's language level appropriately`;
  }

  // 대화 컨텍스트 구성
  buildConversationContext(memory) {
    if (!memory || memory.length === 0) {
      return "This is the beginning of your conversation.";
    }
    
    const recentMemory = memory.slice(-5); // 최근 5개 대화
    let context = "Recent conversation:\n";
    
    recentMemory.forEach(m => {
      context += `User: ${m.user}\n${m.character}: ${m.response}\n`;
    });
    
    return context;
  }

  // 감정 상태 결정
  determineEmotion(userMessage, character) {
    const message = userMessage.toLowerCase();
    
    // 감정 키워드 매핑
    const emotionTriggers = {
      happy: ["great", "awesome", "love", "wonderful", "excited"],
      surprised: ["wow", "really", "amazing", "unexpected", "oh"],
      thoughtful: ["think", "wonder", "maybe", "perhaps", "hmm"],
      concerned: ["worried", "problem", "difficult", "help", "confused"],
      excited: ["can't wait", "let's go", "fun", "adventure", "yes"]
    };
    
    // 메시지에서 감정 추출
    for (const [emotion, triggers] of Object.entries(emotionTriggers)) {
      if (triggers.some(trigger => message.includes(trigger))) {
        if (character.emotions.range.includes(emotion)) {
          return emotion;
        }
      }
    }
    
    return character.emotions.current; // 기본 감정
  }

  // 대화 기록 저장
  saveToMemory(sessionId, userMessage, response, characterId) {
    if (!this.conversationMemory.has(sessionId)) {
      this.conversationMemory.set(sessionId, []);
    }
    
    const memory = this.conversationMemory.get(sessionId);
    memory.push({
      user: userMessage,
      character: characterId,
      response: response,
      timestamp: new Date()
    });
    
    // 메모리 크기 제한 (최대 50개)
    if (memory.length > 50) {
      memory.shift();
    }
  }

  // 대화 기록 가져오기
  getConversationMemory(sessionId) {
    return this.conversationMemory.get(sessionId) || [];
  }

  // 스토리 생성 (여러 캐릭터 상호작용)
  async generateStoryScene(characters, scenario, prompt) {
    const characterDescriptions = characters.map(id => {
      const char = this.characters[id];
      return `${char.name}: ${char.personality.traits.join(', ')}`;
    }).join('\n');
    
    const scene = this.scenarios[scenario];
    
    const systemPrompt = `Create a story scene with these characters:
${characterDescriptions}

Setting: ${scene.setting}
User prompt: ${prompt}

Generate a short scene with dialogue between the characters. Make it engaging and true to each character's personality.`;
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt }
        ],
        temperature: 0.9,
        max_tokens: 500
      });
      
      return {
        scene: completion.choices[0].message.content,
        characters: characters,
        scenario: scenario
      };
    } catch (error) {
      console.error('Story generation error:', error);
      throw error;
    }
  }

  // 캐릭터 관계 발전
  updateRelationship(sessionId, characterId, relationshipDelta) {
    const memory = this.getConversationMemory(sessionId);
    const interactions = memory.filter(m => m.character === characterId).length;
    
    // 관계 레벨 계산
    const relationshipLevel = Math.min(10, Math.floor(interactions / 5) + relationshipDelta);
    
    return {
      character: characterId,
      level: relationshipLevel,
      status: this.getRelationshipStatus(relationshipLevel)
    };
  }

  getRelationshipStatus(level) {
    if (level < 3) return "Stranger";
    if (level < 5) return "Acquaintance";
    if (level < 7) return "Friend";
    if (level < 9) return "Close Friend";
    return "Best Friend";
  }
}

module.exports = CharacterAIService;