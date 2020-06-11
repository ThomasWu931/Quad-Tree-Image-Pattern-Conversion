let patterns = [];
let patternChunks = [];
let interval = 10; // Based off of percentage
let img;
let objCnt = 0;  // Records the number of "chunks" needed to re-create the image

function preload(){

  // Main image to covnert
  img = loadImage("Jimi_Hendrix.jpg");
  
  // patterns.push(loadImage("Patterns/1.PNG"), loadImage("Patterns/2.PNG"));
  patterns.push(loadImage("Patterns/1.PNG"), loadImage("Patterns/2.PNG"), loadImage("Patterns/3.PNG"), loadImage("Patterns/4.PNG"), loadImage("Patterns/5.PNG"), loadImage("Patterns/6.PNG"), loadImage("Patterns/7.PNG"), loadImage("Patterns/8.PNG"), loadImage("Patterns/9.PNG"), loadImage("Patterns/10.PNG"), loadImage("Patterns/11.png"), loadImage("Patterns/12.jpg"), loadImage("Patterns/14.jpg"), loadImage("Patterns/a.PNG"), loadImage("Patterns/b.PNG"), loadImage("Patterns/13.jpg"), loadImage("Patterns/15.jpg"), loadImage("Patterns/16.jpg"), loadImage("Patterns/g.png"), loadImage("Patterns/h.png"), loadImage("Patterns/j.png"), loadImage("Patterns/k.png"), loadImage("Patterns/17.png"), loadImage("Patterns/l.png"), loadImage("Patterns/m.png"), loadImage("Patterns/n.png"), loadImage("Patterns/o.png"), loadImage("Patterns/p.png"), loadImage("Patterns/q.png"), loadImage("Patterns/r.png"), loadImage("Patterns/18.jpg"), loadImage("Patterns/19.png"), loadImage("Patterns/20.png"), loadImage("Patterns/21.png"), loadImage("Patterns/22.png"), loadImage("Patterns/23.png"), loadImage("Patterns/24.png"), loadImage("Patterns/25.png"), loadImage("Patterns/26.png"), loadImage("Patterns/27.PNG"), loadImage("Patterns/c.PNG"), loadImage("Patterns/28.PNG"), loadImage("Patterns/d.png"), loadImage("Patterns/e.png"), loadImage("Patterns/f.png"), loadImage("Patterns/29.png"), loadImage("Patterns/30.png"), loadImage("Patterns/31.png"), loadImage("Patterns/32.jpg"), loadImage("Patterns/33.PNG"), loadImage("Patterns/34.PNG"));

}

function setup() {
  
  // Set up patterbChunks' chunks
  for (let i = 0; i < int(100 / interval + 0.9999) + 1; i++) patternChunks.push([]);
  
  let imgW = 200; let imgH = 200;
  for (let i = 0; i < patterns.length; i++){
    let img = patterns[i];
    createCanvas(imgW, imgH);
    image(img, 0, 0, imgW, imgH);
    loadPixels();

    let shade = 0;
    for (let y = 0; y < imgH; y++){
      for (let x = 0; x < imgW; x++){
        let r = pixels[x * 4 + y * imgW * 4];
        let g = pixels[x * 4 + 1 + y * imgW * 4];
        let b = pixels[x * 4 + 2 + y * imgW * 4];
        let gray = (r + g + b) / 3;
        shade += gray;
      }
    }
    shade /= imgW * imgH;
    let percent = shade / 255 * 100
    
    patternChunks[int(percent / interval + 0.9999)].push([img, percent]);
  }

  print("done chunking")
  
  imgW = 1500;
  imgH = 2000;
  img.resize(imgW,imgH);
  createCanvas(imgW, imgH);  // We want the image to fully cover the screen

  // Faster implmentation using pixels array
  colors = [];
  image(img, 0, 0);
  filter(GRAY);
  loadPixels();  // Record all rgb values on screen (all rbg values of the image in this case) onto a  1-D array
  let imgLength = imgW * imgH * 4; // The length of the 1-D array (Note that the array store red, green, blue, alpha)
  let row = [];
  for (let i = 0; i < imgLength; i+=4){    
    if ((i % (imgW * 4)) == 0 && (i > 0)){
      colors.push(row);
      row = []; 
    }
    row.push([pixels[i], pixels[i + 1], pixels[i + 2]]);  // Note that we don't care for the alpha value
  }
  colors.push(row);  
  
  createCanvas(1500, 2000);  // Now we don't care about the image fully covering the screen
  image(img, img.width, 0);
  filter(GRAY);
  
  qTree = new QuadTree(0,0,img.width,img.height,600, 0) // Edit error limit here (Less = more accurate)
  qTree.update(colors);  // Insert colors into quad-tree and begin chunking
    
  qTree.draw();  // Draw compressed image 

  print(objCnt, imgW * imgH)  // Compares the # of chunks (Regions where pixels have the same color) vs the # of pixels between the compressed and orignal image
  
  
}

