import {Renderer, Ticker, Loader, utils, Container, UPDATE_PRIORITY, Point} from 'pixi.js'

let {
  innerWidth: width,
  innerHeight: height,
  devicePixelRatio,
} = window

const ticker = Ticker.shared
const loader = Loader.shared
const stage = new Container()
const monitor = new utils.EventEmitter()
const pixelRatio = Math.min(1, devicePixelRatio)
const view = document.querySelector('canvas')

const renderer = new Renderer({
  view,
  antialias: true,
  backgroundColor: 0x333333,
  // backgroundAlpha: 0,
  width: width * pixelRatio,
  height: height * pixelRatio,
})

ticker.add(() => renderer.render(stage), undefined, UPDATE_PRIORITY.UTILITY)

renderer.plugins.accessibility.destroy()
renderer.plugins.interaction.mapPositionToPoint = (point: Point, x: number, y: number) => {
  point.set(x * pixelRatio, y * pixelRatio)
}

export const screen = renderer.screen

export function tick() {
  return new Promise(resolve => {
    renderer.once('postrender', resolve)
  })
}

export {
  stage,
  loader,
  ticker,
  monitor,
  renderer,
  pixelRatio,
  devicePixelRatio,
}
