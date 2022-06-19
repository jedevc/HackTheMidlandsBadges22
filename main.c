#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#include "lua.h"
#include <lauxlib.h>
#include <lualib.h>

#define BUDGET 100000
#define BUDGET_STEPS (1000)

#define MIN(a,b) (((a)<(b))?(a):(b))
#define MAX(a,b) (((a)>(b))?(a):(b))

lua_State *lua = NULL;
int cost = 0;

// TODO:
//   - parallelize using webworkers?
//   - actually render as a badge!
//   - snazzy transitions and animations

void hook(lua_State *L, lua_Debug *ar) {
  cost += BUDGET_STEPS;
  if (cost > BUDGET) {
    exit(0xf1);
  }
}

static int rgb(lua_State *L) {
  int n = lua_gettop(L);
  if (n != 3) {
    lua_pushstring(L, "rgb expected 3 arguments");
    lua_error(L);
    return 0;
  }
  
  int value = 0;
  if (lua_isinteger(L, 1) && lua_isinteger(L, 2) && lua_isinteger(L, 3)) {
    value += (lua_tointeger(L, 1) & 0xff) << 16; // r
    value += (lua_tointeger(L, 2) & 0xff) << 8;  // g
    value += (lua_tointeger(L, 3) & 0xff);       // b
  } else {
    value += ((int)round(255 * lua_tonumber(L, 1)) & 0xff) << 16; // r
    value += ((int)round(255 * lua_tonumber(L, 2)) & 0xff) << 8;  // g
    value += ((int)round(255 * lua_tonumber(L, 3)) & 0xff);       // b
  }
  lua_pushinteger(L, value);
  return 1;
}

static int hsl(lua_State *L) {
  int n = lua_gettop(L);
  if (n != 3) {
    lua_pushstring(L, "hsl expected 3 arguments");
    lua_error(L);
    return 0;
  }
  
  double h, s, l;
  if (lua_isinteger(L, 1)) {
    h = (lua_tointeger(L, 1) % 360);
  } else {
    h = fmod(lua_tonumber(L, 1), 1) * 360;
  }
  if (lua_isinteger(L, 2)) {
    s = lua_tointeger(L, 2) / 100.0;
  } else {
    s = lua_tonumber(L, 2);
  }
  if (lua_isinteger(L, 2)) {
    l = lua_tointeger(L, 3) / 100.0;
  } else {
    l = lua_tonumber(L, 3);
  }
  
  // https://css-tricks.com/converting-color-spaces-in-javascript/#aa-hsl-to-rgb
  double c = (1 - fabs(2 * l - 1)) * s;
  double x = c * (1 - fabs(fmod((h / 60), 2) - 1));
  double m = l - c/2;
  double r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;  
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  int value = 0;
  value += ((int)round(255 * (r + m)) & 0xff) << 16; // r
  value += ((int)round(255 * (g + m)) & 0xff) << 8;  // g
  value += ((int)round(255 * (b + m)) & 0xff);       // b

  lua_pushinteger(L, value);
  return 1;
}

int run_lua(const char *script) {
  cost = 0;
  if (lua == NULL) {
    lua = luaL_newstate();

    lua_pushstring(lua, "HackTheMidlands v7");
    lua_setglobal(lua, "title");

    lua_pushstring(lua, "Lorem Ipsum");
    lua_setglobal(lua, "content");

    lua_pushinteger(lua, 64);
    lua_setglobal(lua, "width");

    lua_pushinteger(lua, 36);
    lua_setglobal(lua, "height");

    lua_pushcfunction(lua, rgb);
    lua_setglobal(lua, "rgb");
    lua_pushcfunction(lua, hsl);
    lua_setglobal(lua, "hsl");

    lua_newtable(lua);
    for (int i = 0; i < 64; i++) {
      lua_pushinteger(lua, i);
      lua_newtable(lua);
      for (int j = 0; i < 36; i++) {
        lua_pushinteger(lua, j);
        lua_pushinteger(lua, 0);
        lua_settable(lua, -3);
      }
      lua_settable(lua, -3);
    }
    lua_setglobal(lua, "image");

    luaL_openlibs(lua);
    lua_sethook(lua, hook, LUA_MASKCOUNT, BUDGET_STEPS);
  }

  int res = luaL_dostring(lua, script);

  size_t len = 0;
  const char *value = lua_tolstring(lua, lua_gettop(lua), &len);

  // printf("%s\n", value);

  // lua_close(lua);

  return 0;
}
