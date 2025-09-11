const express = require('express');
const router = express.Router();
const CharacterAIService = require('../services/characterAIService');

// CharacterAI 서비스 인스턴스
const characterService = new CharacterAIService();

// 스토리 모드 채팅
router.post('/chat', async (req, res) => {
  try {
    const { character, scenario, message, sessionId } = req.body;
    
    if (!character || !scenario || !message || !sessionId) {
      return res.status(400).json({ 
        error: 'Missing required fields: character, scenario, message, sessionId' 
      });
    }
    
    const response = await characterService.generateCharacterResponse(
      character,
      scenario,
      message,
      sessionId
    );
    
    res.json(response);
  } catch (error) {
    console.error('Story chat error:', error);
    res.status(500).json({ 
      error: 'Failed to generate story response',
      details: error.message 
    });
  }
});

// 스토리 씬 생성 (여러 캐릭터)
router.post('/scene', async (req, res) => {
  try {
    const { characters, scenario, prompt } = req.body;
    
    if (!characters || !scenario || !prompt) {
      return res.status(400).json({ 
        error: 'Missing required fields: characters, scenario, prompt' 
      });
    }
    
    const scene = await characterService.generateStoryScene(
      characters,
      scenario,
      prompt
    );
    
    res.json(scene);
  } catch (error) {
    console.error('Story scene error:', error);
    res.status(500).json({ 
      error: 'Failed to generate story scene',
      details: error.message 
    });
  }
});

// 관계 레벨 업데이트
router.post('/relationship', async (req, res) => {
  try {
    const { sessionId, characterId, delta } = req.body;
    
    const relationship = characterService.updateRelationship(
      sessionId,
      characterId,
      delta || 0
    );
    
    res.json(relationship);
  } catch (error) {
    console.error('Relationship update error:', error);
    res.status(500).json({ 
      error: 'Failed to update relationship',
      details: error.message 
    });
  }
});

// 대화 기록 가져오기
router.get('/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = characterService.getConversationMemory(sessionId);
    
    res.json({ 
      sessionId,
      history,
      count: history.length 
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversation history',
      details: error.message 
    });
  }
});

// 캐릭터 목록 가져오기
router.get('/characters', (req, res) => {
  try {
    const characters = Object.entries(characterService.characters).map(([id, char]) => ({
      id,
      name: char.name,
      age: char.age,
      personality: char.personality.traits,
      background: char.personality.background,
      hobbies: char.personality.hobbies
    }));
    
    res.json(characters);
  } catch (error) {
    console.error('Characters fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch characters',
      details: error.message 
    });
  }
});

// 시나리오 목록 가져오기
router.get('/scenarios', (req, res) => {
  try {
    const scenarios = Object.entries(characterService.scenarios).map(([id, scene]) => ({
      id,
      setting: scene.setting,
      props: scene.props,
      moods: scene.moods,
      topics: scene.topics
    }));
    
    res.json(scenarios);
  } catch (error) {
    console.error('Scenarios fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch scenarios',
      details: error.message 
    });
  }
});

module.exports = router;