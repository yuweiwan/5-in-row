# 5-in-row （五子棋人人对战/人机对战）

How to run:

You need create a new project (I used Pycharm), and paste all the files into it. You need install flask and flask_apscheduler first.

command: python main.py 

If success, you can go to http://127.0.0.1:5002/ and log in.

There are three username-password stored: 

```
dict_user = {
    'james': '123456',
    'durant': '123456',
    'oven': '123456',
}
```

After login, you can choose player vs player or player vs computer. If you choose to play with computer, you will start right now. If you choose to play with player, you will need to enter a room. After you open one more page, login, enter that room, you will see the state change and the remind of who should play. Then you can start to simulate player vs player 5-in-row game. 
