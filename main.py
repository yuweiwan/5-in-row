import datetime
from flask import Flask
from flask import render_template
from flask import request
from flask import redirect
from flask import jsonify
from flask import url_for
from flask_apscheduler import APScheduler
from Room import Room


app = Flask(__name__)
app.secret_key = 'abc'

dict_room = {
    '1': Room('1'),
    '2': Room('2'),
    '3': Room('3')
}

dict_user = {
    'james': '123456',
    'durant': '123456',
    'oven': '123456',
}


@app.route('/', methods=['GET'])
def run():
    return redirect('/login')


@app.route('/index', methods=['GET'])
def index():
    user_name = request.args.get('user_name')
    if user_name is None or user_name == '':
        return redirect('/login')
    return render_template('index.html', user_name=user_name)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        user_name = request.form.get('user_name')
        password = request.form.get('password')
        if user_name in dict_user and dict_user[user_name] == password:
            #session['user_name'] = user_name
            return redirect(url_for('index', user_name=user_name))
        else:
            error = 'User Name or Password error!'
            return render_template('login.html', error=error)


@app.route('/pvp_room_list', methods=['GET'])
def pvp_room_list():
    global dict_room
    user_name = request.args.get('user_name')
    if user_name is None or user_name == '':
        return redirect('/login')
    label = ['Room Id', 'Number of players']
    table = []
    for key in dict_room:
        list_room_info = [key, len(dict_room[key].dict_player)]
        table.append(list_room_info)
    return render_template('pvp_room_list.html', label=label, table=table, user_name=user_name)


@app.route('/enter_room', methods=['GET'])
def enter_room():
    global dict_room
    user_name = request.args.get('user_name')
    if user_name is None or user_name == '':
        return redirect('/login')
    room_id = request.args.get('room_id')
    # user_name = session['user_name']
    # if room is full in fact
    room = dict_room[room_id]
    if room.is_full():
        error = "This room is full!"
        return redirect('/pvp_room_list', error=error, user_name=user_name)
    else:
        # session['room_id'] = room_id
        if len(room.dict_player) == 0:
            room.dict_player[user_name] = {
                "heart_beat": datetime.datetime.now(),
                "color": 1
            }
        else:
            # avoid one player enter a room twice
            if user_name not in room.dict_player:
                room.dict_player[user_name] = {
                    "heart_beat": datetime.datetime.now(),
                    "color": -1
                }
            else:
                room.dict_player[user_name]['heart_beat'] = datetime.datetime.now()
        if room.is_full():
            players_ready = 'YES'
        else:
            players_ready = 'NO'
        return render_template('pvp.html', user_name=user_name, players_ready=players_ready,
                               room_id=room_id)


@app.route('/game_over', methods=['POST'])
def game_over():
    global dict_room
    room_id = request.form.get('room_id')
    dict_room[room_id].reload()
    return 'success'


@app.route('/pvc', methods=['GET'])
def pvc():
    user_name = request.args.get('user_name')
    if user_name is None or user_name == '':
        return redirect('/login')
    return render_template('pvc.html', user_name=user_name)


@app.route('/heart_beat', methods=['POST'])
def heart_beat():
    user_name = request.form.get('user_name')
    if user_name is None or user_name == '':
        return redirect('/login')
    global dict_room
    try:
        # room_id = session['room_id']
        room_id = request.form.get('room_id')
        # user_name = session['user_name']
        user_name = request.form.get('user_name')
        res = {}
        if user_name in dict_room[room_id].dict_player:
            dict_room[room_id].dict_player[user_name]['heart_beat'] = datetime.datetime.now()
            # print(room_id + "-" + user_name + " heart beat success...")
            if len(dict_room[room_id].dict_player) == 2:
                res = {
                    "players_ready": "YES",
                    "now_step": dict_room[room_id].now_step,
                    "color": dict_room[room_id].dict_player[user_name]['color'],
                    "room_color": dict_room[room_id].Color
                }
                return res
            else:
                res = {
                    "players_ready": "NO",
                    "now_step": dict_room[room_id].now_step,
                    "color": dict_room[room_id].dict_player[user_name]['color'],
                    "room_color": dict_room[room_id].Color
                }
                return res
    finally:
        return jsonify(res)


@app.route('/get_color', methods=['POST'])
def get_color():
    global dict_room
    user_name = request.form.get('user_name')
    if user_name is None or user_name == '':
        return redirect('/login')
    # room_id = session['room_id']
    room_id = request.form.get('room_id')
    color = dict_room[room_id].Color
    return str(color)


@app.route('/get_chess', methods=['POST'])
def get_chess():
    global dict_room
    user_name = request.form.get('user_name')
    if user_name is None or user_name == '':
        return redirect('/login')
    # room_id = session['room_id']
    room_id = request.form.get('room_id')
    chess_data = dict_room[room_id].position
    return jsonify(chess_data)


@app.route('/update_chess', methods=['POST'])
def update_chess():
    global dict_room
    user_name = request.form.get('user_name')
    if user_name is None or user_name == '':
        return redirect('/login')
    # room_id = session['room_id']
    room_id = request.form.get('room_id')
    i = int(request.form.get('i'))
    j = int(request.form.get('j'))
    color = int(request.form.get('color'))
    dict_room[room_id].position[i][j] = color
    winner = dict_room[room_id].is_winner()
    dict_room[room_id].now_step += 1
    dict_room[room_id].steps.append([i, j, color])
    dict_room[room_id].Color = -1 * color # change control
    data = {
        "winner": winner
    }
    return jsonify(data)


@app.route("/step", methods=['POST'])
def step():
    global dict_room
    user_name = request.form.get('user_name')
    if user_name is None or user_name == '':
        return redirect('/login')
    # room_id = session['room_id']
    room_id = request.form.get('room_id')
    room = dict_room[room_id]
    req_step = {
        'steps': room.steps,
        'winner': room.winner
    }
    return jsonify(req_step)


def timer_job():
    try:
        global dict_room
        for room_id in dict_room:
            room = dict_room[room_id]
            list_remove = []
            for user_name in room.dict_player:
                user_info = room.dict_player[user_name]
                if (datetime.datetime.now() - user_info['heart_beat']).seconds > 5:
                    list_remove.append(user_name)
            for user_name in list_remove:
                del room.dict_player[user_name]
    finally:
        # print("job run" + " " + str(datetime.datetime.now()))
        return 0


def timer_task():
    scheduler = APScheduler()
    scheduler.init_app(app)
    # time job
    scheduler.add_job(func=timer_job, trigger='interval', seconds=2, id='my_job_id')
    scheduler.start()


# out of main function
timer_task()

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5002, debug=True)
