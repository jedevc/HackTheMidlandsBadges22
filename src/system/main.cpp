#include <cassert>
#include <map>
#include <memory>
#include <string>
#include <vector>

extern "C" {
#include "lua.h"
#include <lauxlib.h>
#include <lualib.h>
}

#include "funcs/colors.hpp"

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
using namespace emscripten;
#endif

#define BUDGET 100000
#define BUDGET_STEPS 1000

using std::map;
using std::string;
using std::vector;

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

static int traceback(lua_State *L) {
    lua_getglobal(L, "debug");
    lua_getfield(L, -1, "traceback");
    lua_pushvalue(L, 1);
    lua_pushinteger(L, 2);
    lua_call(L, 2, 1);
    return 1;
}

class Lua {
public:
  Lua() {
    state = luaL_newstate();

    lua_pushlightuserdata(state, (void *)state);
    lua_pushlightuserdata(state, (void *)this);
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

  LuaResult parse(string program) {
    LuaResult result;

    lua_pushlightuserdata(state, (void *)((long long)state + 1));
    int code = luaL_loadstring(state, program.c_str());
    if (code != 0) {
      const char *value = lua_tostring(state, -1);
      result = LuaResult(value);
    }
    lua_settable(state, LUA_REGISTRYINDEX);

    lua_settop(state, 0);
    lua_gc(state, LUA_GCCOLLECT, 0);
    return result;
  }

  LuaResult run() {
    lua_pushcfunction(state, traceback);

    lua_pushlightuserdata(state, (void *)((long long)state + 1));
    lua_gettable(state, LUA_REGISTRYINDEX);

    cost = 0;
    
    LuaResult result;
    int code = lua_pcall(state, 0, LUA_MULTRET, -2);
    if (code != 0) {
      const char *value = lua_tostring(state, -1);
      result = LuaResult(value);
    } else {
      result = get_result();
    }

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
      .constructor<>()
      .function("export_text", &Lua::export_text)
      .function("export_image", &Lua::export_image)
      .function("parse", &Lua::parse)
      .function("run", &Lua::run);
}
#endif
