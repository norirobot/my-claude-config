import { configureStore } from '@reduxjs/toolkit'

// 슬라이스들 (향후 추가 예정)
// import authSlice from './slices/authSlice'
// import chatSlice from './slices/chatSlice'
// import tutorSlice from './slices/tutorSlice'
// import learningSlice from './slices/learningSlice'

// 임시 더미 리듀서 (Redux store 오류 방지)
const dummySlice = {
  name: 'app',
  initialState: { initialized: true },
  reducers: {}
}

export const store = configureStore({
  reducer: {
    app: (state = dummySlice.initialState) => state,
    // 향후 슬라이스들 추가
    // auth: authSlice,
    // chat: chatSlice,  
    // tutor: tutorSlice,
    // learning: learningSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch