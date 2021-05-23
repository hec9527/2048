!(function (win) {
    var d = document.documentElement;
    var s = document.createElement('style');
    d.firstElementChild.appendChild(s);

    function resize() {
        var w = d.clientWidth;
        console.log(`clientwidth: ${w}`);
        if (w < 320) w = 320;
        else if (w > 1024) w = 1024;
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
