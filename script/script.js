/* ---------- Canvas Setup ---------- */
const canvas = document.getElementById('patternCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 800; // 기초 사이즈
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

/* ---------- UI Elements ---------- */
const colAInput = document.getElementById('colA');
const colBInput = document.getElementById('colB');
const invertCheckbox = document.getElementById('invert');
const grayCheckbox = document.getElementById('gray');
const downloadBtn = document.getElementById('download');

/* ---------- Constants ---------- */
const COLS = 3;
const ROWS = 5;

/* ---------- Color Utils ---------- */
function hexToRgb(hex){
    return {
        r: parseInt(hex.slice(1,3),16),
        g: parseInt(hex.slice(3,5),16),
        b: parseInt(hex.slice(5,7),16)
    };
}
function rgbToStr(c){
    return `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;
}
function transformColor(c, invert, gray){
    let r=c.r, g=c.g, b=c.b;
    if(invert){ r=255-r; g=255-g; b=255-b; }
    if(gray){ let m=(r+g+b)/3; r=g=b=m; }
    return {r,g,b};
}

/* ---------- Pattern Rule ---------- */
function gridForRowCol(row1based, colIndex0){
    const rowOdd = (row1based % 2 === 1);
    if(rowOdd){
        if(colIndex0 === 0 || colIndex0 === 2) return {gx:2, gy:3};
        return {gx:6, gy:6};
    } else {
        if(colIndex0 === 1) return {gx:2, gy:2};
        return {gx:6, gy:6};
    }
}

/* ---------- Draw Pattern (No Zoom) ---------- */
function draw(){
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0); 
    ctx.clearRect(0,0, CANVAS_SIZE, CANVAS_SIZE);

    /* 패턴 전체 영역(정사각형) */
    const cellBase = Math.min(
        CANVAS_SIZE / COLS,
        CANVAS_SIZE / ROWS
    );
    const patternW = cellBase * COLS;
    const patternH = cellBase * ROWS;

    /* 정중앙 오프셋 */
    const offsetX = (CANVAS_SIZE - patternW) / 2;
    const offsetY = (CANVAS_SIZE - patternH) / 2;

    ctx.translate(offsetX, offsetY);

    /* Colors */
    const topA = hexToRgb(colAInput.value);
    const topB = hexToRgb(colBInput.value);
    const invert = invertCheckbox.checked;
    const gray = grayCheckbox.checked;

    /* Draw each block */
    for(let r=0; r<ROWS; r++){
        for(let c=0; c<COLS; c++){
            const grid = gridForRowCol(r+1, c);
            const cellW = cellBase / grid.gx;
            const cellH = cellBase / grid.gy;

            const baseX = c * cellBase;
            const baseY = r * cellBase;

            for(let gy=0; gy<grid.gy; gy++){
                for(let gx=0; gx<grid.gx; gx++){
                    const sx = baseX + gx*cellW;
                    const sy = baseY + gy*cellH;

                    const parity = (r + c + gx + gy) % 2;
                    const topCol = (parity === 0) ? topA : topB;

                    const c1 = transformColor(topCol, invert, gray);
                    const c2 = transformColor({r:255,g:255,b:255}, invert, gray);

                    const grad = ctx.createLinearGradient(sx, sy, sx, sy + cellH);
                    grad.addColorStop(0, rgbToStr(c1));
                    grad.addColorStop(1, rgbToStr(c2));

                    ctx.fillStyle = grad;
                    ctx.fillRect(sx, sy, cellW, cellH);
                }
            }
        }
    }

    ctx.restore();
}

/* ---------- Events ---------- */
[colAInput, colBInput, invertCheckbox, grayCheckbox].forEach(el=>{
    el.addEventListener('change', draw);
});

/* ---------- Download ---------- */
downloadBtn.addEventListener('click', ()=>{
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pattern.png';
    a.click();
});

/* Initial draw */
draw();
