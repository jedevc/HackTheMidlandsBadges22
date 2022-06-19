window.onload = () => {
  console.log("loaded")
  createBadgeModule().then(Module => {
    console.log('WebAssembly loaded!');
    let lua = new Module.Lua();
    lua.run("print(hsl(45, 58))")
    lua.run("while true do end")
    lua.run("print(1,2)")
  });
}