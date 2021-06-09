"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hex3ToHex = exports.hslToHex = exports.rgbToHex = exports.hex3Regex = exports.hexRegex = exports.hslRegex = exports.rgbRegex = void 0;
exports.rgbRegex = /rgb\((\d+),\s*([\d.]+),\s*([\d.]+)\)/i;
exports.hslRegex = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/i;
exports.hexRegex = /#([0-9A-F]{6})/i;
exports.hex3Regex = /#([0-9A-F])([0-9A-F])([0-9A-F])/i;
var rgbToHex = function (red, green, blue) {
    var hexColorCode = [red, green, blue]
        .map(function (x) {
        x = parseInt(x).toString(16);
        return x.length === 1 ? "0" + x : x;
    })
        .join('');
    return hexColorCode;
};
exports.rgbToHex = rgbToHex;
var hslToHex = function (hue, saturation, luminosity) {
    hue /= 360;
    saturation /= 100;
    luminosity /= 100;
    var red, green, blue;
    if (saturation === 0) {
        red = green = blue = luminosity;
    }
    else {
        var hue2rgb = function (p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var q = luminosity < 0.5
            ? luminosity * (1 + saturation)
            : luminosity + saturation - luminosity * saturation;
        var p = 2 * luminosity - q;
        red = hue2rgb(p, q, hue + 1 / 3);
        green = hue2rgb(p, q, hue);
        blue = hue2rgb(p, q, hue - 1 / 3);
    }
    return [red, green, blue]
        .map(function (x) {
        var hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    })
        .join('');
};
exports.hslToHex = hslToHex;
var hex3ToHex = function (red, green, blue) {
    var hexColorCode = [red, green, blue].map(function (x) { return "" + x + x; }).join('');
    return hexColorCode;
};
exports.hex3ToHex = hex3ToHex;
//# sourceMappingURL=color-conversion.js.map