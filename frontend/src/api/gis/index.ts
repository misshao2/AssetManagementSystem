import { get } from '@/utils/request'

export function getAssetPoints(params: any) {
  return get('/gis/v1/asset/points', params)
}

export function getHeatmap(layer: string, params: any) {
  return get('/gis/v1/asset/heatmap', { layer, ...params })
}

export function getRegionTree() {
  return get('/gis/v1/region/tree')
}
