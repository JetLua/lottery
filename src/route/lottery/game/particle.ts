import * as PIXI from 'pixi.js'
import {animate} from 'popmotion'

import {renderer, screen, ticker} from '~/core'

const pool: Avatar[] = []
const bound = screen.clone().pad(window.r)
const cache = new Map<string, PIXI.IPointData[]>()
const PI2 = Math.PI * 2
const PI_2 = Math.PI / 2

let actives: Avatar[] = []

export function init(users: IUser[]) {
  for (const item of users) {
    const avatar = new Avatar({id: item.id, name: item.name, r: window.r})
    pool.push(avatar)
  }
}

export function get(id?: string): Avatar
export function get(id?: any) {
  if (id) {
    let i = actives.findIndex(item => item.id === id)
    if (i !== -1) return actives.splice(i, 1)[0]
    i = pool.findIndex(item => item.id === id)
    if (i !== -1) return pool.splice(i, 1)[0]
  }

  const avatar = pool.length ? pool.splice(pool.length * Math.random() | 0, 1)[0] : create()
  avatar.speed = 0
  actives.push(avatar)
  return avatar
}

function create() {
  const user = window.users[Math.random() * window.users.length | 0]
  const avatar = new Avatar({id: user.id, name: user.name, r: window.r})
  return avatar
}

export function recycle(avatar?: Avatar) {
  if (avatar) {
    avatar.free()
    !pool.includes(avatar) && pool.push(avatar)
    const i = actives.indexOf(avatar)
    if (i !== -1) actives.splice(i, 1)
    return
  }

  for (const avatar of actives) {
    if (!avatar.controllable) continue
    avatar.free()
    pool.push(avatar)
  }

  actives = []
}


export class Avatar extends PIXI.Graphics {
  id: string
  nickname: PIXI.Text

  speed = 0
  omega = Math.random() - .8
  controllable = true

  constructor(opts: {id: string, name: string, r: number, color?: number}) {
    super()
    const border = 1
    const r = opts.r - border / 2
    const texture = PIXI.Texture.from(opts.id)
    const {width, height} = texture
    const hw = width / 2
    const hh = height / 2
    const sx = r / hw
    const sy = r / hh
    const ratio = Math.min(sx, sy)


    this.id = opts.id
    this.zIndex = 1
    this.speed = (1 + Math.random()) * 2
    this.position.set(Math.random() * screen.width, Math.random() * screen.height)

    const nickname = this.nickname = new PIXI.Text(opts.name, {
      fill: 0xffffff,
      fontSize: 20,
      fontWeight: 'bolder'
    })

    nickname.visible = false
    nickname.anchor.set(.5, 0)
    nickname.y = r + 2
    this.addChild(nickname)

    this
      .beginTextureFill({
        texture,
        color: opts.color ?? 0xffffff,
        matrix: new PIXI.Matrix().translate(hw, hh).scale(ratio, ratio)
      })
      .lineStyle({color: 0x00bcd4, width: border})
      .drawCircle(0, 0, r)
      .endFill()

    ticker.add(() => {
      this.update()
    })
  }

  free() {
    this.zIndex = 1
    this.controllable = true
    this.nickname.visible = false
    this.alpha = Math.random() * .5
    this.speed = (1 + Math.random()) * 2
    this.rotation = Math.random() * PI2

    if (this.scale.x === 1) return

    animate({
      from: this.scale.x,
      to: 1,
      duration: 2e2,
      onUpdate: v => this.scale.set(v)
    })
  }

  update() {
    const {speed, controllable} = this

    if (!speed || !controllable) return

    this.rotation += this.omega * .01
    this.rotation %= PI2

    this.x -= Math.cos(this.rotation + PI_2) * this.speed
    this.y -= Math.sin(this.rotation + PI_2) * this.speed

    this.x < bound.left ? this.x = bound.right :
    this.x > bound.right ? this.x = bound.left : 0

    this.y < bound.top ? this.y = bound.bottom :
    this.y > bound.bottom ? this.y = bound.top : 0
  }
}

export function getPostions(txt: string, fontSize = 360) {
  if (cache.has(txt)) return cache.get(txt)

  const text = new PIXI.Text(txt, {
    fontSize,
    fill: 0xffffff,
    fontWeight: 'bolder'
  })

  const {width, height} = text
  const pixels = renderer.plugins.extract.pixels(text)
  const delta = window.r * 2
  const positions = []

  for (let x = 0; x < width; x += delta) {
    for (let y = 0; y < height; y += delta) {
      if (!pixels[(x + y * width) * 4]) continue
      positions.push({
        x: x + (screen.width - width) / 2,
        y: y + (screen.height - height) / 2
      })
    }
  }

  cache.set(txt, positions)

  return positions
}

export {pool}
