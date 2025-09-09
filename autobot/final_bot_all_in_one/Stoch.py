#-*-coding:utf-8 -*-
import myUpbit   #우리가 만든 함수들이 들어있는 모듈
import time
import pyupbit

import ende_key  #암복호화키
import my_key    #업비트 시크릿 액세스키


'''
스토캐스틱 지표 함수를 추가했습니다!
'''
#암복호화 클래스 객체를 미리 생성한 키를 받아 생성한다.
simpleEnDecrypt = myUpbit.SimpleEnDecrypt(ende_key.ende_key)

#암호화된 액세스키와 시크릿키를 읽어 복호화 한다.
Upbit_AccessKey = simpleEnDecrypt.decrypt(my_key.upbit_access)
Upbit_ScretKey = simpleEnDecrypt.decrypt(my_key.upbit_secret)

#업비트 객체를 만든다
upbit = pyupbit.Upbit(Upbit_AccessKey, Upbit_ScretKey)

df = pyupbit.get_ohlcv("KRW-BTC",interval="minute15") #여기선 비트코인의 15분봉 데이타를 가져온다.

#스토캐스틱 함수를 사용해 값을 받아옵니다.
print("-----------------------------------------------")
#이전 캔들의 스토캐스틱
Stoch_dic_before = myUpbit.GetStoch(df,5,-2)
print("before - fast_k:",Stoch_dic_before['fast_k'],", slow_d:", Stoch_dic_before['slow_d'])

print("-----------------------------------------------")
#현재 캔들의 스토캐스틱
Stoch_dic_now = myUpbit.GetStoch(df,5,-1)
print("now - fast_k:",Stoch_dic_now['fast_k'],", slow_d:", Stoch_dic_now['slow_d'])














