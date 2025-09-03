// 세션 지속성 관리 서비스
const { v4: uuidv4 } = require('uuid');

// 세션 저장소 (실제로는 Redis나 데이터베이스 사용)
const sessionStorage = new Map();
const userSessions = new Map(); // userId -> Set of sessionIds
const sessionMetadata = new Map(); // sessionId -> metadata

class SessionPersistenceService {
  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // 5분마다 정리
  }

  // 세션 저장
  async saveSession(sessionId, sessionData) {
    try {
      const session = {
        ...sessionData,
        lastActivity: new Date(),
        savedAt: new Date()
      };

      sessionStorage.set(sessionId, session);

      // 사용자별 세션 목록 관리
      const userId = session.userId;
      if (!userSessions.has(userId)) {
        userSessions.set(userId, new Set());
      }
      userSessions.get(userId).add(sessionId);

      // 메타데이터 저장
      sessionMetadata.set(sessionId, {
        userId,
        situationId: session.situationId,
        startTime: session.startTime,
        lastActivity: session.lastActivity,
        messageCount: session.messages?.length || 0,
        status: session.isActive ? 'active' : 'ended'
      });

      console.log(`💾 Session ${sessionId} saved for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Session save error:', error);
      return false;
    }
  }

  // 세션 복원
  async restoreSession(sessionId, userId) {
    try {
      const session = sessionStorage.get(sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }

      // 사용자 권한 확인
      if (session.userId !== userId) {
        throw new Error('Unauthorized access to session');
      }

      // 만료 확인 (24시간)
      const maxAge = 24 * 60 * 60 * 1000; // 24시간
      const now = new Date();
      if (now - session.lastActivity > maxAge) {
        this.deleteSession(sessionId);
        throw new Error('Session expired');
      }

      // 활동 시간 업데이트
      session.lastActivity = now;
      sessionStorage.set(sessionId, session);

      console.log(`🔄 Session ${sessionId} restored for user ${userId}`);
      return {
        success: true,
        session: {
          ...session,
          canResume: session.isActive,
          messageHistory: session.messages || [],
          duration: now - new Date(session.startTime)
        }
      };
    } catch (error) {
      console.error('Session restore error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 사용자의 모든 세션 목록
  async getUserSessions(userId, options = {}) {
    try {
      const {
        includeEnded = false,
        limit = 10,
        sortBy = 'lastActivity'
      } = options;

      const userSessionIds = userSessions.get(userId) || new Set();
      const sessions = [];

      for (const sessionId of userSessionIds) {
        const session = sessionStorage.get(sessionId);
        const metadata = sessionMetadata.get(sessionId);

        if (session && metadata) {
          // 활성 세션만 포함하거나 모든 세션 포함
          if (includeEnded || session.isActive) {
            sessions.push({
              sessionId,
              ...metadata,
              duration: new Date() - new Date(session.startTime),
              canResume: session.isActive && !this.isSessionExpired(session)
            });
          }
        }
      }

      // 정렬
      sessions.sort((a, b) => {
        if (sortBy === 'lastActivity') {
          return new Date(b.lastActivity) - new Date(a.lastActivity);
        }
        return new Date(b.startTime) - new Date(a.startTime);
      });

      return {
        success: true,
        sessions: sessions.slice(0, limit),
        total: sessions.length
      };
    } catch (error) {
      console.error('Get user sessions error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 세션 업데이트
  async updateSession(sessionId, updates) {
    try {
      const session = sessionStorage.get(sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }

      // 업데이트 적용
      const updatedSession = {
        ...session,
        ...updates,
        lastActivity: new Date()
      };

      sessionStorage.set(sessionId, updatedSession);

      // 메타데이터 업데이트
      const metadata = sessionMetadata.get(sessionId);
      if (metadata) {
        sessionMetadata.set(sessionId, {
          ...metadata,
          lastActivity: updatedSession.lastActivity,
          messageCount: updatedSession.messages?.length || metadata.messageCount,
          status: updatedSession.isActive ? 'active' : 'ended'
        });
      }

      return {
        success: true,
        session: updatedSession
      };
    } catch (error) {
      console.error('Session update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 세션 삭제
  async deleteSession(sessionId) {
    try {
      const session = sessionStorage.get(sessionId);
      
      if (session) {
        const userId = session.userId;
        
        // 저장소에서 제거
        sessionStorage.delete(sessionId);
        sessionMetadata.delete(sessionId);
        
        // 사용자 세션 목록에서 제거
        if (userSessions.has(userId)) {
          userSessions.get(userId).delete(sessionId);
          
          // 빈 set 정리
          if (userSessions.get(userId).size === 0) {
            userSessions.delete(userId);
          }
        }

        console.log(`🗑️ Session ${sessionId} deleted`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session delete error:', error);
      return false;
    }
  }

  // 세션 백업
  async backupSession(sessionId) {
    try {
      const session = sessionStorage.get(sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }

      // 백업 생성 (실제로는 별도 저장소에 보관)
      const backup = {
        sessionId,
        backup: JSON.stringify(session),
        backedUpAt: new Date(),
        originalStartTime: session.startTime
      };

      // Mock 백업 저장 (실제로는 데이터베이스에 저장)
      console.log(`💾 Session ${sessionId} backed up`);
      return backup;
    } catch (error) {
      console.error('Session backup error:', error);
      throw error;
    }
  }

  // 세션 복구
  async recoverSession(backupData) {
    try {
      const session = JSON.parse(backupData.backup);
      const newSessionId = uuidv4();
      
      // 복구된 세션은 새로운 ID로 생성
      const recoveredSession = {
        ...session,
        sessionId: newSessionId,
        recoveredFrom: backupData.sessionId,
        recoveredAt: new Date(),
        lastActivity: new Date()
      };

      await this.saveSession(newSessionId, recoveredSession);
      
      console.log(`🔄 Session recovered as ${newSessionId} from backup`);
      return {
        success: true,
        newSessionId,
        session: recoveredSession
      };
    } catch (error) {
      console.error('Session recovery error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 활성 세션 통계
  getActiveSessionStats() {
    const stats = {
      totalActiveSessions: 0,
      totalUsers: userSessions.size,
      sessionsByStatus: {
        active: 0,
        ended: 0,
        expired: 0
      },
      sessionsBySituation: {},
      averageSessionDuration: 0
    };

    let totalDuration = 0;
    const now = new Date();

    for (const [sessionId, session] of sessionStorage.entries()) {
      if (session.isActive) {
        if (this.isSessionExpired(session)) {
          stats.sessionsByStatus.expired++;
        } else {
          stats.sessionsByStatus.active++;
          stats.totalActiveSessions++;
        }
      } else {
        stats.sessionsByStatus.ended++;
      }

      // 상황별 통계
      const situationId = session.situationId;
      if (!stats.sessionsBySituation[situationId]) {
        stats.sessionsBySituation[situationId] = 0;
      }
      stats.sessionsBySituation[situationId]++;

      // 지속 시간 계산
      const sessionDuration = (session.lastActivity || now) - new Date(session.startTime);
      totalDuration += sessionDuration;
    }

    if (sessionStorage.size > 0) {
      stats.averageSessionDuration = Math.round(totalDuration / sessionStorage.size / (1000 * 60)); // 분 단위
    }

    return stats;
  }

  // 세션 만료 확인
  isSessionExpired(session) {
    const maxAge = 24 * 60 * 60 * 1000; // 24시간
    const now = new Date();
    return (now - session.lastActivity) > maxAge;
  }

  // 만료된 세션 정리
  cleanupExpiredSessions() {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24시간
    let cleanedCount = 0;

    for (const [sessionId, session] of sessionStorage.entries()) {
      if ((now - session.lastActivity) > maxAge) {
        this.deleteSession(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  // 세션 이전 (디바이스 변경 등)
  async transferSession(sessionId, fromUserId, toUserId) {
    try {
      const session = sessionStorage.get(sessionId);
      
      if (!session || session.userId !== fromUserId) {
        throw new Error('Session not found or unauthorized');
      }

      // 사용자 ID 업데이트
      session.userId = toUserId;
      session.transferredAt = new Date();
      session.transferredFrom = fromUserId;

      // 사용자 세션 목록 업데이트
      if (userSessions.has(fromUserId)) {
        userSessions.get(fromUserId).delete(sessionId);
      }
      
      if (!userSessions.has(toUserId)) {
        userSessions.set(toUserId, new Set());
      }
      userSessions.get(toUserId).add(sessionId);

      // 메타데이터 업데이트
      const metadata = sessionMetadata.get(sessionId);
      if (metadata) {
        metadata.userId = toUserId;
        sessionMetadata.set(sessionId, metadata);
      }

      sessionStorage.set(sessionId, session);

      console.log(`🔄 Session ${sessionId} transferred from ${fromUserId} to ${toUserId}`);
      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('Session transfer error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 서비스 종료시 정리
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    sessionStorage.clear();
    userSessions.clear();
    sessionMetadata.clear();
    console.log('Session persistence service destroyed');
  }
}

// 싱글톤 인스턴스
const sessionPersistence = new SessionPersistenceService();

// 서비스 종료시 정리
process.on('SIGTERM', () => {
  sessionPersistence.destroy();
});

process.on('SIGINT', () => {
  sessionPersistence.destroy();
});

module.exports = sessionPersistence;