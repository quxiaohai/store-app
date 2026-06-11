export default {
  init(node) {
    let x = 0;
    let y = 0;
    let startTime = 0;
    node.addEventListener('touchstart', function(e) {
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
      startTime = Date.now();
    }, {passive: false});

    node.addEventListener('touchmove', function(e) {

      if (startTime === 0) {
        return;
      }

      const moveX = e.touches[0].pageX;
      const moveY = e.touches[0].pageY;

      if (Math.abs(moveX - x) >= 10 || Math.abs(moveY - y) >= 10) {
        startTime = 0;
      }
    }, {passive: false});

    node.addEventListener('touchend', function(e) {
      const endTime = Date.now();
      const time = endTime - startTime;
      if(time > 300 && startTime > 0) {
        e.target.dispatchEvent(new CustomEvent('longtap', {
          'detail': e
        }));
      } else if (time <= 300 && startTime > 0){
        e.target.dispatchEvent(new CustomEvent('tap', {
          'detail': e
        }));
      }

      startTime = 0;
      x = 0;
      y = 0;
    }, {passive: false});
  }
}
