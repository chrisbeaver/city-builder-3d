/**
 * Defines the properties of structures that can be placed on the grid
 */

export interface TextureSet {
  /** Path to the texture file for walls/sides */
  walls?: string
  /** Path to the texture file for the roof/top */
  roof?: string
  /** Path to the texture file for the base/floor */
  base?: string
  /** Optional normal map for walls */
  wallsNormal?: string
  /** Optional normal map for roof */
  roofNormal?: string
}

export interface StructureDimensions {
  /** Width in grid cells (X axis) */
  width: number
  /** Depth in grid cells (Z axis) */
  depth: number
  /** Height in world units (not grid cells) */
  height: number
}

export interface StructureFunctionality {
  /** Type of structure for game logic */
  category: 'residential' | 'commercial' | 'industrial' | 'infrastructure' | 'decoration'
  /** Optional sub-type for more specific functionality */
  subType?: string
  /** Production or resource generation data */
  production?: {
    resourceType: string
    rate: number
  }
  /** Population or capacity information */
  capacity?: number
  /** Cost to build this structure */
  cost?: {
    coins?: number
    materials?: number
  }
  /** Any special effects or modifiers */
  effects?: Record<string, any>
}

export interface Structure {
  /** Unique identifier for this structure type */
  id: string
  /** Display name shown to the user */
  name: string
  /** Brief description of the structure */
  description: string
  /** Grid dimensions and height */
  dimensions: StructureDimensions
  /** Textures used for rendering */
  textures: TextureSet
  /** Gameplay functionality */
  functionality: StructureFunctionality
  /** Optional preview icon path */
  icon?: string
  /** Whether this structure is currently available to build */
  available?: boolean
}

export interface StructureCollection {
  /** Version of the structure data format */
  version: string
  /** Last updated timestamp */
  lastUpdated: string
  /** Array of available structures */
  structures: Structure[]
}
