const config = {
    colors : ['#353839', '#FF8C00', '#4B4E53'],
    geometry: 'triangle', // triangle, square
    // pointsDown: true, // comment to toggle for triangle
    grayMethod: 'luminosity', // lightness, average
    threshold: 255, // 0 (black) to 255 (white)
    // imageUrl: 'http://127.0.0.1:5500/schwarzbild.jpg',
    poolingSize: 4,
    poolingMethod: 'maximum',
    factor: 20, // 
    keepPixelRatio: true,
    keepPixelPopulation: true
}

let target = document.getElementById('pCanvas').parentElement;
let targetWidth = target.clientWidth;
let targetHeight = target.clientHeight;


function loadImageToCanvas(url, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // This is important for loading images from different origins
    img.onload = () => {
        const canvasSource = document.createElement('canvas');
        canvasSource.setAttribute('width', targetWidth);
        canvasSource.setAttribute('height', targetHeight);
        const ctx = canvasSource.getContext('2d');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight) ; 

        callback(canvasSource);
    };
    img.src = url;
}

function getGrayscaleMatrix(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const grayscaleMatrix = [];

    for (let y = 0; y < canvas.height; y++) {
        const row = [];
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
        
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
          
            const gray = toGray(r,g,b, config.grayMethod);
            row.push(gray);
        }
        grayscaleMatrix.push(row);
    }
    return grayscaleMatrix;
}


function toGray(r,g,b, method) {
    let gray;
    switch(method) {
        case 'average':
          gray = (r + g + b) / 3
          break;
        case 'lightess':
          gray = (Math.max(r,g,b) + Math.min(r,g,b)) / 2
          break;
        case 'luminosity':
        default:
          gray = 0.299 * r + 0.587 * g + 0.114 * b
    }
    return Math.round(gray)
}

class Particle{
    constructor(x, y, effect, gray){
        this.originX = x;
        this.originY = y;
        this.effect = effect;
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.ctx = this.effect.ctx;
        this.ctx.fillStyle = 'black';
        this.vx = 0;
        this.vy = 0;
        this.ease = 0.2;
        this.friction = 0.95;
        this.dx = 0;
        this.dy = 0;
        this.distance = 0;
        this.force = 0;
        this.angle = 0;

        gray =  gray || 0
        // this.size = Math.floor(7 - (gray / 255*7))       
      
        // this.size = Math.max(3, Math.floor(Math.random() * 7))
        this.size = Math.max(Math.floor(Math.random() * 7)) //7 is matrix.length / 75
       
        if (config.keepPixelRatio) {
            this.size = Math.floor(this.size / window.devicePixelRatio)
        }
       
        this.draw();
    }   

    draw(i){
        const colors = config.colors;
        this.ctx.fillStyle = colors[i % colors.length];

        this.ctx.beginPath();
        
        switch(config.geometry) {
            case "circle":
                this.ctx.arc(Math.floor(this.x + this.size/2), Math.floor(this.y + this.size/2), Math.floor(this.size/2), 0, 2 * Math.PI);
                break;

            case "triangle":
                this.drawTriangle(i % 2 == 0); 
                break;

            case "square":
            default:
                this.ctx.fillRect(this.x, this.y, this.size, this.size);
                break; 
          }

        this.ctx.fill();
    }

    drawTriangle(pointsDown) {
        if ('pointsDown' in config) {
            pointsDown = config.pointsDown;
        }

        if (pointsDown) {
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(this.x + this.size/2, this.y + this.size);
            this.ctx.lineTo(this.x + this.size, this.y);
            
        } else {
            this.ctx.moveTo(this.x, this.y + this.size);
            this.ctx.lineTo(this.x + this.size/2, this.y);
            this.ctx.lineTo(this.x + this.size, this.y + this.size);
        }
    }

    update(i){
        this.dx = this.effect.mouse.x - this.x;
        this.dy = this.effect.mouse.y - this.y;
        this.distance = this.dx * this.dx + this.dy * this.dy;
        this.force = -this.effect.mouse.radius / this.distance * 8;
        

        if(this.distance < this.effect.mouse.radius){
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
        }

        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
        this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
        this.draw(i)
    }
}


