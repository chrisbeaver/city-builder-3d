# Three.js Quick Reference for City Builder

## Core Concepts

### 1. The Three Essentials

Every Three.js app needs these three things:

```javascript
const scene = new THREE.Scene()      // The world
const camera = new THREE.Camera()    // The viewer
const renderer = new THREE.Renderer() // The drawer
```

### 2. Scene
The container for everything you want to render.

```javascript
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb) // Sky blue
scene.fog = new THREE.Fog(0x87ceeb, 50, 100) // Optional fog
```

### 3. Camera Types

**PerspectiveCamera** (what we use - realistic 3D)
```javascript
const camera = new THREE.PerspectiveCamera(
  75,                  // FOV (field of view) in degrees
  width / height,      // Aspect ratio
  0.1,                 // Near clipping plane (too close = invisible)
  1000                 // Far clipping plane (too far = invisible)
)
camera.position.set(x, y, z)
```

**OrthographicCamera** (isometric games, no perspective)
```javascript
const camera = new THREE.OrthographicCamera(
  left, right, top, bottom, near, far
)
```

### 4. Renderer

```javascript
const renderer = new THREE.WebGLRenderer({ 
  antialias: true  // Smoother edges, slight performance cost
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true // Enable shadows
document.body.appendChild(renderer.domElement)
```

### 5. Geometry (The Shape)

**Common Geometries:**
```javascript
new THREE.BoxGeometry(width, height, depth)
new THREE.SphereGeometry(radius, widthSegments, heightSegments)
new THREE.PlaneGeometry(width, height)
new THREE.CylinderGeometry(radiusTop, radiusBottom, height)
new THREE.ConeGeometry(radius, height)
```

### 6. Material (The Appearance)

**MeshBasicMaterial** - No lighting, flat color
```javascript
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
```

**MeshStandardMaterial** - Realistic, responds to lights
```javascript
const material = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  metalness: 0.5,    // 0 = non-metal, 1 = full metal
  roughness: 0.5,    // 0 = smooth/shiny, 1 = rough/matte
})
```

**MeshPhongMaterial** - Shiny, good for plastic/glossy surfaces
```javascript
const material = new THREE.MeshPhongMaterial({
  color: 0xff0000,
  shininess: 100
})
```

### 7. Mesh (Geometry + Material)

```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
const mesh = new THREE.Mesh(geometry, material)

mesh.position.set(x, y, z)
mesh.rotation.set(x, y, z) // In radians
mesh.scale.set(x, y, z)

scene.add(mesh)
```

### 8. Lighting

**AmbientLight** - Soft overall illumination (no shadows)
```javascript
const light = new THREE.AmbientLight(0xffffff, 0.5) // color, intensity
scene.add(light)
```

**DirectionalLight** - Like the sun, parallel rays (has shadows)
```javascript
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(10, 20, 10)
light.castShadow = true
scene.add(light)
```

**PointLight** - Light bulb, radiates in all directions
```javascript
const light = new THREE.PointLight(0xffffff, 1, 100) // color, intensity, distance
light.position.set(0, 10, 0)
scene.add(light)
```

**SpotLight** - Flashlight/stage light
```javascript
const light = new THREE.SpotLight(0xffffff, 1)
light.position.set(0, 10, 0)
light.angle = Math.PI / 6
scene.add(light)
```

### 9. Shadows

```javascript
// Enable shadows on renderer
renderer.shadowMap.enabled = true

// Make light cast shadows
light.castShadow = true

// Make objects cast/receive shadows
mesh.castShadow = true
ground.receiveShadow = true
```

### 10. Animation Loop

```javascript
function animate() {
  requestAnimationFrame(animate) // Call this function 60 times/second
  
  // Update things here
  cube.rotation.y += 0.01
  controls.update()
  
  renderer.render(scene, camera) // Draw the scene
}
animate() // Start the loop
```

### 11. Raycasting (Mouse Picking)

```javascript
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

function onMouseClick(event) {
  // Convert mouse position to -1 to +1 range
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  
  // Update raycaster
  raycaster.setFromCamera(mouse, camera)
  
  // Check what we hit
  const intersects = raycaster.intersectObjects(scene.children)
  
  if (intersects.length > 0) {
    const firstObject = intersects[0].object
    console.log('Clicked:', firstObject)
  }
}

window.addEventListener('click', onMouseClick)
```

