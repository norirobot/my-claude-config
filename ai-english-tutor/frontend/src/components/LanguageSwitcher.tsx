import React, { useState } from 'react'
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  SelectChangeEvent,
  Fade
} from '@mui/material'
import { Language as LanguageIcon } from '@mui/icons-material'
import { useLanguage } from '../contexts/LanguageContext'
import { languages, LocaleKey } from '../locales'

interface LanguageSwitcherProps {
  variant?: 'header' | 'settings' | 'compact'
  showLabel?: boolean
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'header',
  showLabel = true 
}) => {
  const { language, setLanguage, t, isLoading } = useLanguage()
  const [isChanging, setIsChanging] = useState(false)

  const handleLanguageChange = async (event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value as LocaleKey
    if (newLanguage !== language) {
      setIsChanging(true)
      
      // 부드러운 전환을 위한 짧은 딜레이
      setTimeout(() => {
        setLanguage(newLanguage)
        setIsChanging(false)
      }, 150)
    }
  }

  if (isLoading) {
    return null
  }

  const getStyles = () => {
    switch (variant) {
      case 'header':
        return {
          minWidth: 120,
          height: 36,
          '& .MuiSelect-select': {
            py: 1,
            px: 1.5,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem'
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'secondary.main',
          },
          color: 'inherit'
        }
      
      case 'settings':
        return {
          minWidth: 200,
          '& .MuiSelect-select': {
            py: 1.5,
            px: 2,
            display: 'flex',
            alignItems: 'center'
          }
        }
      
      case 'compact':
        return {
          minWidth: 100,
          height: 32,
          '& .MuiSelect-select': {
            py: 0.5,
            px: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.875rem'
          }
        }
      
      default:
        return {}
    }
  }

  return (
    <Fade in={!isChanging} timeout={300}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showLabel && variant !== 'compact' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LanguageIcon sx={{ fontSize: 18, opacity: 0.7 }} />
            {variant === 'settings' && (
              <Typography variant="body2" color="text.secondary">
                {t.settings.language}
              </Typography>
            )}
          </Box>
        )}
        
        <FormControl size="small">
          <Select
            value={language}
            onChange={handleLanguageChange}
            sx={getStyles()}
            MenuProps={{
              PaperProps: {
                sx: {
                  mt: 1,
                  '& .MuiMenuItem-root': {
                    py: 1,
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    minHeight: 'auto'
                  }
                }
              }
            }}
          >
            {languages.map((lang) => (
              <MenuItem 
                key={lang.code} 
                value={lang.code}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    }
                  }
                }}
              >
                <Typography component="span" sx={{ fontSize: '1.2rem', mr: 0.5 }}>
                  {lang.flag}
                </Typography>
                <Typography 
                  variant={variant === 'compact' ? 'body2' : 'body1'}
                  sx={{ 
                    fontWeight: language === lang.code ? 600 : 400,
                    color: language === lang.code ? 'primary.main' : 'text.primary'
                  }}
                >
                  {lang.name}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Fade>
  )
}

export default LanguageSwitcher