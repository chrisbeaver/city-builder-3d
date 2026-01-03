import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const GameCanvas = () => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const controlsRef = useRef(null)
  const gridCellsRef = useRef([])
  const buildingsRef = useRef([])

  useEffect(() => {
    // Grid configuration
    const GRID_SIZE = 10
    const CELL_SIZE = 2

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb) // Sky blue
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(15, 15, 15)
    camera.lookAt(GRID_SIZE, 0, GRID_SIZE)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2.5 // Don't go below ground
    controls.minDistance = 10
    controls.maxDistance = 50
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    }
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(20, 30, 20)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 500
    scene.add(directionalLight)

    // Create grid
    const gridCells = []
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const geometry = new THREE.BoxGeometry(CELL_SIZE - 0.2, 0.2, CELL_SIZE - 0.2)
        const material = new THREE.MeshStandardMaterial({
          color: (x + z) % 2 === 0 ? 0xcccccc : 0x999999,
        })
        const cell = new THREE.Mesh(geometry, material)
        
        cell.position.x = x * CELL_SIZE
        cell.position.y = 0
        cell.position.z = z * CELL_SIZE
        
        cell.receiveShadow = true
        cell.userData = { gridX: x, gridZ: z, isGridCell: true, hasBuilding: false }
        
        scene.add(cell)
        gridCells.push(cell)
      }
    }
    gridCellsRef.current = gridCells

    // Raycasting for click detection
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let selectedCell = null
    let mouseDownPos = { x: 0, y: 0 }
    let mouseDownTime = 0

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(gridCells)

      // Reset previous selection
      if (selectedCell) {
        const { gridX, gridZ } = selectedCell.userData
        selectedCell.material.color.set(
          (gridX + gridZ) % 2 === 0 ? 0xcccccc : 0x999999
        )
      }

      // Highlight new selection
      if (intersects.length > 0) {
        selectedCell = intersects[0].object
        if (!selectedCell.userData.hasBuilding) {
          selectedCell.material.color.set(0x00ff00)
        }
      } else {
        selectedCell = null
      }
    }

    const placeBuilding = (gridX, gridZ) => {
      // Create a simple building (colored cube)
      const height = Math.random() * 3 + 2
      const geometry = new THREE.BoxGeometry(1.5, height, 1.5)
      const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
      })
      const building = new THREE.Mesh(geometry, material)
      
      building.position.x = gridX * CELL_SIZE
      building.position.y = height / 2
      building.position.z = gridZ * CELL_SIZE
      
      building.castShadow = true
      building.receiveShadow = true
      building.userData = { gridX, gridZ, isBuilding: true }
      
      scene.add(building)
      buildingsRef.current.push(building)
      
      return building
    }

    const removeBuilding = (gridX, gridZ) => {
      const buildingIndex = buildingsRef.current.findIndex(
        b => b.userData.gridX === gridX && b.userData.gridZ === gridZ
      )
      
      if (buildingIndex !== -1) {
        const building = buildingsRef.current[buildingIndex]
        scene.remove(building)
        building.geometry.dispose()
        building.material.dispose()
        buildingsRef.current.splice(buildingIndex, 1)
        return true
      }
      return false
    }

    const onMouseDown = (event) => {
      if (event.button !== 0) return // Only left button
      
      mouseDownPos.x = event.clientX
      mouseDownPos.y = event.clientY
      mouseDownTime = Date.now()
    }

    const onMouseUp = (event) => {
      if (event.button !== 0) return // Only left button

      // Check if mouse moved (dragging camera) or time was too long
      const dx = Math.abs(event.clientX - mouseDownPos.x)
      const dy = Math.abs(event.clientY - mouseDownPos.y)
      const dt = Date.now() - mouseDownTime
      
      // If mouse moved more than 5px or took longer than 200ms, it was a drag
      if (dx > 5 || dy > 5 || dt > 200) return

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(gridCells)

      if (intersects.length > 0) {
        const cell = intersects[0].object
        const { gridX, gridZ } = cell.userData

        if (!cell.userData.hasBuilding) {
          placeBuilding(gridX, gridZ)
          cell.userData.hasBuilding = true
          cell.material.color.set((gridX + gridZ) % 2 === 0 ? 0x666666 : 0x444444)
        }
      }
    }

    const onContextMenu = (event) => {
      event.preventDefault()
      
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(gridCells)

      if (intersects.length > 0) {
        const cell = intersects[0].object
        const { gridX, gridZ } = cell.userData

        if (cell.userData.hasBuilding) {
          if (removeBuilding(gridX, gridZ)) {
            cell.userData.hasBuilding = false
            cell.material.color.set((gridX + gridZ) % 2 === 0 ? 0xcccccc : 0x999999)
          }
        }
      }
    }

    // Handle window resize
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    // Event listeners
    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('resize', onWindowResize)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('mouseup', onMouseUp)
      renderer.domElement.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('resize', onWindowResize)
      
      mountRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
      controls.dispose()
      
      gridCells.forEach(cell => {
        cell.geometry.dispose()
        cell.material.dispose()
      })
      
      buildingsRef.current.forEach(building => {
        building.geometry.dispose()
        building.material.dispose()
      })
    }
  }, [])

  return <div ref={mountRef} id="game-canvas" />
}

export default GameCanvas
