export function api({ path, method = "GET", body = null, token = null }) {
  if (method !== "GET") {
    throw new Error("Fake API only supports GET requests");
  }

  let components = path.replace(/(^\/+|\/+$)/, "").split("/");
  if (components[0] === "badge") {
    return {
      id: components[1],
      claimed: true,
    };
  }
  if (components[0] === "store" && components[2] === "code") {
    const url =
      "https://htm22-badge-data.netlify.app/" + components[1] + ".lua";
    return fetch(url).then((res) => {
      if (!res.ok) {
        let err = new Error(res.statusText);
        err.httpCode = res.status;
        err.httpMessage = res.statusText;
        throw err;
      }
      return res.text().then((text) => ({ key: components[1], value: text }));
    });
  }

  throw new Error("Fake API does not support " + path);
}