function calculateError(x, y, w, h, colors){  // Calculate the error value of a region
  // Function firstly finds the average rbg color of the region
  // It then calculates the error value through checking how much every pixel on the screen differs from the average color
  
  let vals = calculateAvg(x, y, w, h, colors);
  let r = vals[0]; let g = vals[1]; let b = vals[2];
  let errorSum = 0;
  
  for (let ny = y; ny < (y + h); ny++){
    for (let nx = x; nx < (x + w); nx++){
      
      // Note that the reason we do squared is to accentuate color variation
      // Smaller color varaiations return smaller error values while larger vairations would be have near exponentially larger error return values
      // The point is that we don't want a linear model for error values. Instead, we want a model that REALLY points out on large color varations. 
      errorSum += pow(abs(colors[ny][nx][0] - r), 2);
      errorSum += pow(abs(colors[ny][nx][1] - g), 2); 
      errorSum += pow(abs(colors[ny][nx][2] - b), 2);  
      
      // Incase we want to have a linear model for calculating error value
      // errorSum += pow(abs(colors[ny][nx][0] - r), 1);
      // errorSum += pow(abs(colors[ny][nx][1] - g), 1); 
      // errorSum += pow(abs(colors[ny][nx][2] - b), 1); 
    }
  }
  
  let error = errorSum / (3 * w * h);  // Average out the "total error" in order to get an "average error"
  return error;
}

function calculateAvg(x, y, w, h, colors){  // Find the average rbg color of a region
  let r = 0; let b = 0; let g = 0;
  for (let ny = y; ny < (y + h); ny++){
    for (let nx = x; nx < (x + w); nx++){
      r += colors[ny][nx][0];
      g += colors[ny][nx][1];
      b += colors[ny][nx][2];
    }
  }
  
  r /= (w * h);
  g /= (w * h);
  b /= (w * h);
  
  return [r, g, b];
}

function draw() {
}

class QuadTree{
  constructor(x, y, w, h, errorLim, depth){
    this.children = [false, false, false, false];  // Children quadtrees
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.errorLim = errorLim; 
    this.depth = depth;
    this.maxDepth = 6;  // An additional restriction which prevents us to chunk near pixel size regions (If chunks are too small, we wouldn't be doing much compression)
  }
  
  split(){
    // Refer to Diagram.png for a semi-explination of why we do this
    // TLDR, some pixels are not accounted for when width or height are decimals
    // The solution is to split the quadtree nearly halfway to get an integer width and height
    let highx; let highy; let lowx; let lowy;
    let quadW; let quadH;
    
    if (this.w / 2 != int(this.w / 2)){
      highx = int(this.w/2) + 1;
      lowx = int(this.w/2);
    }
    else{
      highx = this.w/2;
      lowx = this.w/2;
    }
    
    if (this.h / 2 != int(this.h / 2)){
      highy = int(this.h/2) + 1;
      lowy = int(this.h/2);
    }
    else{
      highy = this.h/2;
      lowy = this.h/2;
    }
    
    
    this.children[0] = new QuadTree(this.x + highx, this.y, lowx, highy, this.errorLim, this.depth + 1);
    this.children[1] = new QuadTree(this.x, this.y, highx, highy, this.errorLim, this.depth + 1);
    this.children[2] = new QuadTree(this.x, this.y + highy, highx, lowy, this.errorLim, this.depth + 1);
    this.children[3] = new QuadTree(this.x + highx, this.y + highy, lowx, lowy, this.errorLim, this.depth + 1);
    
  }
  
  update(colors){
    if (calculateError(this.x, this.y, this.w, this.h, colors) > this.errorLim && this.depth < this.maxDepth){
      this.split(); 
      for (let child of this.children){
        child.update(colors); 
      }
    }
    else{
      this.color = calculateAvg(this.x, this.y, this.w, this.h, colors);
    }
  }
  
  draw(){
    objCnt += 1;
    if (this.children[0] != false){
      for (let child of this.children){
        child.draw(); 
      }
    }
    else{
      noStroke();
      let percent = this.fade((this.color[0] +  this.color[1] + this.color[2]) / 3 / 255) * 100;
      let idx = int(percent / interval + 0.9999);
      // Here, we can basically reconstruct the image in whatever shape we want (triagles, rectangles, abstract designs, etc)
      image(random(patternChunks[idx])[0], this.x, this.y, this.w, this.h);
    }
  }
  
  fade(val){
    return val * val * val * (val * (val * 6 - 15) + 10);
  }
}


