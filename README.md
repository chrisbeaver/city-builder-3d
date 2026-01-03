# City Builder 3D - Three.js Learning Project

A web-based city builder game built with React, Vite, and Three.js. This starter project demonstrates the core mechanics needed for a grid-based 3D building game.

## Features

- ✅ 10x10 interactive grid
- ✅ Camera controls (orbit, zoom, pan)
- ✅ Click to place buildings
- ✅ Right-click to remove buildings
- ✅ Hover highlighting
- ✅ Dynamic lighting and shadows
- ✅ Responsive design

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Controls

- **Left Click**: Place a building on an empty grid cell
- **Right Click**: Remove a building
- **Mouse Drag**: Rotate the camera around the city
- **Scroll Wheel**: Zoom in/out
- **Mouse Move**: Highlight grid cells

## Project Structure

```
city-builder-3d/
├── src/
│   ├── components/
│   │   └── GameCanvas.jsx    # Main Three.js game component
│   ├── App.jsx               # Main app component
│   ├── App.css              # Styling
│   └── main.jsx             # Entry point
├── public/                   # Static assets
└── package.json
```

## What You're Learning

This starter covers the essential Three.js concepts:

1. **Scene Setup** - Creating a 3D world
2. **Camera & Controls** - Perspective camera with orbit controls
3. **Lighting** - Ambient + directional lighting with shadows
4. **Geometry & Materials** - Creating 3D objects
5. **Raycasting** - Mouse interaction with 3D objects
6. **Animation Loop** - Continuous rendering
7. **Grid-based Positioning** - Mapping 2D coordinates to 3D space

## Next Steps

### Immediate Improvements
- [ ] Add different building types (houses, factories, parks)
- [ ] Create a building selection menu
- [ ] Add resource system (money, population, etc.)
- [ ] Implement building stats/tooltips
- [ ] Add sound effects

### Visual Enhancements
- [ ] Load actual 3D models (.glb/.gltf files)
- [ ] Add terrain variation (hills, water)
- [ ] Implement day/night cycle
- [ ] Add particle effects (smoke from factories)
- [ ] Better materials and textures

### Game Mechanics
- [ ] Building placement restrictions (roads, zoning)
- [ ] Resource production and consumption
- [ ] Population growth system
- [ ] Building upgrades
- [ ] Save/load game state

### Technical Improvements
- [ ] Optimize rendering (instancing, LOD)
- [ ] Add proper state management (Zustand/Redux)
- [ ] Implement undo/redo
- [ ] Add minimap
- [ ] Mobile touch controls

## Learning Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Manual](https://threejs.org/manual/)
- [Three.js Journey](https://threejs-journey.com/) - Paid course, highly recommended
- [Discover Three.js](https://discoverthreejs.com/) - Free book

## Free 3D Assets

- [Kenney.nl](https://kenney.nl/assets) - Excellent low-poly assets
- [Quaternius](https://quaternius.com/) - Free game-ready models
- [Sketchfab](https://sketchfab.com/) - Search with "free download" filter

## Code Walkthrough

### Grid Creation
```javascript
// Creates a checkerboard pattern of grid cells
for (let x = 0; x < GRID_SIZE; x++) {
  for (let z = 0; z < GRID_SIZE; z++) {
    // Position each cell in 3D space
    cell.position.x = x * CELL_SIZE
    cell.position.z = z * CELL_SIZE
  }
}
```

### Raycasting (Click Detection)
```javascript
// Convert mouse position to 3D world coordinates
raycaster.setFromCamera(mouse, camera)
const intersects = raycaster.intersectObjects(gridCells)
// intersects[0] is the closest object the mouse is pointing at
```

### Building Placement
```javascript
// Create a mesh at grid coordinates
building.position.x = gridX * CELL_SIZE
building.position.y = height / 2  // Center vertically
building.position.z = gridZ * CELL_SIZE
```

## Performance Tips

- Use `InstancedMesh` for repeated objects (many identical buildings)
- Implement frustum culling (don't render off-screen objects)
- Use lower-poly models for distant objects (LOD)
- Limit shadow-casting objects
- Use texture atlases to reduce draw calls

## Moving to Production

When ready to add backend:
1. Extract game logic to separate modules
2. Create API service for Laravel backend
3. Implement WebSocket connection for real-time updates
4. Add authentication layer
5. Separate game state from render state

## License

MIT

## Contributing

This is a learning project - feel free to experiment and break things!
