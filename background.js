t = 0
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('background');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create grid
    const rows = Math.floor(canvas.width / 8);
    const rowoff = (canvas.width % 8) / 2;
    const cols = Math.floor(canvas.height / 8);
    const coloff = (canvas.height % 8) / 2;


    function hsvToRgbString(h, s, v) {
        // Ensure h, s, v are within their expected ranges
        h = h % 360; // Hue in degrees (0-359)
        s = Math.max(0, Math.min(100, s)); // Saturation in percentage (0-100)
        v = Math.max(0, Math.min(100, v)); // Value in percentage (0-100)

        // Convert s and v to 0-1 range
        s /= 100;
        v /= 100;

        let r, g, b;
        const i = Math.floor(h / 60);
        const f = h / 60 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        // Convert r, g, b to 0-255 range and round
        r = Math.round(r * 255);
        g = Math.round(g * 255);
        b = Math.round(b * 255);

        return `rgb(${r}, ${g}, ${b})`;
    }
    function animate() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                ctx.fillStyle = hsvToRgbString(205+20*Math.sin((i+j+3*t)/90),75+25*Math.sin(t+i/2-j/3),70+10*Math.sin(t+i+j+1));
                ctx.fillRect(rowoff+8*i, coloff+8*j, 8, 8);
            }
        }
        t++;
    }
    setInterval(animate, 100);
});
