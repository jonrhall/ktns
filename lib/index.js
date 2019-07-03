import initD3 from './d3-wrapper';

(() => {
  'use strict';

  // Initialize ktns
  function init() {
    let resources;

    // Set an interval to wait for Kittens Game to be initialized first before loading ktns.
    const initInterval = setInterval(() => {
      try {
        // If the game is loaded, this assignment will succeed.
        resources = game.resPool.resourceMap;
      } catch(e) {
        // Not ready yet
        return;
      }

      // Clear this interval, since it won't be needed now that we've gotten past the try/catch.
      clearInterval(initInterval);

      // There's something about invoking D3 immediately after finding the resources object,
      // sometimes the resource map isn't fully built yet and this timeout is enough to get around
      // those load issues. Imperfect, but it works.
      setTimeout(() => {
        initD3(resources);
        console.log('KTNS loaded');
      }, 300);
    }, 100);
  }

  init();
})();