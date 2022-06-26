#include <algorithm>
#include <cassert>
#include <cmath>
#include <map>
#include <memory>
#include <string>
#include <vector>

extern "C" {
#include "lua.h"
#include <lauxlib.h>
#include <lualib.h>
}

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
using namespace emscripten;
#endif

#define BUDGET 100000
#define BUDGET_STEPS 1000

using std::map;
using std::string;
using std::vector;

static int rgb(lua_State *L) {
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

static int hsl(lua_State *L) {
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

class Image {
public:
  Image() {}
  Image(unsigned int width_, unsigned int height_, vector<unsigned int> data_)
      : width(width_), height(height_), data(data_) {}

  unsigned int width;
  unsigned int height;
  unsigned int pixel(int x, int y) { return data[x * height + y]; }

private:
  vector<unsigned int> data;
};

class LuaResult {
public:
  string err;

  LuaResult() : err("") {}
  LuaResult(string err_) : err(err_) {}

  void push_text(string key, string value) { texts.emplace(key, value); }
  string pop_text(string key) {
    string result = texts.at(key);
    texts.erase(key);
    return result;
  }
  void push_image(string key, Image value) { images.emplace(key, value); }
  Image pop_image(string key) {
    Image result = images.at(key);
    texts.erase(key);
    return result;
  }

private:
  map<string, string> texts;
  map<string, Image> images;
};

class Lua {
public:
  Lua(string code) {
    state = luaL_newstate();

    lua_pushlightuserdata(state, (void *)state);
    lua_pushlightuserdata(state, (void *)this);
    lua_settable(state, LUA_REGISTRYINDEX);

    // HACK!!! avoid conversions
    lua_pushlightuserdata(state, (void *)((long long)state + 1));
    luaL_loadstring(state, code.c_str());
    lua_settable(state, LUA_REGISTRYINDEX);

    lua_pushcfunction(state, rgb);
    lua_setglobal(state, "rgb");
    lua_pushcfunction(state, hsl);
    lua_setglobal(state, "hsl");

    luaL_openlibs(state);
    lua_sethook(state, hook, LUA_MASKCOUNT, BUDGET_STEPS);
  }

  ~Lua() {
    lua_close(state);
    state = NULL;
  }

  void export_text(string name) {
    texts.push_back(name);

    lua_pushstring(state, "");
    lua_setglobal(state, name.c_str());
  }

  void export_image(string name, unsigned int width, unsigned int height) {
    images.emplace(name, Image(width, height, vector<unsigned int>()));

    lua_newtable(state);
    for (int i = 0; i < width; i++) {
      lua_pushinteger(state, i + 1);
      lua_newtable(state);
      for (int j = 0; j < height; j++) {
        lua_pushinteger(state, j + 1);
        lua_pushinteger(state, 0);
        lua_settable(state, -3);
      }
      lua_settable(state, -3);
    }
    lua_setglobal(state, name.c_str());

    lua_pushinteger(state, width);
    lua_setglobal(state, (name + "_width").c_str());

    lua_pushinteger(state, height);
    lua_setglobal(state, (name + "_height").c_str());
  }

  LuaResult run() {
    lua_pushlightuserdata(state, (void *)((long long)state + 1));
    lua_gettable(state, LUA_REGISTRYINDEX);

    cost = 0;

    int code = lua_pcall(state, 0, LUA_MULTRET, 0);
    if (code != 0) {
      size_t len = 0;
      const char *value = lua_tolstring(state, lua_gettop(state), &len);
      return LuaResult(value);
    }

    LuaResult result = get_result();
    lua_settop(state, 0);
    lua_gc(state, LUA_GCCOLLECT, 0);
    return result;
  }

private:
  static void hook(lua_State *L, lua_Debug *ar) {
    lua_pushlightuserdata(L, (void *)L);
    lua_gettable(L, LUA_REGISTRYINDEX);
    Lua *lua = (Lua *)lua_touserdata(L, -1);
    assert(lua->state == L);

    lua->cost += BUDGET_STEPS;
    if (lua->cost > BUDGET) {
      luaL_error(L, "too many instructions");
    }
  }

  LuaResult get_result() {
    LuaResult result;

    for (auto name : texts) {
      lua_getglobal(state, name.c_str());
      result.push_text(name, lua_tostring(state, -1));
      lua_pop(state, 1);
    }

    for (auto &&[name, img] : images) {
      vector<unsigned int> data;
      data.reserve(img.width * img.height);
      lua_getglobal(state, name.c_str());
      for (int i = 0; i < img.width; i++) {
        lua_pushinteger(state, i + 1);
        lua_gettable(state, -2);
        for (int j = 0; j < img.height; j++) {
          lua_pushinteger(state, j + 1);
          lua_gettable(state, -2);
          data.push_back(lua_tointeger(state, -1));
          lua_pop(state, 1);
        }
        lua_pop(state, 1);
      }
      lua_pop(state, 1);

      result.push_image(name, Image(img.width, img.height, data));
    }

    return result;
  }

  lua_State *state = NULL;
  int cost = 0;

  vector<string> texts;
  map<string, Image> images;
};

#ifdef __EMSCRIPTEN__
EMSCRIPTEN_BINDINGS(my_module) {
  register_vector<unsigned int>("VectorImage");
  register_map<string, string>("StringStringMap");
  register_map<string, Image>("StringImageMap");
  class_<Image>("Image")
      .property("width", &Image::width)
      .property("height", &Image::height)
      .function("pixel", &Image::pixel);
  class_<LuaResult>("LuaResult")
      .property("err", &LuaResult::err)
      .function("pop_text", &LuaResult::pop_text)
      .function("pop_image", &LuaResult::pop_image);
  class_<Lua>("Lua")
      .constructor<string>()
      .function("export_text", &Lua::export_text)
      .function("export_image", &Lua::export_image)
      .function("run", &Lua::run);
}
#endif
