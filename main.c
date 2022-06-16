#include <stdio.h>
#include "lua.h"
#include <lauxlib.h>
#include <lualib.h>

#include <stdlib.h>

// TODO:
//   - add global variables for title, content and canvas
//   - preserve state from run-to-run (make sure to reset the counter)
//   - parallelize using webworkers?
//   - add to an html file
//   - actually render as a badge!
//   - snazzy transitions and animations

void hook (lua_State *L, lua_Debug *ar) {
	exit(0xf1);
}

int run_lua(const char* script) {
	lua_State* lua = luaL_newstate();
	lua_pushnumber(lua, 100);
	lua_setglobal(lua, "foo");
	luaL_openlibs(lua);
	
	lua_sethook(lua, hook, LUA_MASKCOUNT, 1000000);

	int res = luaL_dostring(lua, script);

	size_t len = 0;
	const char* value = lua_tolstring(lua, lua_gettop(lua), &len);

	printf("%s\n", value);

	lua_close(lua);

	return 0;
}
