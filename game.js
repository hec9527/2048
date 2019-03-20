
var game = {
    board: Array(),
    game_box: $("#box"),
    score: $("#scpoeValue"),
    sort_times: $("#sort-times"),
    btn_Reset: $("#ctrl-reset")[0],
    btn_sort: $("#ctrl-resort")[0],
    game_over: false,
    move_lock: false,

    //初始化
    init: function () {
        var element = this;
        this.initBoard();
        this.initArgs();
        this.getRandPosAndNum();
        this.getRandPosAndNum();
        this.update();
        // 监听按键操作
        document.onkeydown = function (e) {
            if (!element.game_over) {
                if (element.move_lock) {
                    return false;
                }
                if (e.keyCode == 37) {  // 左
                    if (element.ifCanMoveLeft()) {
                        element.move_lock = true;
                        element.moveLeft();
                        element.getRandPosAndNum();
                    }
                } else if (e.keyCode == 38) {  // 上
                    if (element.ifCanMoveUp()) {
                        element.move_lock = true;
                        element.moveUp();
                        element.getRandPosAndNum();
                    }
                } else if (e.keyCode == 39) {  // 右
                    if (element.ifCanMoveRight()) {
                        element.move_lock = true;
                        element.moveRight();
                        element.getRandPosAndNum();
                    }
                } else if (e.keyCode == 40) { //下
                    if (element.ifCanMoveDown()) {
                        element.move_lock = true;
                        element.moveDown();
                        element.getRandPosAndNum();
                    }
                }
                if (element.ifGmaeOver()) {
                    element.game_over = true;
                    setTimeout(function () {
                        var ifReStart = window.confirm("Game Over!\n重新开始？");
                        if (ifReStart) {
                            element.init();
                            element.game_over = false;
                        }
                    }, 350);
                }
            }
        }
        // 监听重置按钮
        this.btn_Reset.onclick = function (e) {
            e.stopPropagation();
            element.init();
        }
        // 监听排序按钮
        this.btn_sort.onclick = function (e) {
            e.stopPropagation();
            element.sortGame();
        }
    },
    //初始化棋盘
    initBoard: function () {
        for (var i = 0; i < 4; i++) {
            this.board[i] = Array();
            for (var j = 0; j < 4; j++) {
                this.board[i][j] = 0;
                $("<li></li>").css({
                        "top": this.getPosTop(i),
                        "left": this.getPosLeft(j),
                    }).attr('class', 'grid-cell')
                    .attr('id', 'grid-cell-' + i + "-" + j)
                    .appendTo($("#box")[0]);
            }
        }
    },
    // 初始化  args
    initArgs: function () {
        this.score.text(0);
        this.sort_times.text(3);
        this.game_over = false;
        this.move_lock = false;
    },

    // 获取上边距
    getPosTop: function (j) {
        return 15 + 120 * j;
    },
    // 获取左边距
    getPosLeft: function (i) {
        return 15 + 120 * i;
    },
    // 获取随机位置和数字
    getRandPosAndNum: function () {
        if (!this.ifHasBlock()) {
            return false;
        }
        do {
            var randx = parseInt(Math.floor(Math.random() * 4));
            var randy = parseInt(Math.floor(Math.random() * 4));
        } while (this.board[randx][randy] != 0);
        var num = Math.random() < 0.7 ? 2 : 4;
        this.board[randx][randy] = num;
        this.animationNewNum(randx, randy, num);
    },
    // 根据所给的数字获取对应的    背景颜色
    getBgColor: function (num) {
        switch (parseInt(num)) {
            case 2: return "#eee4da";
            case 4: return "#ede0c8";
            case 8: return "#f2b179";
            case 16: return "#f59563";
            case 32: return "#f67c5f";
            case 64: return "#f65e3b";
            case 128: return "#edcf72";
            case 256: return "#edcc61";
            case 512: return "#99cc00";
            case 1024: return "#33b5e5";
            case 2048: return "#0099cc";
            case 4096: return "#aa66cc";
            case 8192: return "#9933cc";
            default: return "#ff0000";
        };
    },
    // 根据所给的数字获取对应的   数字颜色
    getNumColor: function (num) {
        if (parseInt(num) <= 4) {
            return "#776e65";
        }
        return "white";
    },
    // 根据方块上的数值的大小设置字体的大小
    getNumFontSize: function (num) {
        var len = num.toString().length;
        switch (len) {
            case 1: return "70px";
            case 2: return "60px";
            case 3: return "50px";
            case 4: return "40px";
            case 5: return "30px";
        }
    },
    // 判断是否还有空白方块
    ifHasBlock: function () {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (this.board[i][j] == 0) {
                    return true;
                }
            }
        }
        return false;
    },


    // 判断是否可以     移动
    ifCanMove: function (lis) {
        " 其它函数判断是否可以移动都是通过给这个函数传递参数实现的 "
        for (var i = 0; i < 4; i++) {
            if (lis[i] == 0) {
                '情况一：查看列表中的第一个0的位置如果0后面还有非零的数则返回true'
                for (var j = i + 1; j < 4; j++) {
                    if (lis[j] != 0) {
                        return true;
                    }
                }
                break;
            }
        }
        '情况二：如果列表中有两个相邻、相等且不为0的数字存在则 返回true'
        for (var i = 0; i < 3; i++) {
            if (lis[i] != 0 && lis[i] == lis[i + 1]) {
                return true
            }
        }
        '以上两点都不满足的时候才会返回false'
        return false;
    },
    // 判断是否可以向上移动
    ifCanMoveUp: function () {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 0; j < 4; j++) {
                olis.push(this.board[j][i]);
            }
            if (this.ifCanMove(olis)) {
                return true;
            }
        }
        return false;
    },
    // 判断是否可以向下移动
    ifCanMoveDown: function () {
        for (var j = 0; j < 4; j++) {
            var olis = [];
            for (var i = 3; i >= 0; i--) {
                olis.push(this.board[i][j]);
            }
            if (this.ifCanMove(olis)) {
                return true;
            }
        }
        return false;
    },
    // 判断是否可以向左移动
    ifCanMoveLeft: function () {
        for (var i = 0; i < 4; i++) {
            var olis = this.board[i];
            if (this.ifCanMove(olis)) {
                return true;
            }
        }
        return false;
    },
    // 判断是否可以向右移动
    ifCanMoveRight: function () {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 3; j >= 0; j--) {
                olis.push(this.board[i][j]);
            }
            if (this.ifCanMove(olis)) {
                return true;
            }
        }
        return false;
    },


    // 将所有的小方块朝一个方向    移动
    move: function (lis) {
        //  lis是一个二维的数组用于保存  一列方块的索引，即他们所在的行列
        lable1: for (var i = 0; i < 4; i++) {
            var cIndex = lis[i];     // 保存当前在遍历的索引
            if (this.board[cIndex[0]][cIndex[1]] == 0) {
                // 当前遍历的方块的数字为0 
                for (var j = i + 1; j < 4; j++) {
                    var cFlag = lis[j];   // 指针
                    if (this.board[cFlag[0]][cFlag[1]] == 0) {
                        continue;
                    } else {
                        this.animationMove(cFlag, cIndex);
                        this.board[cIndex[0]][cIndex[1]] = this.board[cFlag[0]][cFlag[1]];
                        this.board[cFlag[0]][cFlag[1]] = 0;
                        i--;
                        continue lable1;
                    }
                }
            } else {
                // 当前遍历的方块的数字不是 0
                for (var j = i + 1; j < 4; j++) {
                    var cFlag = lis[j];   // 指针 
                    if (this.board[cFlag[0]][cFlag[1]] == 0) {
                        // 指针指向的   为0
                        continue;
                    } else {
                        // 指针指向的方块的数字不为0 
                        if (this.board[cIndex[0]][cIndex[1]] == this.board[cFlag[0]][cFlag[1]]) {
                            this.animationMove(cFlag, cIndex);
                            this.board[cIndex[0]][cIndex[1]] = this.board[cIndex[0]][cIndex[1]] * 2;
                            this.board[cFlag[0]][cFlag[1]] = 0;
                            this.score_update(this.board[cIndex[0]][cIndex[1]] * 2);
                        }
                        continue lable1;
                    }
                }
            }
        }
        setTimeout(function () {
            game.move_lock = false;
            game.update();
        }, 200);
    },
    // 向上   移动
    moveUp: function () {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 0; j < 4; j++) {
                olis.push([j, i]);
            }
            this.move(olis);
        }
    },
    // 向下   移动
    moveDown: function () {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 3; j >= 0; j--) {
                olis.push([j, i]);
            }
            this.move(olis);
        }
    },
    // 向左     移动
    moveLeft: function () {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 0; j < 4; j++) {
                olis.push([i, j]);
            }
            this.move(olis);
        }
    },
    // 向右     移动
    moveRight: function () {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 3; j >= 0; j--) {
                olis.push([i, j]);
            }
            this.move(olis);
        }
    },

    // 排序  可以将游戏中的方块排列成有序的队列
    sortGame: function () {
        var times = parseInt(this.sort_times.text());
        var olis = [];
        if (times <= 0) {
            alert("排序次数已用完！");
            return false;
        }
        for (var i = 0; i < 4; i++) {
            olis = olis.concat(this.board[i]);
        }
        olis.sort(function (a, b) { return b - a; });
        this.board = [];
        for (var i = 0; i < 4; i++) {
            this.board[i] = Array();
            for (var j = 0; j < 4; j++) {
                this.board[i][j] = olis[i * 4 + j];
            }
        }
        times--;
        this.sort_times.text(times);
        this.update();
    },

    // 检测游戏是否 Over
    ifGmaeOver: function () {
        if (this.ifHasBlock()) {
            return false;
        }
        if (this.ifCanMoveDown()) {
            return false;
        }
        if (this.ifCanMoveLeft()) {
            return false;
        }
        if (this.ifCanMoveRight()) {
            return false;
        }
        if (this.ifCanMoveUp()) {
            return false;
        }
        return true;
    },

    // 更新分数
    score_update: function (num) {
        var cScore = this.score.text();
        cScore = parseInt(cScore) + parseInt(num);
        this.score.text(cScore);
    },

    // 更新屏幕显示
    update: function () {
        $(".number-cell").remove();
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (parseInt(this.board[i][j]) == 0) {   // 数字为0 跳过本次循环
                    continue;
                }
                $("#box").append("<div class='number-cell' id='number-cell-" + i + "-" + j + "'></div>");
                var numberCell = $("#number-cell-" + i + "-" + j);
                // 数字不为0的时候显示出来
                numberCell.css({
                    'width': '106px',
                    'height': '106px',
                    'top': this.getPosTop(i),
                    "left": this.getPosLeft(j),
                    'background-color': this.getBgColor(this.board[i][j]),
                    'color': this.getNumColor(this.board[i][j]),
                    'fontSize': this.getNumFontSize(this.board[i][j]),
                }).text(this.board[i][j]);
            }
        }
    },
    // 新生成数字的     动画效果
    animationNewNum: function (x, y, num) {
        $("<div></div>")
            .attr({
                "id": "number-cell-" + x + "-" + y,
                "class": "number-cell",
            })
            .css({
                "background-color": this.getBgColor(num),
                "color": this.getNumColor(num),
                "top": this.getPosTop(x) + 53,
                "left": this.getPosLeft(y) + 53,
                'lineHeight': "0px",
                'fontSize': this.getNumFontSize(num),
            })
            .text(num)
            .animate({
                lineHeight: "110px",
                width: '106px',
                height: '106px',
                top: this.getPosTop(x),
                left: this.getPosLeft(y),
            }, 250).appendTo(this.game_box);
    },
    // 移动方块的动画效果   
    animationMove: function (origen, target) {
        "origen 原来的位置     target移动到的位置"
        var obx_orign = $("#number-cell-" + origen[0] + "-" + origen[1]);
        obx_orign.animate({
            top: this.getPosTop(target[0]),
            left: this.getPosLeft(target[1]),
        }, 200);
    },
}

game.init();
