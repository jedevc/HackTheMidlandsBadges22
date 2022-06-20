window.onload = () => {
  console.log("loaded")
  createBadgeModule().then(Module => {
    console.log('WebAssembly loaded!');
    let lua = new Module.Lua();
    console.log(lua.run("print(hsl(45, 58))"))
    console.log(lua.run("while true do end"))
    console.log(lua.run("print(1,2)"))
  });
}