### 12. OrbitControls

```javascript
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true    // Smooth camera movement
controls.dampingFactor = 0.05
controls.maxPolarAngle = Math.PI / 2  // Prevent going below ground
controls.minDistance = 5
controls.maxDistance = 50

// In animation loop:
controls.update()
```

### 13. Loading 3D Models

```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const loader = new GLTFLoader()
loader.load(
  '/models/building.glb',
  (gltf) => {
    const model = gltf.scene
    model.position.set(0, 0, 0)
    scene.add(model)
  },
  (progress) => {
    console.log('Loading:', (progress.loaded / progress.total) * 100 + '%')
  },
  (error) => {
    console.error('Error loading model:', error)
  }
)
```

### 14. Groups (Organizing Objects)

```javascript
const city = new THREE.Group()

const house1 = new THREE.Mesh(geometry, material)
const house2 = new THREE.Mesh(geometry, material)
house2.position.x = 5

city.add(house1)
city.add(house2)
scene.add(city)

// Move entire city at once
city.position.x = 10
```

### 15. Useful UserData

```javascript
mesh.userData = {
  gridX: 5,
  gridZ: 3,
  buildingType: 'house',
  population: 10
}

// Access later
console.log(mesh.userData.buildingType) // 'house'
```

## Common Patterns for City Builders

### Grid to 3D Position
```javascript
const CELL_SIZE = 2
const gridX = 5
const gridZ = 3

const worldX = gridX * CELL_SIZE
const worldZ = gridZ * CELL_SIZE

mesh.position.set(worldX, 0, worldZ)
```

### Color Manipulation
```javascript
// Set color
mesh.material.color.set(0xff0000) // Red
mesh.material.color.set('#ff0000')
mesh.material.color.set('red')

// Get color
const color = mesh.material.color.getHex()
```

### Dispose (Clean Up Memory)
```javascript
// Always dispose when removing objects!
mesh.geometry.dispose()
mesh.material.dispose()
scene.remove(mesh)
```

### Window Resize Handler
```javascript
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', onWindowResize)
```

## Performance Tips

1. **Reuse materials and geometries**
```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 })

// Create 100 cubes with same geometry/material
for (let i = 0; i < 100; i++) {
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
}
```

2. **Use InstancedMesh for many identical objects**
```javascript
const count = 1000
const mesh = new THREE.InstancedMesh(geometry, material, count)

for (let i = 0; i < count; i++) {
  const matrix = new THREE.Matrix4()
  matrix.setPosition(x, y, z)
  mesh.setMatrixAt(i, matrix)
}

scene.add(mesh)
```

3. **Limit shadow-casting objects**
```javascript
// Only important objects cast shadows
importantBuilding.castShadow = true

// Small/distant objects don't
smallDecor.castShadow = false
```

## Debugging Tips

```javascript
// Add axes helper (red=X, green=Y, blue=Z)
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

// Add grid helper
const gridHelper = new THREE.GridHelper(20, 20)
scene.add(gridHelper)

// Log camera position
console.log(camera.position)

// Log FPS
const stats = new Stats()
document.body.appendChild(stats.dom)
// In animate loop: stats.update()
```

## Common Gotchas

1. **Materials need lights** - MeshStandardMaterial/MeshPhongMaterial won't show without lights
2. **Angles are in radians** - `Math.PI / 2` = 90 degrees
3. **Y is up** - Not Z like some engines
4. **Objects start at origin (0,0,0)** - Always set position explicitly
5. **Dispose to prevent memory leaks** - geometry.dispose(), material.dispose()
6. **Controls need update()** - Call in animation loop if damping is enabled

## Next Learning Steps

1. **Load models from Blender** - Learn GLTF workflow
2. **Add textures** - TextureLoader for realistic surfaces
3. **Post-processing** - Bloom, depth of field, etc.
4. **Physics** - cannon-es or ammo.js integration
5. **Optimization** - LOD, frustum culling, instancing
