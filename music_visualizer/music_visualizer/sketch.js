let pg;
let colors;
let fft, peakDetect;
let sound;
let amplitude;
let config = {
  frameRate: 30,
  angleSpeed: 0.005,
  feedbackScale: 0.98,
  feedbackAlpha: 240,
  gridChance: 0.03,
  fractalDepth: 5,
  fractalSize: 400,
  useNoise: false,
  gradientLayers: 2
};

function preload() {
  sound = loadSound('your_audio_file.mp3');
}

function setup() {
  createCanvas(800, 1200);
  frameRate(config.frameRate);
  pg = createGraphics(width, height);
  colors = [
    color(0, 255, 255, 180),
    color(255, 100, 0, 180),
    color(100, 0, 255, 180),
    color(200, 200, 255, 50),
    color(255, 255, 255, 30)
  ];
  noFill();

  fft = new p5.FFT();
  peakDetect = new p5.PeakDetect();
  sound.loop();
}

function draw() {
  fft.analyze();
  peakDetect.update(fft);

  pg.push();
  pg.translate(width / 2, height / 2);
  pg.scale(config.feedbackScale);
  pg.translate(-width / 2, -height / 2);
  pg.tint(255, config.feedbackAlpha);
  pg.image(pg, 0, 0);
  pg.pop();

  drawGrid(pg);
  drawOverlayGradients(pg);

  if (peakDetect.isDetected) {
    config.angleSpeed += 0.002;
  } else {
    config.angleSpeed *= 0.99;
  }

  recursiveRect(pg, 0, 0, config.fractalSize, config.fractalDepth);
  image(pg, 0, 0);
}

function drawGrid(g) {
  g.strokeWeight(1);
  g.stroke(255, 30);
  for (let x = 0; x < width; x += 20) {
    for (let y = 0; y < height; y += 20) {
      if (random() < config.gridChance) {
        g.fill(random(colors));
        g.rect(x, y, random(10, 50), random(10, 50));
      }
    }
  }
}

function drawOverlayGradients(g) {
  for (let i = 0; i < config.gradientLayers; i++) {
    let c = random(colors);
    g.fill(c);
    g.noStroke();
    g.rect(random(width), random(height), random(100, 300), random(100, 300));
  }
}

function recursiveRect(g, x, y, size, depth) {
  if (depth <= 0 || size < 10) return;
  let angle = frameCount * config.angleSpeed + depth;
  let offset = config.useNoise ? noise(angle) * 20 - 10 : sin(angle) * 10;
  g.stroke(255, 60);
  g.noFill();
  g.rect(x + offset, y + offset, size, size);

  let newSize = size * 0.5;
  recursiveRect(g, x, y, newSize, depth - 1);
  recursiveRect(g, x + size - newSize, y, newSize, depth - 1);
  recursiveRect(g, x, y + size - newSize, newSize, depth - 1);
  recursiveRect(g, x + size - newSize, y + size - newSize, newSize, depth - 1);
}
