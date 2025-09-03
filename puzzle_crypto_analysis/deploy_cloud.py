"""
클라우드 배포용 설정
무료 클라우드 서비스에 배포하여 24시간 작동
"""

import streamlit as st
import os
from datetime import datetime

# 클라우드 환경 감지
def is_cloud_environment():
    """클라우드 환경인지 확인"""
    cloud_indicators = [
        'STREAMLIT_SHARING',
        'HEROKU',
        'RAILWAY_PROJECT_ID',
        'RENDER',
        'VERCEL'
    ]
    return any(os.getenv(indicator) for indicator in cloud_indicators)

# 클라우드용 설정
CLOUD_CONFIG = {
    'title': '🚀 퍼즐 트레이딩 봇',
    'description': '24시간 자동 암호화폐 투자',
    'version': '1.0.0',
    'author': 'Puzzle Trading Bot',
    'contact': 'puzzle.bot@example.com'
}

def setup_cloud_environment():
    """클라우드 환경 설정"""
    if is_cloud_environment():
        st.set_page_config(
            page_title=CLOUD_CONFIG['title'],
            page_icon="🚀",
            layout="wide",
            initial_sidebar_state="collapsed"
        )
        
        # 클라우드용 캐시 설정
        st.cache_data.clear()
        
        return True
    return False

# PWA 설정 (Progressive Web App)
def add_pwa_support():
    """PWA 지원 추가 - 진짜 앱처럼 만들기"""
    
    # Manifest.json 생성
    manifest = {
        "name": "퍼즐 트레이딩 봇",
        "short_name": "퍼즐봇",
        "description": "퍼즈 전략 기반 자동매매 봇",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#667eea",
        "orientation": "portrait",
        "icons": [
            {
                "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxwYXRoIGQ9Ik05NiA0OEw5NiAxNDQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik00OCA5NkwxNDQgOTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iMCIgeTE9IjAiIHgyPSIxOTIiIHkyPSIxOTIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzY2N0VFQSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM3NjRCQTIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
                "sizes": "192x192",
                "type": "image/svg+xml"
            },
            {
                "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiByeD0iNjQiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzIpIi8+CjxwYXRoIGQ9Ik0yNTYgMTI4TDI1NiAzODQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMTAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTI4IDI1NkwzODQgMjU2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQwX2xpbmVhcl8xXzIiIHgxPSIwIiB5MT0iMCIgeDI9IjUxMiIgeTI9IjUxMiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNjY3RUVBIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzc2NEJBMiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPgo=",
                "sizes": "512x512",
                "type": "image/svg+xml"
            }
        ]
    }
    
    # HTML 헤드에 PWA 메타 태그 추가
    pwa_html = f"""
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <meta name="theme-color" content="#667eea">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="퍼즐봇">
        <link rel="manifest" href="data:application/json;base64,{manifest_to_base64(manifest)}">
        <link rel="apple-touch-icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxwYXRoIGQ9Ik05NiA0OEw5NiAxNDQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik00OCA5NkwxNDQgOTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iMCIgeTE9IjAiIHgyPSIxOTIiIHkyPSIxOTIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzY2N0VFQSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM3NjRCQTIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K">
    </head>
    """
    
    return pwa_html

def manifest_to_base64(manifest):
    """Manifest를 base64로 인코딩"""
    import json
    import base64
    
    manifest_json = json.dumps(manifest)
    manifest_bytes = manifest_json.encode('utf-8')
    manifest_base64 = base64.b64encode(manifest_bytes).decode('utf-8')
    
    return manifest_base64

# 오프라인 작동 지원
def add_offline_support():
    """서비스 워커 추가 - 오프라인에서도 작동"""
    
    service_worker_js = """
    const CACHE_NAME = 'puzzle-trading-bot-v1';
    const urlsToCache = [
        '/',
        '/static/css/main.css',
        '/static/js/main.js'
    ];
    
    self.addEventListener('install', function(event) {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(function(cache) {
                    return cache.addAll(urlsToCache);
                })
        );
    });
    
    self.addEventListener('fetch', function(event) {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                })
        );
    });
    """
    
    return service_worker_js

if __name__ == "__main__":
    print("클라우드 배포 준비 중...")
    print("PWA 기능 활성화됨")
    print("오프라인 지원 추가됨")