class Effect {
    constructor(canvas, width, height, context, matrix){
        this.width = width;
        this.height = height;
        this.ctx = context;
        this.particlesArray = [];
        this.matrix = reduceMatrix(matrix) 
        this.mouse = {
            radius: 3000,
            x: 0,
            y: 0
        }

        // const canvas = document.getElementById('pCanvas');
        const parentCanvas = canvas.parentElement;
        
        parentCanvas.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX - parentCanvas.getBoundingClientRect().left) 
            this.mouse.y = (e.pageY - parentCanvas.getBoundingClientRect().top) 
        });


       window.addEventListener('resize', () => {
            console.log("device", window.devicePixelRatio)
            let target = document.getElementById('pCanvas').parentElement;
            targetWidth = target.clientWidth;
            targetHeight = target.clientHeight;

        
            const canvasTarget = document.querySelector('#pCanvas');

            // config.factor *= targetHeight / canvasTarget.height; //keep distance of original particles

            this.width = canvasTarget.width = targetWidth    
            this.height = canvasTarget.height = targetHeight

                        
            this.ctx = canvasTarget.getContext('2d');

            // keep number of original particles
            // const newMatrix = getGrayscaleMatrix(canvasTarget);
            // this.matrix = reduceMatrix(newMatrix)
            
            // keep relative distance of original particles
            const newMatrix = getGrayscaleMatrix(canvasTarget);
            this.matrix = reduceMatrix(newMatrix)


            this.particlesArray = [];
            this.init();
        })
        this.init();
    }

    init(){
        console.log('length:', this.matrix.length)
        for(let y = 0; y < this.matrix.length; y++){
            for(let x = 0; x < this.matrix[0].length; x++){
                let gray = this.matrix[y][x];
                if(gray < config.threshold) {
                    let gap = Math.ceil(config.factor / window.devicePixelRatio)
                    this.particlesArray.push(new Particle(Math.floor(x*gap), Math.floor(y*gap), this, gray))
                }
            }
        }
    }

    update(){
        this.ctx.clearRect(0, 0, this.width, this.height);
        for(let i = 0; i < this.particlesArray.length; i++){
            this.particlesArray[i].update(i);
        }
    }
}

function reduceMatrix(matrix) {
    const factor = Math.ceil(config.factor / window.devicePixelRatio);
    const byMax = config.poolingMethod;
    const numRows = matrix.length;
    const numCols = matrix[0].length;
    const reducedRows = Math.ceil(numRows / factor);
    const reducedCols = Math.ceil(numCols / factor);
    const reducedMatrix = [];

    for (let i = 0; i < reducedRows; i++) {
        const row = [];
        for (let j = 0; j < reducedCols; j++) {
            let maxVal = -Infinity; // Max
            let sum = 0; let count = 0; // Avg

            for (let x = 0; x < factor; x++) {
                for (let y = 0; y < factor; y++) {
                    const rowIndex = Math.floor(i * factor + x);
                    const colIndex = Math.floor(j * factor + y);
                    
                    if (rowIndex < numRows && colIndex < numCols) {
                        maxVal = Math.max(maxVal, matrix[rowIndex][colIndex]); // Max
                        sum += matrix[rowIndex][colIndex]; count++; // Avg
                    }
                }
            }
            if (byMax == 'maximum') {
                row.push(maxVal);
            } else {
                row.push(sum / count);
            }
            
        }
        reducedMatrix.push(row);
    }

    return reducedMatrix;
}

// function reduceMatrixByAvg(matrix, factor) {
    // const numRows = matrix.length;
    // const numCols = matrix[0].length;
    // const reducedRows = Math.ceil(numRows / factor);
    // const reducedCols = Math.ceil(numCols / factor);
    // const reducedMatrix = [];

    // for (let i = 0; i < reducedRows; i++) {
    //     const row = [];
    //     for (let j = 0; j < reducedCols; j++) {
            // let sum = 0;
            // let count = 0;
            // for (let x = 0; x < factor; x++) {
            //     for (let y = 0; y < factor; y++) {
                    // const rowIndex = i * factor + x;
                    // const colIndex = j * factor + y;
                    // if (rowIndex < numRows && colIndex < numCols) {
//                         sum += matrix[rowIndex][colIndex];
//                         count++;
//                     }
//                 }
//             }
//             row.push(sum / count);
//     //     }
//     //     reducedMatrix.push(row);
//     // }

//     // return reducedMatrix;
// }

function particalize(canvas) {
        const grayscaleMatrix = getGrayscaleMatrix(canvas);

        const canvasTarget = document.querySelector('#pCanvas');
        canvasTarget.width = targetWidth    
        canvasTarget.height = targetHeight 
        const ctx = canvasTarget.getContext('2d');

        let effect = new Effect(canvasTarget, canvasTarget.width, canvasTarget.height, ctx, grayscaleMatrix);
        function animate(){
            effect.update();
            requestAnimationFrame(animate)
        }
        animate()
    };


document.addEventListener('DOMContentLoaded', function() {
    // loadImageToCanvas(config.imageUrl, particalize); // if there is an image
    const canvasTarget = document.querySelector('#pCanvas');
    canvasTarget.width = targetWidth    
    canvasTarget.height = targetHeight 

    const target = document.querySelector('#pCanvas');
    particalize(target)
});


// $("#btn-test").on('click', () => {
//     console.log('klick')
//     loadImageToCanvas('http://127.0.0.1:5500/console.jpg', particalize);
// });




// document.onkeydown = function(event) {
//     if (event.ctrlKey && (event.key === '-' || event.key === '+')) {
//         event.preventDefault();
//     }
// };

// window.addEventListener('wheel', function(event) {
//     if (event.ctrlKey) {
//         event.preventDefault();
//     }
// }, { passive: false });