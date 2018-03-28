/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {dev, user} from '../../../../src/log';
import {setStyles} from '../../../../src/style';

// First keyframe will always be considered offset: 0 and will be applied to the
// element as the first frame before animation starts.
export const Presets = {
  'parallax': {
    userAsserts(element) {
      const factorValue = user().assert(
          element.getAttribute('data-parallax-factor'),
          'data-parallax-factor=<number> attribute must be provided for: %s',
          element);
      user().assert(parseFloat(factorValue) > 0,
          'data-parallax-factor must be a number and greater than 0 for: %s',
          element);

    },
    update(entry) {
      const fxElement = this;
      dev().assert(fxElement.adjustedViewportHeight_);
      // outside viewport
      if (!entry.positionRect ||
          entry.positionRect.top > fxElement.adjustedViewportHeight_) {
        return;
      }

      // User provided factor is 1-based for easier understanding.
      // Also negating number since we are using tranformY so negative = upward,
      // positive = downward.
      const adjustedFactor = -(parseFloat(fxElement.factor_) - 1);
      const top = entry.positionRect.top;
      // Offset is how much extra to move the element which is position within
      // viewport times adjusted factor.
      const offset = (fxElement.adjustedViewportHeight_ - top) * adjustedFactor;
      fxElement.offset_ = offset;

      if (!fxElement.mutateScheduled_) {
        fxElement.mutateScheduled_ = true;
        fxElement.resources_.mutateElement(fxElement.element_, function() {
          fxElement.mutateScheduled_ = false;
          // Translate the element offset pixels.
          setStyles(fxElement.element_,
              {transform: `translateY(${fxElement.offset_.toFixed(0)}px)`}
          );
        });
      }
    },
  },
};
