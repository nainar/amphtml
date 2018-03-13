/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {isFiniteNumber} from '../src/types';
import {loadScript} from './3p';

/**
 * Produces the AirBnB Bodymovin Player SDK object for the passed in callback.
 * @param {!Window} global
 * @param {function(!Object)} cb
 */

function getBodymovinAnimationSdk(global, cb) {
  loadScript(global, 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/4.13.0/bodymovin.js', function() {
    cb(global.bodymovin);
  });
}

function loadAnimationOnEvent(event) {
  const dataReceived = JSON.parse(event.data);
  const autoplay = dataReceived['autoplay'];
  const dataLoop = dataReceived['loop'];
  const animationData = dataReceived['animationData'];
  const animatingContainer = global.document.createElement('div');

  global.document.getElementById('c').appendChild(animatingContainer);
  const shouldLoop = dataLoop == 'true';
  const loop = isFiniteNumber(dataLoop) ? parseInt(dataLoop, 10) : shouldLoop;

  getBodymovinAnimationSdk(global, function() {
    bodymovin.loadAnimation({
      container: animatingContainer,
      renderer: 'svg',
      loop: loop,
      autoplay: autoplay,
      animationData,
    });
  });
}

window.addEventListener('message', loadAnimationOnEvent, false);

export function bodymovinanimation(global, data) {
}
