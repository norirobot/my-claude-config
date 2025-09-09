import React from 'react'
import {
  Box,
  Typography
} from '@mui/material'
import { useLanguage } from '../contexts/LanguageContext'

const ProfilePage: React.FC = () => {
  const { t } = useLanguage()
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        {t.profile.title}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {t.profile.title} page implementation coming soon
      </Typography>
    </Box>
  )
}

export default ProfilePage