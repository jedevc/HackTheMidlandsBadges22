#include "colors.hpp"

#include <algorithm>
#include <cmath>

extern "C" {
#include "lua.h"
#include <lauxlib.h>
#include <lualib.h>
}

int rgb(lua_State *L) {
  int n = lua_gettop(L);
  if (n != 3) {
    luaL_error(L, "rgb expected 3 arguments");
    return 0;
  }

  int value = 0;
  if (lua_isinteger(L, 1) && lua_isinteger(L, 2) && lua_isinteger(L, 3)) {
    value |= (lua_tointeger(L, 1) & 0xff) << 16; // r
    value |= (lua_tointeger(L, 2) & 0xff) << 8;  // g
    value |= (lua_tointeger(L, 3) & 0xff);       // b
  } else {
    value |= ((int)round(255 * lua_tonumber(L, 1)) & 0xff) << 16; // r
    value |= ((int)round(255 * lua_tonumber(L, 2)) & 0xff) << 8;  // g
    value |= ((int)round(255 * lua_tonumber(L, 3)) & 0xff);       // b
  }
  lua_pushinteger(L, value);
  return 1;
}

int hsl(lua_State *L) {
  int n = lua_gettop(L);
  if (n != 3) {
    luaL_error(L, "hsl expected 3 arguments");
    return 0;
  }

  double h, s, l;
  if (lua_isinteger(L, 1)) {
    h = lua_tointeger(L, 1) % 360;
  } else {
    h = fmod(lua_tonumber(L, 1), 1) * 360;
  }
  if (lua_isinteger(L, 2)) {
    s = lua_tointeger(L, 2) / 100.0;
  } else {
    s = lua_tonumber(L, 2);
  }
  s = std::clamp(s, 0.0, 1.0);

  if (lua_isinteger(L, 3)) {
    l = lua_tointeger(L, 3) / 100.0;
  } else {
    l = lua_tonumber(L, 3);
  }
  l = std::clamp(l, 0.0, 1.0);

  // https://css-tricks.com/converting-color-spaces-in-javascript/#aa-hsl-to-rgb
  double c = (1 - fabs(2 * l - 1)) * s;
  double x = c * (1 - fabs(fmod((h / 60), 2) - 1));
  double m = l - c / 2;
  double r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  int value = 0;
  value |= ((int)round(255 * (r + m)) & 0xff) << 16; // r
  value |= ((int)round(255 * (g + m)) & 0xff) << 8;  // g
  value |= ((int)round(255 * (b + m)) & 0xff);       // b

  lua_pushinteger(L, value);
  return 1;
}
