import * as THREE from 'three';
import { Structure } from './structure.types';

export interface GridCellUserData {
  gridX: number
  gridZ: number
  isGridCell: boolean
  hasBuilding: boolean
}

export interface BuildingUserData {
  gridX: number
  gridZ: number
  sizeX: number
  sizeZ: number
  type: 'building' | 'road'
  /** Reference to the structure definition */
  structure?: Structure
}

export type GridCell = THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> & {
  userData: GridCellUserData
}

export type Building = THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> & {
  userData: BuildingUserData
}

export type ToolType = 'building' | 'road'

export interface GridConfig {
  size: number
  cellSize: number
}
