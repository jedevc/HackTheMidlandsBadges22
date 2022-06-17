#include <stdio.h>
#include <stdlib.h>

#include "lua.h"
#include <lauxlib.h>
#include <lualib.h>

#define BUDGET 100000
#define BUDGET_STEPS (1000)

lua_State* lua = NULL;
int cost = 0;

// TODO:
//   - add global variables for title, content and canvas
//   - parallelize using webworkers?
//   - actually render as a badge!
//   - snazzy transitions and animations

void hook (lua_State *L, lua_Debug *ar) {
	cost += BUDGET_STEPS;
	if (cost > BUDGET) {
		exit(0xf1);
	}
}

int run_lua(const char* script) {
	cost = 0;
	if (lua == NULL) {
		lua = luaL_newstate();
		lua_pushinteger(lua, 100);
		lua_setglobal(lua, "foo");
		luaL_openlibs(lua);
		lua_sethook(lua, hook, LUA_MASKCOUNT, BUDGET_STEPS);
	}
	
	int res = luaL_dostring(lua, script);

	size_t len = 0;
	const char* value = lua_tolstring(lua, lua_gettop(lua), &len);

	printf("%s\n", value);

	// lua_close(lua);

	return 0;
}
