// 确保API可用并且尽量向下兼容
window.requestAnimFrame = (function() {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
})();

// 采用闭包的方式，拒绝外部修改游戏变量
(() => {
    // 移动间隔
    function moveDuring(speed) {
        return 60 / speed;
    }

    /**
     * 游戏类
     * 主要是游戏进程中的相关参数配置
     */
    function Game() {
        return {
            game_rank: 1,
            game_player: [new Player()],
            game_isOver: false,
            game_isPasued: false,
            game_isBegin: false
        };
    }

    /**
     * 世界类
     */
    function World() {
        this.initWord();

        // 初始化/重置
        this.initWord = function() {
            this.enemy_list = [];
            this.ally_list = [];
            this.enemt_bullet = [];
            this.ally_bullet = [];
            this.brick_list = [];
            this.reward_list = [];
        };

        // 世界上添加敌人
        this.addEnemy = function(enemy) {
            this.enemy_list.append(enemy);
        };
        // 消除敌人
        this.killEnemey = function(enemy) {
            this.enemy_list.every((value, index) => {
                if (enemy === value) {
                    this.enemy_list.splice(index, 1);
                    return false;
                }
            });
        };
        // 添加敌人子弹
        this.addEnemyBullet = function(bullet) {
            this.enemt_bullet.append(bullet);
        };
        // 消除敌人子弹
        this.killEnemeyBullet = function(bullet) {
            this.enemt_bullet.every((value, index) => {
                if (value === bullet) {
                    this.enemt_bullet.splice(index, 1);
                    return false;
                }
            });
        };

        // 添加盟友
        this.addAlly = function(ally) {
            this.ally_list.append(ally);
        };
        // 消除盟友
        this.killAlly = function(ally) {
            this.ally_list.every((value, index) => {
                if (ally === value) {
                    this.enemy_list.splice(index, 1);
                    return false;
                }
            });
        };
        // 添加ally子弹
        this.addAllyBullet = function(bullet) {
            this.ally_bullet.append(bullet);
        };
        // 消除盟友子弹
        this.killAllyBullet = function(bullet) {
            this.ally_bullet.every((value, index) => {
                if (value === bullet) {
                    this.ally_bullet.splice(index, 1);
                    return false;
                }
            });
        };

        // 添加砖块
        this.addBrick = function(brick) {
            this.brick_list.append(brick);
        };
        // 消除/删除砖块
        this.killBrick = function(brick) {
            this.brick_list.every((value, index) => {
                if (value === brick) {
                    this.brick_list.splice(index, 1);
                }
            });
        };

        // 添加奖励
        this.addReward = function(reward) {
            this.reward_list.append(reward);
        };
        // 删除/消除奖励
        this.killReward = function(reward) {
            this.reward_list.every((value, index) => {
                if (value === reward) {
                    this.reward_list.splice(index, 1);
                }
            });
        };
    }

    /**
     * 实体类
     * @param {pos} Object 位置x,y
     * @param {img} Image 实体的图片
     */
    function Item(pos, img) {
        this.pos = pos || { x: 0, y: 0 };
        this.avator = img || new Image(32, 32);
    }

    /**
     * 坦克类
     */
    function Tank(pos, img, life, rank, bullet, speed) {
        Item.call(this, pos, img);
        this.life = life || 1;
        this.rank = rank || 1;
        this.bullet = bullet || 1;
        this.bullets = [];
        this.speed = speed || 1; // 3~8
        this.shielding = false;
        this.isMoveing = false;
        this.dir = 'top';
        self = this;

        // 处理移动
        function moveDeal(dir, pro, value) {
            const range = dir === 'top' || 'bottom' ? 456 : 516;

            self.pos[pro] += value;
            self.pos[pro] = self.pos[pro] <= 0 ? 0 : self.pos[pro];
            self.pos[pro] = self.pos[pro] >= range ? range : self.pos[pro];

            if (
                self.pos[pro] % 16 !== 0 &&
                self.pos[pro] !== range &&
                self.pos[pro] !== 0
            ) {
                setTimeout(() => {
                    self.isMoveing = false;
                    self.move(dir);
                }, moveDuring(self.speed));
            } else {
                self.isMoveing = false;
            }
            console.log(self.pos);
        }

        // 移动
        this.move = function(dir) {
            if (this.isMoveing) {
                return false;
            } else {
                if (dir !== this.dir) {
                    this.dir = dir;
                    this.changeDir(dir);
                }
                this.isMoveing = true;
                switch (dir) {
                    case 'top': {
                        moveDeal(dir, 'y', -1);
                        break;
                    }
                    case 'left': {
                        moveDeal(dir, 'x', -1);
                        break;
                    }
                    case 'bottom': {
                        moveDeal(dir, 'y', 1);
                        break;
                    }
                    case 'right': {
                        moveDeal(dir, 'x', 1);
                        break;
                    }
                    default: {
                        this.isMoveing = false;
                        console.error(`Error: unexpected direction ${dir}`);
                    }
                }
            }
        };
        // 改变坦克的移动方向
        this.changeDir = function(dir) {};
        // 射击
        this.shoot = function() {};
    }

    /**
     * 我方坦克
     * @param {*} pos
     * @param {*} img
     */
    function MyTank(pos, img, life, rank, bullet, speed, flag = 1) {
        Tank.call(this, pos, img, life, rank, bullet, speed);
        this.camp = 'my';
        this.flag = flag;
        this.cap = false;
        this.weapon = 5;
        // 添加奖励
        this.eatReward = function(reward) {
            switch (reward) {
                case 'life': {
                    game.game_player[this.flag].life += 1;
                }
                case 'cap': {
                    this.cap = true;
                    setTimeout(() => {
                        this.cap = false;
                    }, 8 * 1000);
                }
                case 'gun': {
                    this.life = 2;
                    this.weapon = 5;
                }
                case 'bomb': {
                }
                default: {
                    console.error(`Error: unexpected reward type`);
                }
            }
        };
    }

    /**
     * 子弹类
     * @param {} pos
     * @param {*} img
     * @param {*} camp
     */
    function Bullet(pos, img, camp, dir, power) {
        Item.call(this, pos, img);
        this.camp = camp || 'enemy';
        this.speed = 8;
        this.dir = dir;
        this.power = power || 1;

        // 子弹的移动方法
        this.move = function() {
            if (!game.game_isPasued) {
                switch (this.dir) {
                    case 'top': {
                        this.pos.y -= 1;
                        break;
                    }
                    case 'bottom': {
                        this.pos.y += 1;
                        break;
                    }
                    case 'left': {
                        this.pos.x -= 1;
                        break;
                    }
                    case 'right': {
                        this.pos.x += 1;
                        break;
                    }
                    default: {
                        console.error(`Error:unecpected direction ${this.dir}`);
                    }
                }
            }
            setTimeout(() => {
                this.move();
            }, moveDuring(this.speed));
        };
    }

    /**
     * 砖块类
     */
    function Brick() {}

    /**
     * 奖励类
     */
    function Reward() {}

    /**
     * 窗体类
     */
    function Windows() {}

    /**
     * 标志类
     */
    function Mark() {}

    /**
     *玩家类
     */
    function Player(indent = 'player1') {
        this.indent = indent;
        this.life = 3;
        this.level = 1;
        this.scroe = 0;
        this.scroe_reward = 0;

        this.addScore = function(score) {
            this.score += score;
        };
        this.getScore = function() {
            return this.score;
        };
        this.reWardLife = function() {
            this.life++;
        };
        this.reBirth = function() {
            if (this.life > 1) {
                this.life--;
                return true;
            }
            return false;
        };
        this.getRewardByScore = function() {};
    }

    Player.prototype = Item.constructor;
    window.pl = new Player();

    /**
     * 键盘类
     */
    function KeyBorad() {
        const key_list = [];

        document.addEventListener(
            'keydown',
            function(e) {
                if (!key_list.includes(e.keyCode)) {
                    key_list.push(e.keyCode);
                }
            },
            false
        );

        document.addEventListener(
            'keyup',
            function(e) {
                key_list.map((value, index, arr) => {
                    if (value === e.keyCode) {
                        key_list.splice(index, 1);
                    }
                });
            },
            false
        );

        this.isKeyDown = function(key) {
            key = String(key);
            if (key.length >= 1) {
                const code = key.charCodeAt(0);
                return key_list.includes(code);
            } else {
                console.warn('无效的字符：', key);
                return false;
            }
        };
    }

    /**
     * 地图类
     */
    function Map() {
        const map_list = [];

        this.isCustomized = function() {
            return !!map_list[0];
        };

        this.getMap = function(num) {
            let rank = num % 36;
            rank = rank === 0 ? 1 : rank;
            return map_list[rank];
        };

        this.setMap = function(map) {
            this.map_list[0] = map;
        };
    }

    /**
     * 图片类加载图片
     */
    function Images(callback) {
        let loaded = 0;

        const image_list = {};

        const image_path = [
            {
                type: 'boom',
                path: './image/Boom.png'
            },
            {
                type: 'ui',
                path: './image/UI.png'
            },
            {
                type: 'bonus',
                path: './image/bonus.png'
            },
            {
                type: 'brike',
                path: './image/brick.png'
            },
            {
                type: 'enemytank',
                path: './image/enemyTank.png'
            },
            {
                type: 'getscore',
                path: './image/getScore.png'
            },
            {
                type: 'getdoublescroe',
                path: './image/getScoreDouble.png'
            },
            {
                type: 'mytank',
                path: './image/myTank.png'
            },
            {
                type: 'tool',
                path: './image/tool.png'
            }
        ];

        // 加载图片
        image_path.forEach(value => {
            const image = new Image();
            image.onload = function() {
                image_list[value.type] = image;
                loaded++;
                if (loaded === image_path.length) {
                    console.log(`ok\t图片加载完成`);
                    callback && callback(image_list);
                }
            };
            image.src = value.path;
        });

        // 获取指定的图片
        this.getImage = function(imType) {
            return image_list[imType];
        };
    }

    /**
     * 声音类
     */
    function Sound() {
        const music_path = [
            {
                type: 'attack',
                path: './music/attack.mp3'
            },
            {
                type: 'attackover',
                path: './music/attackOver.mp3'
            },
            {
                type: 'bomb',
                path: './music/bomb.mp3'
            },
            {
                type: 'eat',
                path: './music/eat.mp3'
            },
            {
                type: 'exploed',
                path: './music/explode.mp3'
            },
            {
                type: 'life',
                path: './music/life.mp3'
            },
            {
                type: 'misc',
                path: './music/misc.mp3'
            },
            {
                type: 'pause',
                path: './music/pause.mp3'
            },
            {
                type: 'start',
                path: './music/start.mp3'
            }
        ];
        let loaded = 0;
        const music = {};

        // 加载音频到内存
        music_path.forEach(value => {
            const audio = new Audio(value.path);
            audio.oncanplaythrough = function() {
                music[value.type] = audio;
                loaded++;
                loaded === music_path.length && console.log('ok\t音频加载完成');
            };
        });

        // 播放
        this.play = function(media_type) {
            music[media_type].play();
        };
    }

    const canvas = document.getElementById('app');
    const ctx = canvas.getContext('2d');

    canvas.width = 516;
    canvas.height = 456;

    // 保存游戏运行过程中的参数
    const game = new Game();
    // 加载键盘模块，监听按键按下
    const keyborad = new KeyBorad();
    // 图片模块  加载图片，并且提供使用这些图片的接口
    const image = new Images();
    // 加载音频
    const sound = new Sound();
    // 当前窗口上的敌人
    const enemy_list = [];
    // 游戏世界  当前串口
    const word = new word();
    window.t = new Tank({ x: 20, y: 20 });
})();

console.log(`============Battle City============
@author    hc
@time      2019-12-5
@change    2019-12-6
===================================
`);
