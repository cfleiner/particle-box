let particleSize = {
    random: function(baseSize, gray) {
        return Math.max(Math.floor(Math.random() * baseSize));
    },
    gray: function(baseSize, gray) {
        return Math.floor(baseSize - (gray / 255*baseSize))    
    }
}



class MatrixHandler {
    constructor(particleBox) {
        this.box = particleBox
        this.config = particleBox.config

    }
    getGrayscaleMatrix(canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
              
                const gray = this.toGray(r,g,b, this.config.grayMethod);
                row.push(gray);
            }
            grayscaleMatrix.push(row);
        }
        return grayscaleMatrix;
    }
    
    toGray(r,g,b, method) {
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

    reduceMatrix(matrix) {
        const factor = Math.ceil(this.config.factor / window.devicePixelRatio);
        const byMax = this.config.poolingMethod;
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
}


class Particle{
    constructor(x, y, effect, gray){
        this.originX = x;
        this.originY = y;
        this.effect = effect;
        this.config = effect.config
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.ctx = this.effect.ctx;
        this.ctx.fillStyle = 'black';
        this.vx = 0;
        this.vy = 0;
        this.ease = 0.2;
        this.friction = this.config.particleFriction //0.95;
        this.dx = 0;
        this.dy = 0;
        this.distance = 0;
        this.force = 0;
        this.angle = 0;

        gray =  gray || 0
     
        if ('particleSizeFunction' in this.config) {
            this.size = this.config.particleSizeFunction(this.config.particleSize, gray)
        } else {
            this.size = this.config.particleSize
        }

        if (!this.config.keepParticleSize) {
            this.size = Math.floor(this.size / window.devicePixelRatio)
        }

        this.draw();
    }   

    draw(i){
        const colors = this.config.colors;
        this.ctx.fillStyle = colors[i % colors.length];

        this.ctx.beginPath();
        
        switch(this.config.geometry) {
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
        if ('pointsDown' in this.config) {
            pointsDown = this.config.pointsDown;
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
    constructor(particleBox){
        this.box = particleBox
        this.config = this.box.config
        this.canvas = this.box.box
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.particlesArray = [];
        this.matrix = this.box.matrixHandler.reduceMatrix(this.box.matrix) 
        this.mouse = {
            radius: 5000,
            x: 0,
            y: 0
        }

        
        
        this.box.parent.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX - this.box.parent.getBoundingClientRect().left) 
            this.mouse.y = (e.pageY - this.box.parent.getBoundingClientRect().top) 
        });


       window.addEventListener('resize', () => {
            this.box.targetWidth = this.box.parent.clientWidth;
            this.box.targetHeight = this.box.parent.clientHeight;

        

            if (this.config.keepParticlePopulation) {
                this.config.factor *= this.box.targetHeight / this.canvas.height; //keep distance of original particles
            }

            this.width = this.canvas.width = this.box.targetWidth    
            this.height = this.canvas.height = this.box.targetHeight

                        
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

            const newMatrix = this.box.matrixHandler.getGrayscaleMatrix(this.canvas);
            this.matrix = this.box.matrixHandler.reduceMatrix(newMatrix)


            this.particlesArray = [];
            this.init();
        })
        this.init();
    }

    init(){
        for(let y = 0; y < this.matrix.length; y++){
            for(let x = 0; x < this.matrix[0].length; x++){
                let gray = this.matrix[y][x];
                if(gray < this.config.threshold) {
                    let gap = Math.ceil(this.config.factor / window.devicePixelRatio)
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




class ParticleBox {
    constructor(canvasSelector, configObject){
        this.box = document.querySelector(canvasSelector);
        this.parent = this.box.parentElement;
        this.matrix = [];
        this.effect = null;
        this.targetWidth = this.parent.clientWidth; 
        this.targetHeight = this.parent.clientHeight;
        this.box.width = this.targetWidth;
        this.box.height = this.targetHeight;
        this.config = configObject
        this.matrixHandler = new MatrixHandler(this)
        
    }

    run(pathToJPG) {
        if (pathToJPG !== undefined) {
            this.loadImageToCanvas(pathToJPG);
        } else if ("pathToJPG" in this.config) {
            this.loadImageToCanvas(this.config.pathToJPG);
        } else {
            this.particalize(this.box)
        }
    }

    loadImageToCanvas(url) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvasSource = document.createElement('canvas');
            canvasSource.setAttribute('width', this.targetWidth);
            canvasSource.setAttribute('height', this.targetHeight);
            const ctx = canvasSource.getContext('2d');
            ctx.drawImage(img, 0, 0, this.targetWidth, this.targetHeight) ; 
            this.particalize(canvasSource);
        };
        img.src = url;
    }

    particalize(canvas) {
        this.matrix = this.matrixHandler.getGrayscaleMatrix(canvas);
        this.box.width =  this.parent.clientWidth;   
        this.box.height = this.parent.clientHeight;
       

        const effect = new Effect(this);
        function animate(){
            effect.update();
            requestAnimationFrame(animate)
        }
        animate()
    };

    
    
}

const config1 = {
    colors : ['#353839', '#FF8C00', '#4B4E53'],
    geometry: 'triangle', // triangle, square
    // pointsDown: true, // comment to toggle for triangle
    grayMethod: 'luminosity', // lightness, average
    threshold: 255, // 0 (black) to 255 (white)
    // pathToJPG: 'http://127.0.0.1:5500/schwarzbild.jpg',
    poolingSize: 4,
    poolingMethod: 'maximum',
    factor: 20, //
    particleSize: 7,
    particleSizeFunction: particleSize.random , // comment to only use particleSize
    keepParticleSize: false, // if false, the size of particles changes relative to zooming
    keepParticlePopulation: false, // particles count remains the same when zooming
    particleFriction: 0.8 // the smaller, the faster it returns to original place, if 1 it stays, > 1, it's gone
}

const config2 = {
    colors : ['#3CB839', '#FFFC00', '#4B4453'],
    geometry: 'circle', // triangle, square
    // pointsDown: true, // comment to toggle for triangle
    grayMethod: "average" , // lightness, average, luminosity
    threshold: 250, // 0 (black) to 255 (white)
    pathToJPG: 'http://127.0.0.1:5500/particle-box.jpg',
    poolingSize: 10,
    poolingMethod: 'maximum',
    factor: 3, //
    particleSize: 5,
    // particleSizeFunction: particleSize.gray , // comment to only use particleSize
    keepParticleSize: true, // if false, the size of particles changes relative to zooming
    keepParticlePopulation: false, // particles count remains the same when zooming
    particleFriction: 0.8 // the smaller, the faster it returns to original place, if 1 it stays, > 1, it's gone
}

document.addEventListener('DOMContentLoaded', function() {   
    const backgroundBox = new ParticleBox('#bg-canvas', config1);
    backgroundBox.run();  // 

    const imageBox = new ParticleBox('#img-canvas', config2);
    imageBox.run();
});

