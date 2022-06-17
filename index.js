window.onload = () => {
  console.log("loaded")
  createBadgeModule().then(Module => {
    console.log('WebAssembly loaded!');
    var run_lua = Module.cwrap('run_lua', 'number', ['string']);
    run_lua("foo = foo + 1\nprint(foo)")
    run_lua("foo = foo + 1\nprint(foo)")
    run_lua("foo = foo + 1\nprint(foo)")
    run_lua("foo = foo + 1\nprint(foo)")
    run_lua("while true do\nend")
  });
}