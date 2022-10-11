export function api({ path, method = "GET", body = null, token = null }) {
  let headers = {};
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["X-Token"] = token;
  }
  const req = new Request(process.env.PLATFORM_SERVER_URL + "/" + path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: new Headers(headers),
  });
  return fetch(req)
    .then(
      (res) =>
        new Promise((resolve, reject) =>
          res
            .json()
            .then((body) => resolve({ res, body }))
            .catch(reject)
        )
    )
    .then(({ res, body }) => {
      if (!res.ok) {
        if (body.detail) {
          throw new Error(body.detail);
        }
        throw new Error(res.statusText);
      }
      return body;
    });
}
