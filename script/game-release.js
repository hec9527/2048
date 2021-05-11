/**
 *  @author         hc
 *  @ctime          2019/3/20
 *  @lastModifi     2019/3/21
 */

(function () {
    var board = Array();
    var score = $("#scpoeValue");
    var sort_times = $("#sort-times");
    var game_over = false;
    var move_lock = false;
    //初始化
    function init() {
        initBoard();
        initArgs();
        getRandPosAndNum();
        getRandPosAndNum();
        update();
        // 监听按键操作
        document.onkeydown = function (e) {
            if (!game_over) {
                if (move_lock) {
                    return false;
                }
                if (e.keyCode == 37) {  // 左
                    if (ifCanMoveLeft()) {
                        move_lock = true;
                        moveLeft();
                        getRandPosAndNum();
                    }
                } else if (e.keyCode == 38) {  // 上
                    if (ifCanMoveUp()) {
                        move_lock = true;
                        moveUp();
                        getRandPosAndNum();
                    }
                } else if (e.keyCode == 39) {  // 右
                    if (ifCanMoveRight()) {
                        move_lock = true;
                        moveRight();
                        getRandPosAndNum();
                    }
                } else if (e.keyCode == 40) { //下
                    if (ifCanMoveDown()) {
                        move_lock = true;
                        moveDown();
                        getRandPosAndNum();
                    }
                }
                if (ifGmaeOver()) {
                    game_over = true;
                    setTimeout(function () {
                        if (window.confirm("Game Over!\n重新开始？")) {
                            init();
                            game_over = false;
                        }
                    }, 350);
                }
            }
        }
        // 监听重置按钮
        $("#ctrl-reset")[0].onclick = function (e) {
            e.stopPropagation();  // 捕获事件冒泡
            init();
        }
        // 监听排序按钮
        $("#ctrl-resort")[0].onclick = function (e) {
            e.stopPropagation();
            sortGame();
        }
    }
    //初始化棋盘
    function initBoard() {
        for (var i = 0; i < 4; i++) {
            board[i] = Array();
            for (var j = 0; j < 4; j++) {
                board[i][j] = 0;
                $("<li></li>").css({
                    "top": getPos(i),
                    "left": getPos(j),
                }).attr('class', 'grid-cell')
                    .attr('id', 'grid-cell-' + i + "-" + j)
                    .appendTo($("#box")[0]);
            }
        }
    }
    // 初始化  args
    function initArgs() {
        score.text(0);
        sort_times.text(3);
        game_over = false;
        move_lock = false;
    }
    /**
     * @param i
     *  当给定的是一维索引的时候为左边距    二维索引的时候为右边距
     */
    function getPos(j) {
        return 15 + 120 * j;
    }
    // 获取随机位置和数字
    function getRandPosAndNum() {
        if (!ifHasBlock()) {
            return false;
        }
        do {
            var randx = parseInt(Math.floor(Math.random() * 4));
            var randy = parseInt(Math.floor(Math.random() * 4));
        } while (board[randx][randy] != 0);
        var num = Math.random() < 0.7 ? 2 : 4;
        board[randx][randy] = num;
        animationNewNum(randx, randy, num);
    }
    // 根据所给的数字获取对应的    背景颜色
    function getBgColor(num) {
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
    }
    // 根据所给的数字获取对应的   数字颜色
    function getNumColor(num) {
        if (parseInt(num) <= 4) {
            return "#776e65";
        }
        return "white";
    }
    // 根据方块上的数值的大小设置字体的大小
    function getNumFontSize(num) {
        var len = num.toString().length;
        switch (len) {
            case 1: return "70px";
            case 2: return "60px";
            case 3: return "50px";
            case 4: return "40px";
            case 5: return "30px";
        }
    }
    // 判断是否还有空白方块
    function ifHasBlock() {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (board[i][j] == 0) {
                    return true;
                }
            }
        }
        return false;
    }
    // 判断是否可以   移动
    function ifCanMove(lis) {
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
    }
    // 判断是否可以向上移动
    function ifCanMoveUp() {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 0; j < 4; j++) {
                olis.push(board[j][i]);
            }
            if (ifCanMove(olis)) {
                return true;
            }
        }
        return false;
    }
    // 判断是否可以向下移动
    function ifCanMoveDown() {
        for (var j = 0; j < 4; j++) {
            var olis = [];
            for (var i = 3; i >= 0; i--) {
                olis.push(board[i][j]);
            }
            if (ifCanMove(olis)) {
                return true;
            }
        }
        return false;
    }
    // 判断是否可以向左移动
    function ifCanMoveLeft() {
        for (var i = 0; i < 4; i++) {
            var olis = board[i];
            if (ifCanMove(olis)) {
                return true;
            }
        }
        return false;
    }
    // 判断是否可以向右移动
    function ifCanMoveRight() {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 3; j >= 0; j--) {
                olis.push(board[i][j]);
            }
            if (ifCanMove(olis)) {
                return true;
            }
        }
        return false;
    }
    // 将所有的小方块朝一个方向    移动
    function move(lis) {
        "lis是一个二维的数组用于保存  一列方块的索引，即他们所在的行列"
        lable1: for (var i = 0; i < 4; i++) {
            var cIndex = lis[i];     // 保存当前在遍历的索引
            if (board[cIndex[0]][cIndex[1]] == 0) {  // 当前遍历的方块的数字为0 
                for (var j = i + 1; j < 4; j++) {   //循环遍历指针的位置
                    var cFlag = lis[j];   // 指针
                    if (board[cFlag[0]][cFlag[1]] != 0) {    //  当前遍历的方块为   但是指针不为0的时候 交换两个的位置并且删除后面那个
                        animationMove(cFlag, cIndex);
                        board[cIndex[0]][cIndex[1]] = board[cFlag[0]][cFlag[1]];
                        board[cFlag[0]][cFlag[1]] = 0;
                        i--;
                        continue lable1;
                    }   // 当前遍历的方块为0  且指针指向的方块的数字也为0的时候  查找一个指针的位置
                }
            } else {   // 当前遍历的方块的数字不是 0
                for (var j = i + 1; j < 4; j++) {       
                    var cFlag = lis[j];   // 指针 
                    if (board[cFlag[0]][cFlag[1]] != 0) { // 指针指向的方块的数字不为0 
                        if (board[cIndex[0]][cIndex[1]] == board[cFlag[0]][cFlag[1]]) {
                            animationMove(cFlag, cIndex);
                            board[cIndex[0]][cIndex[1]] = board[cIndex[0]][cIndex[1]] * 2;
                            board[cFlag[0]][cFlag[1]] = 0;
                            score_update(board[cIndex[0]][cIndex[1]] * 2);
                        }
                        continue lable1;
                    }   //   当指针指向的方块的数字为0 的时候继续查看下一个方块
                }
            }
        }
        setTimeout(function () {
            move_lock = false;
            update();
        }, 200);
    }
    // 向上   移动
    function moveUp() {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 0; j < 4; j++) {
                olis.push([j, i]);
            }
            move(olis);
        }
    }
    // 向下   移动
    function moveDown() {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 3; j >= 0; j--) {
                olis.push([j, i]);
            }
            move(olis);
        }
    }
    // 向左     移动
    function moveLeft() {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 0; j < 4; j++) {
                olis.push([i, j]);
            }
            move(olis);
        }
    }
    // 向右     移动
    function moveRight() {
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 3; j >= 0; j--) {
                olis.push([i, j]);
            }
            move(olis);
        }
    }
    // 排序  可以将游戏中的方块排列成有序的队列
    function sortGame() {
        var times = parseInt(sort_times.text());
        var olis = [];
        if (times <= 0) {
            alert("排序次数已用完！");
            return false;
        }
        for (var i = 0; i < 4; i++) {
            olis = olis.concat(board[i]);
        }
        olis.sort(function (a, b) { return b - a; });
        board = [];
        for (var i = 0; i < 4; i++) {
            board[i] = Array();
            for (var j = 0; j < 4; j++) {
                board[i][j] = olis[i * 4 + j];
            }
        }
        times--;
        sort_times.text(times);
        update();
    }
    // 检测游戏是否 Over
    function ifGmaeOver() {
        if (ifHasBlock() || ifCanMoveRight() || ifCanMoveLeft() || ifCanMoveDown() || ifCanMoveUp()) {
            return false
        }
        return true;
    }
    // 更新分数
    function score_update(num) {
        var cScore = score.text();
        cScore = parseInt(cScore) + parseInt(num);
        score.text(cScore);
    }
    // 更新屏幕显示
    function update() {
        $(".number-cell").remove();
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (parseInt(board[i][j]) != 0) {  // 数字不为0的时候显示出来   并且设置他们的样式
                    $("#box").append("<div class='number-cell' id='number-cell-" + i + "-" + j + "'></div>");
                    $("#number-cell-" + i + "-" + j).css({
                        'width': '106px',
                        'height': '106px',
                        'top': getPos(i),
                        "left": getPos(j),
                        'background-color': getBgColor(board[i][j]),
                        'color': getNumColor(board[i][j]),
                        'fontSize': getNumFontSize(board[i][j]),
                    }).text(board[i][j]);
                }
            }
        }
    }
    // 新生成数字的     动画效果
    function animationNewNum(x, y, num) {
        $("<div></div>").attr({
                "id": "number-cell-" + x + "-" + y,
                "class": "number-cell",
            }).css({
                "background-color": getBgColor(num),
                "color": getNumColor(num),
                "top": getPos(x) + 53,
                "left": getPos(y) + 53,
                'lineHeight': "0px",
                'fontSize': getNumFontSize(num),
            }).text(num).animate({
                lineHeight: "110px",
                width: '106px',
                height: '106px',
                top: getPos(x),
                left: getPos(y),
            }, 250).appendTo($("#box"));
    }
    // 移动方块的动画效果   
    function animationMove(origen, target) {
        "origen 原来的位置     target移动到的位置"
        $("#number-cell-" + origen[0] + "-" + origen[1]).animate({
            top: getPos(target[0]),
            left: getPos(target[1]),
        }, 200);
    }
    init();
})();

