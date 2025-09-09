#-*-coding:utf-8 -*-

'''
여러분의 시크릿 키와 엑세스 키를 
ende_key.py에 있는 키를 활용해서 암호화한 값을 넣으세요

마찬가지 방법으로 아래 로직을 실행하시면 됩니다.. (ende_key.py 참조)
'''

from cryptography.fernet import Fernet

class SimpleEnDecrypt:
    def __init__(self, key=None):
        if key is None: # 키가 없다면
            key = Fernet.generate_key() # 키를 생성한다
        self.key = key
        self.f   = Fernet(self.key)
    
    def encrypt(self, data, is_out_string=True):
        if isinstance(data, bytes):
            ou = self.f.encrypt(data) # 바이트형태이면 바로 암호화
        else:
            ou = self.f.encrypt(data.encode('utf-8')) # 인코딩 후 암호화
        if is_out_string is True:
            return ou.decode('utf-8') # 출력이 문자열이면 디코딩 후 반환
        else:
            return ou
        
    def decrypt(self, data, is_out_string=True):
        if isinstance(data, bytes):
            ou = self.f.decrypt(data) # 바이트형태이면 바로 복호화
        else:
            ou = self.f.decrypt(data.encode('utf-8')) # 인코딩 후 복호화
        if is_out_string is True:
            return ou.decode('utf-8') # 출력이 문자열이면 디코딩 후 반환
        else:
            return ou

         

simpleEnDecrypt = SimpleEnDecrypt(b'SsEfGs-kxiuNzeaoKrYMZkG9i1kgOC20BhbYPHarFL8=') #ende_key.py 에 있는 키를 넣으세요

'''
#학원 ip
upbit_access = "9q8XGQAfxoPOGD3i0H2ZBlZ5I1iDGLD2g6IOjBD8"          # 본인 값으로 변경
upbit_secret = "TR5CVi1W5mxPagdAcoDl1kw0WOzNI1XUxTge75Qx"          # 본인 값으로 변경
'''

#집 ip
upbit_access = "9w9Mb82ky8FOANydKewvfo3jIMb1e0v69mQc8rru"          # 본인 값으로 변경
upbit_secret = "9rOTtCIHD6dAh6csoFF1uiZ0bjzxOrQLrJOC0mib"          # 본인 값으로 변경

binance_access = "yNX7OXrZeQO8YzctMrEfmmIBmW1WSQQJt6bVmnr2PjZVbM5zL1WhO9mlA0DXPWD9"          # 본인 값으로 변경
binance_secret = "Wkf40IJUbj7ik5SceTGHWSlCMvXz1thXuhORmjy9to9PSLkfNDff2MKasDy2G8HJ"          # 본인 값으로 변경


print("access_key: ", simpleEnDecrypt.encrypt(upbit_access))
print("scret_key: ", simpleEnDecrypt.encrypt(upbit_secret))
print("access_key: ", simpleEnDecrypt.encrypt(binance_access))
print("scret_key: ", simpleEnDecrypt.encrypt(binance_secret))



# 학원 ip
#upbit_access = "gAAAAABh5rkgE8_DITgoZSixp3znjL7leTa20tM_uIDN1xPRfWLbtSjyEiG3oTkGsLRkt38Vj6yZ5T3CouSHzunlO5wW3Rs3iEDG4w97AR7wwDWnf9rEabLYPnipHrhYSn7kyaBXbNot"          # 본인 값으로 변경
#upbit_secret = "gAAAAABh5rkgA_kqg3EwYdb2STA9DvNX7B8kT8oBDaX4WTPs9FirpJXs19sPfevJxsRZugl9SqlAkJavzaiNHIYdAROhb00n_x5j7QZPwsEiWURx5GtaeJ_rquIuQ3whFTd1UC3AeHyj"          # 본인 값으로 변경
# 학원에서 사용할경우, 집은 주석처리 학원은 주석처리 풀어주고 저장후 다시 파일질라 업로드 /  크론탭 사용하기 위해서는 aws 인스턴스 ip도 변경해야됨.

#집 ip

upbit_access = "gAAAAABh7KUzL-gR7SIlBw8lQBRW0IUdUyJ7Mt9EYJrXFXY5NEZd7NwlWiXF9F8kKoY6oFNj8eI91R-6cLo_YgER8zuz1-3T_Hh313mrJ3JTG2MwF3DyY5qAOL5_h-7avFqNe0ojey-V"          # 본인 값으로 변경
upbit_secret = "gAAAAABh7KUz2-MeqhKtHWGjPgEcHt0kLPKuF23rEKSNTyAfH7Wc7yQOjQZkcuAQnUNHXcE6rjm7I9UaJ5mSMCkIsheJLcZICLJPQmnfcfa0VEhFK0sQ08ztZupUr0ACYKbo9w9-yw_O"          # 본인 값으로 변경



binance_access = "gAAAAABh96-ODUldRqAMb_QrC0J5bfnILydTqMYNrIYWOcF0qCtJZeJ-ExfERgnb5nhnle8ryu9PYNUqtUATIg1p-UK2jd6qs-IP7Mn03qEzbQHzHgIG9QIyZ_VGu6p2gKtW8jdviYxdvONRRhFrIUBXMGc0WZ2ILk7Q3Uqu2Y-GTWzLpZ0u_9w="          # 본인 값으로 변경
binance_secret = "gAAAAABh96-OCd-3t_rXacJ_fQiJscXFDd8B-pfNSYXoT4e8RK2f7X8aBwcvYcWDr5YbjYmvlvobarm3UXOqGMCK-CmFKv6YwO9oaEd7PpMvDnSiUNCMeAeZsKqRLrb4C2-Q9bNT77TSoJVkXJGOcixcyemJuJW2NxvkgMoYWPmxMoY_uOz_f_I="          # 본인 값으로 변경
