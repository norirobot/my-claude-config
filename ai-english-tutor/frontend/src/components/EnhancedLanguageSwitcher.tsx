import React, { useState } from 'react'
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
  Badge,
  Tooltip,
  Paper,
  Chip,
  useTheme,
  alpha
} from '@mui/material'
import {
  Language as LanguageIcon,
  Check as CheckIcon,
  Translate as TranslateIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../contexts/EnhancedLanguageContext'

const EnhancedLanguageSwitcher: React.FC = () => {
  const theme = useTheme()
  const { language, setLanguage, availableLanguages, isTransitioning } = useLanguage()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as any)
    handleClose()
  }

  const currentLanguage = availableLanguages.find(lang => lang.code === language)

  return (
    <>
      <Tooltip title="Change Language" placement="bottom">
        <IconButton
          onClick={handleClick}
          size="large"
          sx={{
            position: 'relative',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <Badge
            badgeContent={currentLanguage?.flag}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.9rem',
                right: -3,
                top: 3,
                backgroundColor: 'transparent'
              }
            }}
          >
            <motion.div
              animate={{ rotate: isTransitioning ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <LanguageIcon />
            </motion.div>
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 280,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Select Language
          </Typography>
        </Box>
        
        <Divider />
        
        <Box sx={{ py: 1 }}>
          <AnimatePresence>
            {availableLanguages.map((lang, index) => (
              <motion.div
                key={lang.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MenuItem
                  onClick={() => handleLanguageChange(lang.code)}
                  selected={language === lang.code}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2)
                      }
                    }
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '1.2rem',
                        backgroundColor: language === lang.code 
                          ? theme.palette.primary.main 
                          : theme.palette.grey[200]
                      }}
                    >
                      {lang.flag}
                    </Avatar>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1">
                          {lang.nativeName}
                        </Typography>
                        {lang.code === 'ko' && (
                          <Chip 
                            label="기본" 
                            size="small" 
                            color="primary" 
                            sx={{ height: 18 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {lang.name}
                      </Typography>
                    }
                  />
                  
                  {language === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <CheckIcon 
                        color="primary" 
                        sx={{ ml: 1 }}
                      />
                    </motion.div>
                  )}
                </MenuItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <TranslateIcon fontSize="small" color="info" />
            <Typography variant="caption" color="info.main" fontWeight="bold">
              AI Translation Active
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Content will be automatically translated to your selected language
          </Typography>
        </Box>
      </Menu>

      {/* 언어 변경 시 애니메이션 오버레이 */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: alpha(theme.palette.background.default, 0.8),
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <Paper
              elevation={8}
              sx={{
                p: 3,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <TranslateIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
              </motion.div>
              <Typography variant="body1" color="text.secondary">
                Changing language...
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// 간단한 언어 선택 버튼 그룹 컴포넌트
export const LanguageButtonGroup: React.FC = () => {
  const theme = useTheme()
  const { language, setLanguage, availableLanguages } = useLanguage()

  return (
    <Box display="flex" gap={1} p={1}>
      {availableLanguages.map((lang) => (
        <motion.div
          key={lang.code}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Chip
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                <span>{lang.flag}</span>
                <span>{lang.code.toUpperCase()}</span>
              </Box>
            }
            onClick={() => setLanguage(lang.code as any)}
            variant={language === lang.code ? "filled" : "outlined"}
            color={language === lang.code ? "primary" : "default"}
            sx={{
              cursor: 'pointer',
              fontWeight: language === lang.code ? 'bold' : 'normal',
              borderWidth: language === lang.code ? 2 : 1
            }}
          />
        </motion.div>
      ))}
    </Box>
  )
}

// 플로팅 언어 선택기 (모바일 친화적)
export const FloatingLanguageSwitcher: React.FC = () => {
  const theme = useTheme()
  const { language, setLanguage, availableLanguages } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  
  const currentLanguage = availableLanguages.find(lang => lang.code === language)

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000
      }}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              bottom: 70,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            {availableLanguages
              .filter(lang => lang.code !== language)
              .map((lang, index) => (
                <motion.div
                  key={lang.code}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <IconButton
                    onClick={() => {
                      setLanguage(lang.code as any)
                      setIsExpanded(false)
                    }}
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: 2,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                  </IconButton>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            width: 56,
            height: 56,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            boxShadow: 3,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            }
          }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{ fontSize: '1.8rem' }}>{currentLanguage?.flag}</span>
          </motion.div>
        </IconButton>
      </motion.div>
    </Box>
  )
}

export default EnhancedLanguageSwitcher