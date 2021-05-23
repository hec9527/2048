/**
 *  @author         hc
 *  @ctime          2019/6/8
 *  @lastModifi     2021/05/13
 *  @description
 *
 *  判断是否可以移动也是采用行列映射的方式,依次处理每一行或者每一列,但是判定的关键是:
 *     - 当前的方块不为 0 且和下一个方块相等(两个不为 0 的相邻)
 *     - 当前当方块为 0 且下一个方块不为 0(非 0 方块前面有 0 方块)
 */

(function () {
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/gi.test(
        navigator.userAgent
    );
    var size = isMobile ? 17 : 110;
    var padding = isMobile ? 2.4 : 16;

    console.log(`isMobile:${isMobile}`);
    console.log(window.devicePixelRatio);

    var colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#99cc00',
        1024: '#33b5e5',
        2048: '#0099cc',
        4096: '#aa66cc',
        8192: '#9933cc'
    };

    var board = Array();
    var score = {
        el: $('#scpoeValue'),
        value: 0,
        init: function () {
            this.value = 0;
            this.el.text(this.value);
        },
        add: function (score) {
            this.value += score;
            this.el.text(this.value);
        }
    };
    var sort_times = {
        el: $('#sort-times'),
        value: 3,
        init: function () {
            this.value = 3;
            this.el.text(this.value);
        },
        reduce: function () {
            if (this.value <= 0) {
                return false;
            } else {
                this.value--;
                this.el.text(this.value);
                return true;
            }
        }
    };
    var back_times = {
        el: $('#back-times'),
        value: 3,
        init: function () {
            this.value = 3;
            this.el.text(this.value);
        },
        reduce: function () {
            if (this.value <= 0) {
                return false;
            } else {
                this.value--;
                this.el.text(this.value);
                return true;
            }
        }
    };
    var history_board = [];
    var game_over = false;
    var move_lock = false;

    /** 事件监听 */
    window.addEventListener('resize', () => window.location.reload());
    // 监听重置按钮
    $('#ctrl-reset')[0].onclick = function (e) {
        e.stopPropagation(); // 捕获事件冒泡
        init();
    };
    // 监听排序按钮
    $('#ctrl-resort')[0].onclick = function (e) {
        e.stopPropagation();
        sortGame();
    };
    // 监听撤销按钮
    $('#ctrl-backup')[0].onclick = function (e) {
        e.stopPropagation();
        go_back();
    };

    // 监听按键操作
    (function () {
        document.addEventListener('keydown', function (e) {
            if (!game_over) {
                if (move_lock) {
                    return false;
                }
                let keys = [37, 38, 39, 40];
                if (keys.indexOf(e.keyCode) != -1) {
                    if (e.keyCode == 37) {
                        ifCanMoveLeft() && moveLeft();
                    } else if (e.keyCode == 38) {
                        ifCanMoveUp() && moveUp();
                    } else if (e.keyCode == 39) {
                        ifCanMoveRight() && moveRight();
                    } else if (e.keyCode == 40) {
                        ifCanMoveDown() && moveDown();
                    }
                }
                ifGmaeOver();
            }
        });
    })();

    // 移动端操作
    (function () {
        var gameBox = document.getElementById('gameBox');
        var x = 0;
        var y = 0;
        var dx = 0;
        var dy = 0;
        gameBox.addEventListener('touchstart', e => {
            e.preventDefault();
            if (e.touches.length > 1 || e.touches.length < 1) return;
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
            dx = 0;
            dy = 0;
        });

        gameBox.addEventListener(
            'touchmove',
            e => {
                e.preventDefault();
                if (e.touches.length > 1 || e.touches.length < 1) return;
                dx = e.touches[0].clientX - x;
                dy = e.touches[0].clientY - y;
            },
            // 禁止滚动
            { passive: false }
        );
        gameBox.addEventListener('touchend', e => {
            e.preventDefault();
            if (e.touches.length > 1 || move_lock) return;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx >= 0) {
                    ifCanMoveRight() && moveRight();
                } else {
                    ifCanMoveLeft() && moveLeft();
                }
            } else {
                if (dy >= 0) {
                    ifCanMoveDown() && moveDown();
                } else {
                    ifCanMoveUp() && moveUp();
                }
            }
            ifGmaeOver();
        });
    })();

    //初始化
    function init() {
        initBoard();
        initArgs();
        getRandPosAndNum();
        getRandPosAndNum();
        update();
    }

    //初始化棋盘
    function initBoard() {
        $('#box').html('');
        for (var i = 0; i < 4; i++) {
            board[i] = Array();
            for (var j = 0; j < 4; j++) {
                board[i][j] = 0;
                $('<li></li>')
                    .css({
                        width: size + (isMobile ? 'rem' : 'px'),
                        height: size + (isMobile ? 'rem' : 'px'),
                        top: getPos(i) + (isMobile ? 'rem' : 'px'),
                        left: getPos(j) + (isMobile ? 'rem' : 'px')
                    })
                    .attr({
                        class: 'grid-cell',
                        id: 'gird-cell-' + i + '-' + j
                    })
                    .appendTo($('#box')[0]);
            }
        }
    }
    // 初始化  args
    function initArgs() {
        score.init();
        sort_times.init();
        back_times.init();
        game_over = false;
        move_lock = false;
    }
    /**
     * @param i 当给定的是第一维索引的时候为上边距 第二维索引的时候为右边距
     */
    function getPos(j) {
        return padding + (size + padding) * j;
    }
    // 获取随机位置和数字
    function getRandPosAndNum() {
        if (ifHasBlock()) {
            do {
                var randx = parseInt(Math.floor(Math.random() * 4));
                var randy = parseInt(Math.floor(Math.random() * 4));
            } while (board[randx][randy] != 0);
            var num = Math.random() < 0.7 ? 2 : 4;
            board[randx][randy] = num;
            animationNewNum(randx, randy, num);
        }
    }
    // 根据所给的数字获取对应的    背景颜色
    function getBgColor(num) {
        return colors[num] || '#ff0000';
    }
    // 根据所给的数字获取对应的   数字颜色
    function getNumColor(num) {
        return num <= 4 ? '#776e65' : 'white';
    }
    // 根据方块上的数值的大小设置字体的大小
    function getNumFontSize(num) {
        var len = num.toString().length;
        switch (len) {
            case 1:
                return isMobile ? '13rem' : '70px';
            case 2:
                return isMobile ? '11rem' : '60px';
            case 3:
                return isMobile ? '9.5rem' : '50px';
            case 4:
                return isMobile ? '6.5rem' : '40px';
            case 5:
                return isMobile ? '5.2rem' : '30px';
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
    /**
     * @param lis 用于处理的每一行或者每一列盒子里面的数字
     *  可以移动的情况分2种：
     *   1.数字方块前面有空白方块
     *   2.数字方块前面有和它相同的非0的数字方块
     *  @returns boolean
     */
    function ifCanMove(lis) {
        for (let i = 1; i < 4; i++) {
            if (lis[i] != 0) {
                for (let j = i; j > 0; j--) {
                    if (lis[j - 1] == 0 || lis[j] == lis[j - 1]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    /**
     * 将每一列拆分，用于判断是否可以向上移动  其它判断函数相同
     * 有任何一列可以向上移动返回true
     * 否则返回 false
     * @returns boolean
     */
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
    /**
     * @param lis 将要移动的小方块的索引  二维索引包含行列
     */
    function move(lis) {
        move_lock = true;
        lable1: for (var i = 0; i < 4; i++) {
            var cIndex = lis[i]; // 保存当前在遍历的索引
            if (board[cIndex[0]][cIndex[1]] == 0) {
                // 当前遍历的方块的数字为0
                for (var j = i + 1; j < 4; j++) {
                    //循环遍历指针的位置
                    var cFlag = lis[j]; // 指针
                    if (board[cFlag[0]][cFlag[1]] != 0) {
                        // 当前遍历的方块为0   但是指针不为0的时候 交换两个的位置并且删除指针方块的数值
                        animationMove(cFlag, cIndex);
                        board[cIndex[0]][cIndex[1]] = board[cFlag[0]][cFlag[1]];
                        board[cFlag[0]][cFlag[1]] = 0;
                        i--;
                        continue lable1;
                    }
                }
            } else {
                // 当前遍历的方块的数字不是 0
                for (var j = i + 1; j < 4; j++) {
                    var cFlag = lis[j]; // 指针
                    if (board[cFlag[0]][cFlag[1]] != 0) {
                        // 指针指向的方块的数字不为0
                        if (board[cIndex[0]][cIndex[1]] == board[cFlag[0]][cFlag[1]]) {
                            animationMove(cFlag, cIndex);
                            board[cIndex[0]][cIndex[1]] = board[cIndex[0]][cIndex[1]] * 2;
                            board[cFlag[0]][cFlag[1]] = 0;
                            score.add(board[cIndex[0]][cIndex[1]]);
                        }
                        continue lable1;
                    } //   当指针指向的方块的数字为0 的时候继续查看下一个方块
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
        push_board(board);
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 0; j < 4; j++) {
                olis.push([j, i]);
            }
            move(olis);
        }
        getRandPosAndNum();
    }
    // 向下   移动
    function moveDown() {
        push_board(board);
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 3; j >= 0; j--) {
                olis.push([j, i]);
            }
            move(olis);
        }
        getRandPosAndNum();
    }
    // 向左     移动
    function moveLeft() {
        push_board(board);
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 0; j < 4; j++) {
                olis.push([i, j]);
            }
            move(olis);
        }
        getRandPosAndNum();
    }
    // 向右     移动
    function moveRight() {
        push_board(board);
        for (var i = 0; i < 4; i++) {
            var olis = [];
            for (var j = 3; j >= 0; j--) {
                olis.push([i, j]);
            }
            move(olis);
        }
        getRandPosAndNum();
    }
    // 排序  可以将游戏中的方块排列成有序的队列
    function sortGame() {
        var olis = [];
        if (!sort_times.reduce()) {
            alert('排序次数已用完！');
            return false;
        }
        if (game_over) {
            alert('游戏已结束，请重新开始。');
            return false;
        }
        for (var i = 0; i < 4; i++) {
            olis = olis.concat(board[i]);
        }
        olis.sort(function (a, b) {
            return b - a;
        });
        board = [[], [], [], []];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (i % 2 == 0) {
                    board[3 - j][i] = olis[i * 4 + j];
                } else {
                    board[j][i] = olis[i * 4 + j];
                }
            }
        }
        update();
        setAttr();
    }
    // 检测游戏是否 Over
    function ifGmaeOver() {
        if (
            ifHasBlock() ||
            ifCanMoveRight() ||
            ifCanMoveLeft() ||
            ifCanMoveDown() ||
            ifCanMoveUp()
        ) {
            return false;
        }
        game_over = true;
        setTimeout(function () {
            if (window.confirm(`Game Over! 重新开始?\n\t\t您的分数为：${score.value}`)) {
                init();
            }
        }, 350);
    }

    // 更新屏幕显示
    function update() {
        $('.number-cell').remove();
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (parseInt(board[i][j]) != 0) {
                    // 数字不为0的时候显示出来   并且设置他们的样式
                    const el = $("<div class='number-cell' id='number-cell-" + i + '-' + j + "'/>")
                        .css({
                            width: size + (isMobile ? 'rem' : 'px'),
                            height: size + (isMobile ? 'rem' : 'px'),
                            top: getPos(i) + (isMobile ? 'rem' : 'px'),
                            left: getPos(j) + (isMobile ? 'rem' : 'px'),
                            backgroundColor: getBgColor(board[i][j]),
                            color: getNumColor(board[i][j]),
                            fontSize: getNumFontSize(board[i][j])
                        })
                        .text(board[i][j]);

                    $('#box').append(el);
                }
            }
        }
    }
    // 新生成数字的     动画效果
    function animationNewNum(x, y, num) {
        $('<div></div>')
            .attr({
                id: 'number-cell-' + x + '-' + y,
                class: 'number-cell'
            })
            .css({
                'background-color': getBgColor(num),
                color: getNumColor(num),
                top: getPos(x) + size / 2 + (isMobile ? 'rem' : 'px'),
                left: getPos(y) + size / 2 + (isMobile ? 'rem' : 'px'),
                lineHeight: '0px',
                fontSize: getNumFontSize(num)
            })
            .text(num)
            .animate(
                {
                    lineHeight: size + (isMobile ? 'rem' : 'px'),
                    width: size + (isMobile ? 'rem' : 'px'),
                    height: size + (isMobile ? 'rem' : 'px'),
                    top: getPos(x) + (isMobile ? 'rem' : 'px'),
                    left: getPos(y) + (isMobile ? 'rem' : 'px')
                },
                250
            )
            .appendTo($('#box'));
    }
    // 移动方块的动画效果
    function animationMove(origen, target) {
        'origen 原来的位置     target移动到的位置';
        $('#number-cell-' + origen[0] + '-' + origen[1]).animate(
            {
                top: getPos(target[0]) + (isMobile ? 'rem' : 'px'),
                left: getPos(target[1]) + (isMobile ? 'rem' : 'px')
            },
            200
        );
    }
    /**
     * @param board 将当前的棋盘布局保存在数组中，数组只能保存3个
     *   当数组的长度超过3个的时候删除第一个
     *   传入的参数为>>二维数组<<，引用类型， 需要一个深拷贝保存在数组中
     *   否则被后面的操作覆盖
     */
    function push_board(board) {
        if (history_board.length >= 3) {
            history_board.shift();
        }
        let cboard = [];
        for (let row = 0; row < 4; row++) {
            cboard[row] = board[row].slice(0);
        }
        history_board.push(cboard);
        setAttr();
    }
    /**
     *  撤销上一步操作
     */
    function go_back() {
        if (history_board.length <= 0) {
            return false;
        }
        if (game_over) {
            alert('游戏已结束，请重新开始。');
            return false;
        }
        if (!back_times.reduce()) {
            return false;
        }
        board = history_board.pop();
        update();
        setAttr();
    }

    function setAttr() {
        if (history_board.length > 0 && back_times.value > 0) {
            $('#ctrl-backup').attr('class', 'ctrl-box');
        } else {
            $('#ctrl-backup').attr('class', 'ctrl-box disabled');
        }

        if (sort_times.value > 0) {
            $('#ctrl-resort').attr('class', 'ctrl-box');
        } else {
            $('#ctrl-resort').attr('class', 'ctrl-box disabled');
        }
    }
    init();
})();
