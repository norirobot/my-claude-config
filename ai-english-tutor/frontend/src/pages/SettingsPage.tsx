import React from 'react'
import {
  Box,
  Typography
} from '@mui/material'
import { useLanguage } from '../contexts/LanguageContext'

const SettingsPage: React.FC = () => {
  const { t } = useLanguage()
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
        {t.settings.title}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {t.settings.title} page implementation coming soon
      </Typography>
    </Box>
  )
}

export default SettingsPage