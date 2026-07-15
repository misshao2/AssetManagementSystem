/**
 * 高德地图 JS API v2.0 基础类型声明
 * 仅声明项目中用到的 API，完整类型可安装 @amap/amap-jsapi-types
 */

declare namespace AMap {
  /** 地图实例 */
  class Map {
    constructor(container: string | HTMLElement, options?: MapOptions)
    addControl(control: any): void
    setFitView(
      overlays?: any[] | null,
      immediately?: boolean,
      avoid?: [number, number, number, number]
    ): void
    destroy(): void
    remove(marker: any): void
  }

  interface MapOptions {
    zoom?: number
    center?: [number, number]
    viewMode?: '2D' | '3D'
    layers?: any[]
  }

  /** 标记点 */
  class Marker {
    constructor(options?: MarkerOptions)
    setMap(map: Map | null): void
    getPosition(): LngLat
    on(event: string, handler: (...args: any[]) => void): void
    clearEvents(event?: string): void
  }

  interface MarkerOptions {
    position?: [number, number] | LngLat
    title?: string
    anchor?: string
    icon?: any
  }

  /** 信息窗 */
  class InfoWindow {
    constructor(options?: InfoWindowOptions)
    open(map: Map, position: LngLat | [number, number]): void
    close(): void
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement
    offset?: Pixel
    anchor?: string
  }

  /** 热力图 */
  class HeatMap {
    constructor(map: Map, options?: HeatMapOptions)
    setMap(map: Map | null): void
    setDataSet(options: { data: HeatMapDataItem[]; max: number }): void
  }

  interface HeatMapOptions {
    radius?: number
    opacity?: [number, number] | number
    gradient?: Record<number, string>
  }

  interface HeatMapDataItem {
    lng: number
    lat: number
    count: number
  }

  /** 坐标 */
  class LngLat {
    constructor(lng: number, lat: number)
    lng: number
    lat: number
  }

  /** 像素偏移 */
  class Pixel {
    constructor(x: number, y: number)
  }

  /** 比例尺控件 */
  class Scale {
    constructor(options?: any)
  }

  /** 工具条控件 */
  class ToolBar {
    constructor(options?: any)
  }
}
