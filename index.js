window.onload = () => {
  console.log("loaded")
  createBadgeModule().then(Module => {
    console.log('WebAssembly loaded!');
    var run_lua = Module.cwrap('run_lua', 'number', ['string']);
    run_lua("print(title)")
    run_lua("print(content)")
    run_lua("print(image)")
  });
}