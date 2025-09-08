import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Divider,
  Paper,
  Stack
} from '@mui/material'
import {
  Stars as StarsIcon,
  ShoppingCart as ShoppingCartIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Payment as PaymentIcon
} from '@mui/icons-material'

interface PointsData {
  userId: number
  totalPoints: number
  availablePoints: number
  usedPoints: number
  transactions: Transaction[]
}

interface Transaction {
  id: number
  type: 'earned' | 'spent'
  amount: number
  description: string
  date: string
}

const PointsPage: React.FC = () => {
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState('basic')
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')

  const pointPackages = [
    {
      id: 'basic',
      name: '베이직 패키지',
      points: 1000,
      price: 9900,
      bonus: '0%',
      description: '기본 포인트 패키지'
    },
    {
      id: 'standard',
      name: '스탠다드 패키지',
      points: 2500,
      price: 24900,
      bonus: '+100P',
      description: '가장 인기있는 패키지'
    },
    {
      id: 'premium',
      name: '프리미엄 패키지',
      points: 5500,
      price: 49900,
      bonus: '+500P',
      description: '최고 가치 패키지'
    }
  ]

  useEffect(() => {
    fetchPointsData()
  }, [])

  const fetchPointsData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/points/1')
      const data = await response.json()
      setPointsData(data)
    } catch (error) {
      console.error('Failed to fetch points data:', error)
      showAlert('포인트 정보를 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    const selectedPkg = pointPackages.find(pkg => pkg.id === selectedPackage)
    if (!selectedPkg) return

    try {
      const response = await fetch('http://localhost:3001/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 1,
          amount: selectedPkg.price,
          packageType: selectedPackage
        })
      })

      const result = await response.json()
      if (result.success) {
        showAlert(`${selectedPkg.points}포인트 결제가 생성되었습니다!`, 'success')
        setPurchaseDialogOpen(false)
        // 실제로는 결제 페이지로 이동
        setTimeout(() => {
          verifyPayment(result.payment.paymentId)
        }, 2000)
      }
    } catch (error) {
      console.error('Payment creation failed:', error)
      showAlert('결제 생성에 실패했습니다.', 'error')
    }
  }

  const verifyPayment = async (paymentId: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentId })
      })

      const result = await response.json()
      if (result.success) {
        showAlert(`결제 완료! ${result.pointsEarned}포인트가 추가되었습니다.`, 'success')
        fetchPointsData() // 포인트 정보 새로고침
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
    }
  }

  const showAlert = (message: string, type: 'success' | 'error') => {
    setAlertMessage(message)
    setAlertType(type)
    setTimeout(() => setAlertMessage(''), 5000)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>로딩 중...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
        <StarsIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
        포인트 관리
      </Typography>

      {alertMessage && (
        <Alert severity={alertType} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 포인트 현황 카드 */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                내 포인트 현황
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {pointsData?.totalPoints || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      총 획득 포인트
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {pointsData?.availablePoints || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      사용 가능 포인트
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {pointsData?.usedPoints || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      사용한 포인트
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* 포인트 내역 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <HistoryIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                포인트 사용 내역
              </Typography>
              <List>
                {pointsData?.transactions.map((transaction) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem>
                      <ListItemText
                        primary={transaction.description}
                        secondary={transaction.date}
                      />
                      <Chip
                        label={`${transaction.amount > 0 ? '+' : ''}${transaction.amount}P`}
                        color={transaction.type === 'earned' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 포인트 구매 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                포인트 구매
              </Typography>
              <Stack spacing={2}>
                {pointPackages.map((pkg) => (
                  <Paper
                    key={pkg.id}
                    sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: pkg.id === 'standard' ? 'primary.main' : 'divider',
                      position: 'relative'
                    }}
                  >
                    {pkg.id === 'standard' && (
                      <Chip
                        label="인기"
                        color="primary"
                        size="small"
                        sx={{ position: 'absolute', top: -8, right: 8 }}
                      />
                    )}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {pkg.name}
                    </Typography>
                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                      {pkg.points.toLocaleString()}P
                      {pkg.bonus !== '0%' && (
                        <Chip
                          label={pkg.bonus}
                          size="small"
                          color="success"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {pkg.description}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ₩{pkg.price.toLocaleString()}
                    </Typography>
                  </Paper>
                ))}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PaymentIcon />}
                  onClick={() => setPurchaseDialogOpen(true)}
                  fullWidth
                >
                  포인트 구매하기
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 구매 다이얼로그 */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)}>
        <DialogTitle>포인트 패키지 선택</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
          >
            {pointPackages.map((pkg) => (
              <FormControlLabel
                key={pkg.id}
                value={pkg.id}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1">{pkg.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pkg.points.toLocaleString()}포인트 - ₩{pkg.price.toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handlePurchase}>
            결제하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PointsPage