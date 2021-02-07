import * as PIXI from 'pixi.js'
import {animate, easeOut} from 'popmotion'

import {pixelRatio, renderer, screen} from '~/core'
import {createPromise, delay} from '~/util'
import * as particle from './particle'

const TEXT = {
  defaults: ['GITHUB', '祝 大家', '新年快乐'],
  zodiacs: ['🐁', '🐂', '🐅', '🐇', '🐉', '🐍', '🐎', '🐏', '🐒', '🐓', '🐕', '🐖']
}

let fontSize: number
let box: PIXI.Container
let shadow: PIXI.Graphics

let speed = 1
let looped = false
let txts = TEXT.defaults

export async function init() {
  const {stage} = await import('~/core')
  box = new PIXI.Container()
  shadow = new PIXI.Graphics()
    .beginFill(0, .5)
    .drawRect(0, 0, screen.width, screen.height)
    .endFill()
  shadow.visible = false
  shadow.zIndex = 2
  box.addChild(shadow)
  stage.addChild(box)
  loop()
}


async function loop(i = 0) {
  looped = true
  // 释放所有粒子
  particle.recycle()

  if (!txts?.length) return looped = false

  if (i > txts.length - 1) i = 0

  const positions = particle.getPostions(txts[i++], fontSize)
  const total = positions.length
  const [promise, resolve] = createPromise()

  let count = 0

  for (const position of positions) {
    const avatar = particle.get()

    if (!avatar.controllable) {
      resolve()
      continue
    }

    !avatar.parent && box.addChild(avatar)

    animate({
      from: {x: avatar.x, y: avatar.y, alpha: avatar.alpha, rotation: avatar.rotation},
      to: {x: position.x, y: position.y, alpha: 1, rotation: 0},
      ease: easeOut,
      duration: 3e3 / speed,
      onUpdate: v => {
        if (!avatar.controllable) return
        avatar.alpha = v.alpha
        avatar.rotation = v.rotation
        avatar.position.copyFrom(v)
      },
      onComplete: () => {
        ++count === total && resolve()
      }
    })
  }

  await promise
  await delay(2 / speed)

  loop(i)
}

export async function lottery() {
  fontSize = 640
  speed = 4
  txts = TEXT.zodiacs
  !looped && loop()
}

export async function normal() {
  fontSize = 360
  speed = 1
  txts = TEXT.defaults
  !looped && loop()
}

export async function congratulate(users: IUser[], COL = 10): Promise<particle.Avatar[]> {
  txts = null

  const avatars = users.map(user => particle.get(user.id))

  const row = Math.ceil(avatars.length / COL)
  const col = Math.min(avatars.length, COL)
  const col_2 = col / 2 | 0
  const row_2 = row / 2 | 0

  let scale = 6
  let r = (window.r + 10) * scale

  const mw = 2 * r * col
  const mh = (2 * r + 20) * row
  const zoom = Math.min(screen.width / mw, screen.height / mh, 1)

  r *= zoom
  scale *= zoom

  const [promise, resolve] = createPromise()

  let count = 0

  avatars.forEach((avatar, i) => {
    if (!avatar) return

    let x = i % COL
    let y = i / COL | 0

    x = col % 2 ? (x - col_2) * r * 2 : (x - col_2 + .5) * r * 2
    y = row % 2 ? (y - row_2) * r * 2 : (y - row_2 + .5) * r * 2

    avatar.zIndex = 3
    avatar.controllable = false

    animate({
      from: {x: avatar.x, y: avatar.y, scale: avatar.scale.x, alpha: avatar.alpha, rotation: avatar.rotation},
      to: {x: x + screen.width / 2, y: y + screen.height / 2, scale, rotation: 0, alpha: 1},
      duration: 1e3,
      onUpdate: v => {
        avatar.alpha = v.alpha
        avatar.rotation = v.rotation
        avatar.scale.set(v.scale)
        avatar.position.copyFrom(v)
      },
      onComplete: () => {
        avatar.nickname.visible = true
        avatar.nickname.scale.set(1 / avatar.scale.x)
        ++count === avatars.length && resolve()
      }
    })
  })

  await promise

  shadow.visible = true

  return avatars
}

/**
 *
 * @param {particle.Avatar[]} avatars 待释放头像
 */
export async function go(avatars: particle.Avatar[]) {
  // 释放当前选中的用户
  for (const avatar of avatars) avatar.free()
  shadow.visible = false
  particle.pool.push(...avatars)
}
