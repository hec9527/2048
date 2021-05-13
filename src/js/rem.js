!(function (win) {
    var d = document.documentElement;
    var s = document.createElement('style');
    d.firstElementChild.appendChild(s);

    function resize() {
        var w = d.clientWidth;
        w = w < 320 ? 320 : w;
        w = w > 1024 ? 1024 : w;
        s.innerHTML = `
        html{ 
            font-size: ${w / 100}px !important;
        }
        body{
            font-size: 12*${w / 320}px;
            max-width: ${w}px
        }`;
    }

    win.addEventListener('resize', resize, true);
    win.addEventListener('pageshow', resize, true);
    resize();
})(window);
