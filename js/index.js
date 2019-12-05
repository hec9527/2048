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
    function World() {}

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
    function Tank() {}

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
     * bgm类
     */
    function Media() {}

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
                    console.log(`ok\t图片加载`);
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

        // 加载音频到内存
        music_path.forEach(value => {
            const audio = new Audio(value.path);
            audio.play();
            audio.oncanplaythrough = function() {
                console.log('loaded');
            };
            // audio.onload = function() {
            //     console.log('loaded');
            // };
        });

        // 播放
        this.play = function(media_type) {
            for (let i = 0; i < sound_path.length; i++) {
                if (sound_path) {
                }
            }
        };
    }

    /**
     * 游戏主要流程
     */
    function init() {
        const canvas = document.getElementById('app');
        const ctx = canvas.getContext('2d');

        canvas.width = 516;
        canvas.height = 456;

        // 保存游戏运行过程中的参数
        const game = new Game();
        // 加载键盘模块，监听按键按下
        const keyborad = new KeyBorad();
        // 图片模块  加载图片，并且提供使用这些图片的接口
        const image = new Images(lis => {
            // console.log(lis);
        });
        const media = new Sound();

        window.image = image;
    }

    init();
})();

console.log(`============Battle City============
@author    hc
@time      2019-12-5
@change    2019-12-5
===================================
`);
