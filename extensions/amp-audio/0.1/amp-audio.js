/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {
  EMPTY_METADATA,
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../../../src/mediasession-helper';
import {Layout} from '../../../src/layout';
import {assertHttpsUrl} from '../../../src/url';
import {closestByTag} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {listen} from '../../../src/event-helper';

const TAG = 'amp-audio';


/**
 * Visible for testing only.
 */
export class AmpAudio extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.audio_ = null;

    /** @private {!../../../src/mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    /** @public {boolean} */
    this.isPlaying = false;

  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
  }

  /** @override */
  buildCallback() {
    this.registerAction('play', this.play.bind(this));
    this.registerAction('pause', this.pause.bind(this));
  }

  /** @override */
  layoutCallback() {
    const audio = this.element.ownerDocument.createElement('audio');
    if (!audio.play) {
      this.toggleFallback(true);
      return Promise.resolve();
    }

    // Force controls otherwise there is no player UI.
    audio.controls = true;
    if (this.element.getAttribute('src')) {
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
    }
    this.propagateAttributes(
        ['src', 'preload', 'autoplay', 'muted', 'loop', 'aria-label',
          'aria-describedby', 'aria-labelledby', 'controlsList'],
        audio);

    this.applyFillContent(audio);
    this.getRealChildNodes().forEach(child => {
      if (child.getAttribute && child.getAttribute('src')) {
        assertHttpsUrl(child.getAttribute('src'),
            dev().assertElement(child));
      }
      audio.appendChild(child);
    });
    this.element.appendChild(audio);
    this.audio_ = audio;

    // Gather metadata
    const doc = this.getAmpDoc().win.document;
    const artist = this.element.getAttribute('artist');
    const title = this.element.getAttribute('title')
                  || this.element.getAttribute('aria-label')
                  || doc.title;
    const album = this.element.getAttribute('album');
    const artwork = this.element.getAttribute('artwork')
                   || parseSchemaImage(doc)
                   || parseOgImage(doc)
                   || parseFavicon(doc);
    this.metadata_ = {
      'title': title || '',
      'artist': artist || '',
      'album': album || '',
      'artwork': [
        {'src': artwork || ''},
      ],
    };

    listen(this.audio_, 'playing', () => this.audioPlaying_());
    return this.loadPromise(audio);
  }

  /** @override */
  pauseCallback() {
    if (this.audio_) {
      this.audio_.pause();
      this.setPlayingStateForTesting_(false);
    }
  }

  pause() {
    if (!this.audio_) {
      return;
    }
    if (this.isStoryDescendant_()) {
      user().warn(TAG, '<amp-story> elements do not support actions on ' +
        '<amp-audio> elements');
      return;
    }
    this.audio_.pause();
    this.setPlayingStateForTesting_(false);
  }

  play() {
    if (!this.audio_) {
      return;
    }
    if (this.isStoryDescendant_()) {
      user().warn(TAG, '<amp-story> elements do not support actions on ' +
        '<amp-audio> elements');
      return;
    }
    this.audio_.play();
    this.setPlayingStateForTesting_(true);
  }

  /**
   * Returns whether the audio is playing or not.
   * @returns {boolean}
   * @VisibleForTesting
   */
  setPlayingStateForTesting_(val) {
    if (getMode().test) {
      this.isPlaying = val;
    }
  }

  /**
   * Returns whether `<amp-audio>` has an `<amp-story>` for an ancestor.
   * @returns {boolean}
   * @VisibleForTesting
   */
  isStoryDescendant_() {
    return closestByTag(this.element, 'AMP-STORY') ? true : false;
  }


  audioPlaying_() {
    const playHandler = () => {
      this.audio_.play();
      this.setPlayingStateForTesting_(true);
    };
    const pauseHandler = () => {
      this.audio_.pause();
      this.setPlayingStateForTesting_(false);
    };

    // Update the media session
    setMediaSession(
        this.getAmpDoc().win,
        this.metadata_,
        playHandler,
        pauseHandler
    );
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpAudio);
});
