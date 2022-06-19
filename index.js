window.onload = () => {
  console.log("loaded")
  createBadgeModule().then(Module => {
    console.log('WebAssembly loaded!');
    var run_lua = Module.cwrap('run_lua', 'number', ['string']);
    run_lua("print(hsl(119, 45, 58))")
    run_lua("print(rgb(101, 196, 100))")
  });
}