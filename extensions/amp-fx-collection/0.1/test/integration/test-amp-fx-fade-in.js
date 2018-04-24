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

const config = describe.configure().ifNewChrome();
config.run('amp-position-observer', function() {
  this.timeout(100000);

  const css = `
    .spacer {
      height: 100vh;
      width: 100%;
      background-color: red;
    }

    #animTarget {
      opacity: 0;
      height: 100px;
      width: 100%;
      background-color: green;
    }
  `;

  const extensions = ['amp-fx-collection'];

  const scrollboundBody = `
    <div class="spacer"></div>
    <div id="animTarget"
      amp-fx="fade-in"
      data-margin-start='0%'>
    </div>
    <div class="spacer"></div>
  `;

  describes.integration("amp-fx='fade-in'", {
    body: scrollboundBody,
    css,
    extensions,
  }, env => {

    let win;
    beforeEach(() => {
      win = env.win;
    });

    it('runs fade in animation with scroll', () => {
      // Not visible yet, opacity = 0;
      expect(getOpacity(win)).to.equal(0);
      win.scrollTo(0, getViewportHeight(win));
      return Promise.resolve().then(timeout(6000))
        .then(() => {
          expect(getOpacity(win)).to.equal(1);
        });

      // window.setTimeout(() => {
      //   expect(getOpacity(win)).to.equal(1);
      // }, 6000);
      // return waitForScroll(win, getViewportHeight(win)).then(() => {
      //   expect(win.document.body.scrollTop).to.equal(getViewportHeight(win) * 2);
      // });
      // Not visible yet as animation hasn't started, opacity = 0;
      // expect(getOpacity(win)).to.equal(0);
      // expect(getOpacity(win)).to.equal(1);
    });
  });
});

function getOpacity(win) {
  const animTarget = win.document.querySelector('#animTarget');
  return parseFloat(win.getComputedStyle(animTarget).opacity);
}

function getViewportHeight(win) {
  return win.document.querySelector('.spacer').offsetHeight;
}

function timeout(ms) {
  return () => new Promise(resolve => setTimeout(resolve, ms));
}


function waitForScroll(win, factor) {
  console.log('waitforscroll')
  return poll('wait for scrollTop to equal: ' + factor, () => {
    console.log('hello');
    return win.document.body.scrollTop === factor;
  }, () => {
    console.log('oops')
  }, 10000);
}
