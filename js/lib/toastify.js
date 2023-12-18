/*!
 * Toastify js 1.11.2
 * https://github.com/apvarun/toastify-js
 * @license MIT licensed
 *
 * Copyright (C) 2018 Varun A P
 * 
 * Edited By Ahmed F. Shark
 * Removed non-used code
 */
(function(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Toastify = factory();
  }
})(this, function(global) {
  var Toastify = function(options) {
    return new Toastify.lib.init(options);
  };

  var version = "1.11.2";

  Toastify.defaults = {
    text: "Toastify is awesome!",
    duration: 3000,
    backgroundColor: '',
    className: "",
    escapeMarkup: true,
    style: { background: '' }
  };

  Toastify.lib = Toastify.prototype = {
    toastify: version,
    constructor: Toastify,

    init: function(options) {
      if (!options) {
        options = {};
      }

      this.options = {};
      this.toastElement = null;

      this.options.text = options.text || Toastify.defaults.text;
      this.options.duration = options.duration === 0 ? 0 : options.duration || Toastify.defaults.duration;
      this.options.backgroundColor = options.backgroundColor || Toastify.defaults.backgroundColor;
      this.options.className = options.className || Toastify.defaults.className;
      this.options.escapeMarkup = options.escapeMarkup !== undefined ? options.escapeMarkup : Toastify.defaults.escapeMarkup;
      this.options.style = options.style || Toastify.defaults.style;
      if (options.backgroundColor) {
        this.options.style.background = options.backgroundColor;
      }

      return this;
    },

    buildToast: function() {
      if (!this.options) {
        throw "Toastify is not initialized";
      }

      var divElement = document.createElement("div");
      divElement.className = "toastify on " + this.options.className;
      divElement.className += " toastify-right"; // Default position

      divElement.className += " " + "toastify-top"; // Default gravity

      for (var property in this.options.style) {
        divElement.style[property] = this.options.style[property];
      }

      if (this.options.escapeMarkup) {
        divElement.textContent = this.options.text;
      } else {
        divElement.innerHTML = this.options.text;
      }

      return divElement;
    },

    showToast: function() {
      this.toastElement = this.buildToast();

      var rootElement = document.body;

      if (!rootElement) {
        throw "Root element is not defined";
      }

      rootElement.insertBefore(this.toastElement, rootElement.lastChild);

      Toastify.reposition();

      if (this.options.duration > 0) {
        this.toastElement.timeOutValue = window.setTimeout(
          function() {
            this.removeElement(this.toastElement);
          }.bind(this),
          this.options.duration
        );
      }

      return this;
    },

    removeElement: function(toastElement) {
      toastElement.className = toastElement.className.replace(" on", "");

      window.setTimeout(
        function() {
          if (toastElement.parentNode) {
            toastElement.parentNode.removeChild(toastElement);
          }

          this.options.callback.call(toastElement);
          Toastify.reposition();
        }.bind(this),
        400
      );
    },
  };

  Toastify.reposition = function() {
    var offsetSize = { top: 15, bottom: 15 };
    var allToasts = document.getElementsByClassName("toastify");
    var classUsed;

    for (var i = 0; i < allToasts.length; i++) {
      if (containsClass(allToasts[i], "toastify-top") === true) {
        classUsed = "toastify-top";
      } else {
        classUsed = "toastify-bottom";
      }

      var height = allToasts[i].offsetHeight;
      classUsed = classUsed.substr(9, classUsed.length - 1);
      var offset = 15;

      allToasts[i].style[classUsed] = offsetSize[classUsed] + "px";

      offsetSize[classUsed] += height + offset;
    }

    return this;
  };

  function containsClass(elem, yourClass) {
    if (!elem || typeof yourClass !== "string") {
      return false;
    } else if (
      elem.className &&
      elem.className
        .trim()
        .split(/\s+/gi)
        .indexOf(yourClass) > -1
    ) {
      return true;
    } else {
      return false;
    }
  }

  Toastify.lib.init.prototype = Toastify.lib;

  return Toastify;
});
