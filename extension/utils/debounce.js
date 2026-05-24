(function initDebounce(global) {
  function debounce(fn, delay) {
    let timer = null;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  global.EliminateShortsDebounce = { debounce };
})(window);
