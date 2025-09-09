import requests

#메세지를 보냅니다.
def SendMessage(msg):
    try:

        TARGET_URL = 'https://notify-api.line.me/api/notify'
        TOKEN = 'oPsulFbTNgnhfV3XxPBNQyfjpJgL1uwgcZdHnHMNVwi' #여러분의 값으로 변경_ 2022년 1월 17일 변경됨

        response = requests.post(
            TARGET_URL,
            headers={
                'Authorization': 'Bearer ' + TOKEN
            },
            data={
                'message': msg
            }
        )

    except Exception as ex:
        print(ex)