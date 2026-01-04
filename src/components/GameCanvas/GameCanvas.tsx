import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ToolBox from '@/components/ToolBox';
import { ToolType, GridCell, Building } from '@/types/game.types';

const GameCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const gridCellsRef = useRef<GridCell[]>([]);
  const buildingsRef = useRef<Building[]>([]);
  const selectedToolRef = useRef<ToolType>('building');
  const [selectedTool, setSelectedTool] = useState<ToolType>('building');
  const highlightedCellsRef = useRef<GridCell[]>([]);

  const handleToolChange = (tool: ToolType) => {
    selectedToolRef.current = tool;
    setSelectedTool(tool);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const mountElement = mountRef.current;
    const buildingsArray = buildingsRef.current;

    // Grid configuration
    const GRID_SIZE = 100;
    const CELL_SIZE = 2;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Start closer to the grid center for better initial view
    const gridCenterX = (GRID_SIZE * CELL_SIZE) / 2;
    const gridCenterZ = (GRID_SIZE * CELL_SIZE) / 2;
    camera.position.set(gridCenterX + 30, 40, gridCenterZ + 30);
    camera.lookAt(gridCenterX, 0, gridCenterZ);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountElement.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.5; // Don't go below ground
    controls.minDistance = 10; // Closer zoom for finer granularity
    controls.maxDistance = 300;
    controls.enablePan = true; // Enable panning
    controls.panSpeed = 1.0;
    controls.screenSpacePanning = false; // Pan in ground plane
    controls.target.set(gridCenterX, 0, gridCenterZ); // Set initial target to grid center
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    // Create grid
    const gridCells: GridCell[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const geometry = new THREE.BoxGeometry(CELL_SIZE - 0.2, 0.2, CELL_SIZE - 0.2);
        const material = new THREE.MeshStandardMaterial({
          color: (x + z) % 2 === 0 ? 0xcccccc : 0x999999,
        });
        const cell = new THREE.Mesh(geometry, material);
        
        cell.position.x = x * CELL_SIZE;
        cell.position.y = 0;
        cell.position.z = z * CELL_SIZE;
        
        cell.receiveShadow = true;
        cell.userData = { gridX: x, gridZ: z, isGridCell: true, hasBuilding: false };
        
        scene.add(cell);
        gridCells.push(cell as GridCell);
      }
    }
    gridCellsRef.current = gridCells;

    // Helper functions
    const getCellByCoords = (gridX: number, gridZ: number): GridCell | undefined => {
      return gridCells.find(cell => 
        cell.userData.gridX === gridX && cell.userData.gridZ === gridZ
      );
    };

    const areCellsAvailable = (gridX: number, gridZ: number, sizeX: number, sizeZ: number): boolean => {
      for (let x = gridX; x < gridX + sizeX; x++) {
        for (let z = gridZ; z < gridZ + sizeZ; z++) {
          if (x >= GRID_SIZE || z >= GRID_SIZE) return false;
          const cell = getCellByCoords(x, z);
          if (!cell || cell.userData.hasBuilding) return false;
        }
      }
      return true;
    };

    // Get building size based on tool type
    const getBuildingSize = (toolType: ToolType): { sizeX: number, sizeZ: number } => {
      if (toolType === 'building') return { sizeX: 2, sizeZ: 2 };
      if (toolType === 'road') return { sizeX: 1, sizeZ: 1 };
      return { sizeX: 1, sizeZ: 1 };
    };

    // Clear all highlighted cells
    const clearHighlights = () => {
      highlightedCellsRef.current.forEach(cell => {
        const { gridX, gridZ } = cell.userData;
        cell.material.color.set(
          (gridX + gridZ) % 2 === 0 ? 0xcccccc : 0x999999
        );
      });
      highlightedCellsRef.current = [];
    };

    // Highlight cells for placement
    const highlightCells = (startX: number, startZ: number, sizeX: number, sizeZ: number, canPlace: boolean) => {
      clearHighlights();
      
      for (let x = startX; x < startX + sizeX; x++) {
        for (let z = startZ; z < startZ + sizeZ; z++) {
          if (x >= GRID_SIZE || z >= GRID_SIZE) continue;
          const cell = getCellByCoords(x, z);
          if (cell) {
            highlightedCellsRef.current.push(cell);
            if (cell.userData.hasBuilding) {
              cell.material.color.set(0xff0000); // Red for invalid
            } else {
              cell.material.color.set(canPlace ? 0x00ff00 : 0xff0000); // Green for valid, red for invalid
            }
          }
        }
      }
    };

    // Raycasting for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedCell: GridCell | null = null;
    const mouseDownPos = { x: 0, y: 0 };
    let mouseDownTime = 0;

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(gridCells);

      // Highlight cells based on tool selection
      if (intersects.length > 0) {
        selectedCell = intersects[0].object as GridCell;
        const { gridX, gridZ } = selectedCell.userData;
        const { sizeX, sizeZ } = getBuildingSize(selectedToolRef.current);
        const canPlace = areCellsAvailable(gridX, gridZ, sizeX, sizeZ);
        highlightCells(gridX, gridZ, sizeX, sizeZ, canPlace);
      } else {
        clearHighlights();
        selectedCell = null;
      }
    };

    const placeBuilding = (gridX: number, gridZ: number, sizeX: number = 2, sizeZ: number = 2): Building | null => {
      // Check if area is available
      if (!areCellsAvailable(gridX, gridZ, sizeX, sizeZ)) return null;

      // Create a building (colored cube)
      const height = Math.random() * 3 + 2;
      // Match the cell geometry size (CELL_SIZE - 0.2) for each cell
      const buildingWidth = (CELL_SIZE - 0.2) * sizeX;
      const buildingDepth = (CELL_SIZE - 0.2) * sizeZ;
      const geometry = new THREE.BoxGeometry(buildingWidth, height, buildingDepth);
      const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
      });
      const building = new THREE.Mesh(geometry, material);
      
      // Position at center of occupied cells (cells are positioned at gridX * CELL_SIZE)
      // Building center should be at the center of all occupied cell centers
      const firstCellCenterX = gridX * CELL_SIZE;
      const lastCellCenterX = (gridX + sizeX - 1) * CELL_SIZE;
      const firstCellCenterZ = gridZ * CELL_SIZE;
      const lastCellCenterZ = (gridZ + sizeZ - 1) * CELL_SIZE;
      
      building.position.x = (firstCellCenterX + lastCellCenterX) / 2;
      building.position.y = height / 2;
      building.position.z = (firstCellCenterZ + lastCellCenterZ) / 2;
      
      building.castShadow = true;
      building.receiveShadow = true;
      building.userData = { gridX, gridZ, sizeX, sizeZ, type: 'building' };
      
      scene.add(building);
      buildingsArray.push(building as Building);
      
      // Mark all cells as occupied
      for (let x = gridX; x < gridX + sizeX; x++) {
        for (let z = gridZ; z < gridZ + sizeZ; z++) {
          const cell = getCellByCoords(x, z);
          if (cell) {
            cell.userData.hasBuilding = true;
            cell.material.color.set((x + z) % 2 === 0 ? 0x666666 : 0x444444);
          }
        }
      }
      
      return building;
    };

    const placeRoad = (gridX: number, gridZ: number, sizeX: number = 1, sizeZ: number = 1): Building | null => {
      // Check if cell is available
      if (!areCellsAvailable(gridX, gridZ, sizeX, sizeZ)) return null;

      // Create a road (flat, dark rectangle)
      // Match the cell geometry size (CELL_SIZE - 0.2) for each cell
      const roadWidth = (CELL_SIZE - 0.2) * sizeX;
      const roadDepth = (CELL_SIZE - 0.2) * sizeZ;
      const geometry = new THREE.BoxGeometry(roadWidth, 0.1, roadDepth);
      const material = new THREE.MeshStandardMaterial({
        color: 0x333333,
      });
      const road = new THREE.Mesh(geometry, material);
      
      // Position at center of occupied cells (cells are positioned at gridX * CELL_SIZE)
      const firstCellCenterX = gridX * CELL_SIZE;
      const lastCellCenterX = (gridX + sizeX - 1) * CELL_SIZE;
      const firstCellCenterZ = gridZ * CELL_SIZE;
      const lastCellCenterZ = (gridZ + sizeZ - 1) * CELL_SIZE;
      
      road.position.x = (firstCellCenterX + lastCellCenterX) / 2;
      road.position.y = 0.15;
      road.position.z = (firstCellCenterZ + lastCellCenterZ) / 2;
      
      road.receiveShadow = true;
      road.userData = { gridX, gridZ, sizeX, sizeZ, type: 'road' };
      
      scene.add(road);
      buildingsArray.push(road as Building);
      
      // Mark all cells as occupied
      for (let x = gridX; x < gridX + sizeX; x++) {
        for (let z = gridZ; z < gridZ + sizeZ; z++) {
          const cell = getCellByCoords(x, z);
          if (cell) {
            cell.userData.hasBuilding = true;
            cell.material.color.set(0x444444);
          }
        }
      }
      
      return road;
    };

    const removeBuilding = (gridX: number, gridZ: number): boolean => {
      const buildingIndex = buildingsArray.findIndex(
        b => {
          const { gridX: bx, gridZ: bz, sizeX = 1, sizeZ = 1 } = b.userData;
          return gridX >= bx && gridX < bx + sizeX && gridZ >= bz && gridZ < bz + sizeZ;
        }
      );
      
      if (buildingIndex !== -1) {
        const building = buildingsArray[buildingIndex];
        const { gridX: bx, gridZ: bz, sizeX = 1, sizeZ = 1 } = building.userData;
        
        scene.remove(building);
        building.geometry.dispose();
        building.material.dispose();
        buildingsArray.splice(buildingIndex, 1);
        
        // Restore all cells
        for (let x = bx; x < bx + sizeX; x++) {
          for (let z = bz; z < bz + sizeZ; z++) {
            const cell = getCellByCoords(x, z);
            if (cell) {
              cell.userData.hasBuilding = false;
              cell.material.color.set((x + z) % 2 === 0 ? 0xcccccc : 0x999999);
            }
          }
        }
        
        return true;
      }
      return false;
    };

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return; // Only left button
      
      mouseDownPos.x = event.clientX;
      mouseDownPos.y = event.clientY;
      mouseDownTime = Date.now();
    };

    const onMouseUp = (event: MouseEvent) => {
      if (event.button !== 0) return; // Only left button

      // Check if mouse moved (dragging camera) or time was too long
      const dx = Math.abs(event.clientX - mouseDownPos.x);
      const dy = Math.abs(event.clientY - mouseDownPos.y);
      const dt = Date.now() - mouseDownTime;
      
      // If mouse moved more than 5px or took longer than 200ms, it was a drag
      if (dx > 5 || dy > 5 || dt > 200) return;

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(gridCells);

      if (intersects.length > 0) {
        const cell = intersects[0].object as GridCell;
        const { gridX, gridZ } = cell.userData;
        const { sizeX, sizeZ } = getBuildingSize(selectedToolRef.current);

        if (selectedToolRef.current === 'building') {
          placeBuilding(gridX, gridZ, sizeX, sizeZ);
        } else if (selectedToolRef.current === 'road') {
          placeRoad(gridX, gridZ, sizeX, sizeZ);
        }
        
        clearHighlights();
      }
    };

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(gridCells);

      if (intersects.length > 0) {
        const cell = intersects[0].object as GridCell;
        const { gridX, gridZ } = cell.userData;

        if (cell.userData.hasBuilding) {
          removeBuilding(gridX, gridZ);
        }
      }
    };

    // Handle window resize
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Event listeners
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('resize', onWindowResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('resize', onWindowResize);
      
      mountElement?.removeChild(renderer.domElement);
      renderer.dispose();
      controls.dispose();
      
      gridCells.forEach(cell => {
        cell.geometry.dispose();
        cell.material.dispose();
      });
      
      buildingsArray.forEach(building => {
        building.geometry.dispose();
        building.material.dispose();
      });
    };
  }, []);

  return (
    <>
      <ToolBox selectedTool={selectedTool} onToolChange={handleToolChange} />
      <div ref={mountRef} id="game-canvas" />
    </>
  );
};

export default GameCanvas;
