import Interaction from '@iro/interaction'
import {PRECISION, Renderer, settings} from 'pixi.js'

settings.SORTABLE_CHILDREN = true
settings.PRECISION_FRAGMENT = PRECISION.HIGH

Renderer.registerPlugin('interaction', Interaction)
