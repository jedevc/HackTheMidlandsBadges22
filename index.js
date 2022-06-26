"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var program = "\ntitle = \"John Doe\"\ncontent = \"Hello I am John Doe!\"\nk = (k or 0) + 1\nfor i=1,image_width do\n  for j=1,image_height do\n    x = (i + j + k) % 100\n    image[i][j] = hsl(x / 100, 0.7, 0.5)\n  end\nend\n";

var Badge = /*#__PURE__*/function () {
  function Badge(module, program, rootEl, props) {
    _classCallCheck(this, Badge);

    this.lua = new module.Lua(program);
    this.texts = {};
    this.images = {};

    var _iterator = _createForOfIteratorHelper(props),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var prop = _step.value;
        var el = rootEl.getElementById(prop.name);

        if (el === undefined) {
          throw new Error("could not find ".concat(prop.name, " in ").concat(rootEl));
        }

        switch (prop.type) {
          case "text":
            this.texts[prop.name] = el;
            this.lua.export_text(prop.name);
            break;

          case "image":
            var ctx = el.getContext("2d");
            var buffer = ctx.createImageData(el.width, el.height);
            this.images[prop.name] = [el, ctx, buffer];
            this.lua.export_image(prop.name, el.width, el.height);
            break;

          default:
            throw new Error("unknown property type ".concat(prop.type));
        }

        el.classList.add("ready");
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  _createClass(Badge, [{
    key: "step",
    value: function step() {
      var result = this.lua.run();

      if (result.err) {
        throw new Error(result.err);
      }

      for (var _i = 0, _Object$entries = Object.entries(this.texts); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            name = _Object$entries$_i[0],
            el = _Object$entries$_i[1];

        el.innerText = result.pop_text(name);
      }

      for (var _i2 = 0, _Object$entries2 = Object.entries(this.images); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
            _name = _Object$entries2$_i[0],
            _Object$entries2$_i$ = _slicedToArray(_Object$entries2$_i[1], 3),
            _el = _Object$entries2$_i$[0],
            ctx = _Object$entries2$_i$[1],
            buffer = _Object$entries2$_i$[2];

        var img = result.pop_image(_name);

        for (var i = 0; i < img.width; i++) {
          for (var j = 0; j < img.height; j++) {
            var pixel = img.pixel(i, j);
            var idx = 4 * (i + j * img.width);
            buffer.data[idx + 0] = pixel >> 16 & 0xff;
            buffer.data[idx + 1] = pixel >> 8 & 0xff;
            buffer.data[idx + 2] = pixel & 0xff;
            buffer.data[idx + 3] = 255;
          }
        }

        ctx.putImageData(buffer, 0, 0);
        img.delete();
      }

      result.delete();
    }
  }]);

  return Badge;
}();

window.addEventListener("DOMContentLoaded", function () {
  createBadgeModule().then(function (Module) {
    var badge = new Badge(Module, program, document, [{
      type: "text",
      name: "title"
    }, {
      type: "text",
      name: "content"
    }, {
      type: "image",
      name: "image"
    }]);
    var fps = 120;
    var delta = 1000.0 / fps;
    var start, last;
    var lagCount = 0;

    var step = function step(current) {
      if (start === undefined) start = current;
      if (last === undefined) last = current;
      var diff = current - last; // detect and report lag

      if (lagCount !== null) {
        if (diff > delta * 1.2) {
          lagCount++;

          if (lagCount > 100) {
            var fpsActual = (1000 / diff).toFixed(2);
            console.warn("lag detected! fps target is ".concat(fps, " but getting ").concat(fpsActual));
            lagCount = null;
          }
        } else {
          lagCount = 0;
        }
      }

      if (diff > delta) {
        try {
          badge.step();
        } catch (err) {
          console.error(err);
          return;
        }

        last = current;
      }

      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  });
});
