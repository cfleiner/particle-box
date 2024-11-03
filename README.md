# Particle Box

A Vanilla JavaScript class to manipulate particles for creating fancy interactive backgrounds or represent images using particles.
The class is based on Conor Bailey's [Particles Project](https://github.com/conorbailey90/particles) and [Tutorial](https://www.youtube.com/watch?v=WCLgGaorfRc). I have created _ParticleBox_  to add additional options and convenience functions to the original logic which makes it easy to embed the logic into existing projects.

If _ParticleBox_ does not fit your requirements, check out 
- [particles.js](https://github.com/VincentGarreau/particles.js/) as the most popular js library for managing particles
- [particle-image](https://github.com/paxtonfitzpatrick/particle-image) as a nice alternative to handle images

### Usage
1. Create a canvas with a parent container.
2. Import the particle-box script.
3. Create a configuration.
4. Create a ParticleBox and run it.
   

```html
 <div>
    <canvas id="my-canvas"></canvas>
 </div>

 <script src="./particleBox.js"></script>
```

```js
const config = {
  "keepParticleSize": false,
  "keepParticlePopulation": false,
  "poolingSize": "4",
  "threshold": "255",
  "particleSize": "7",
  "particleFriction": "0.8",
  "factor": "20",
  "grayMethod": "luminosity",
  "poolingMethod": "maximum",
  "colors": [
    "#9DC097",
    "#82967F",
    "#9EEB91"
  ],
  "bgColor": "#264121",
  "geometry": "triangle"
}

const box = new ParticleBox('#my-canvas', config);
box.run();
```

### `Options`

#### `Appearance`
key | option type / notes | example
----|---------|------
`geometry`   | string | `'circle'`, `'square'`, `'triangle'`
`pointsDown` | boolean | `true`/ `false`
`particleSize` | number | `7`
`particleSizeFunction` | function | `particleSize.random` 
`factor` | number | `4`

#### `Colors`
key | option type / notes | example
----|---------|------
`bgColor` | HEX (string) | `'#3CB839'`
`colors`  | array selection (HEX) | `['#3CB839', '#FFFC00', '#4B4453']`

#### `Behavior`
key | option type / notes | example
----|---------|------
`particleFriction: 0.8 // the smaller, the faster it returns to original place, if 1 it stays, > 1, it's gone`

#### `Image`
key | option type / notes | example
----|---------|------
`grayMethod`| string | `'average'`, `'lightness'`, `'luminosity'`
`threshold` | number | `250`
`pathToJPG` | path link (JPG) |`'http://127.0.0.1:5500/particle-box.jpg'`
`poolingSize` | number | `20`
`poolingMethod` | string | `'maximum'` / `'average'`

#### `Zoom`
key | option type / notes | example
----|---------|------
`keepParticleSize` | boolean | `true`/ `false`
`keepParticlePopulation` | boolean | `true`/ `false`