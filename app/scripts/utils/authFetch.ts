export const authFetch = <T = {}>(url: string, json: boolean = true): Promise<T> =>
  new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, token => {
      if (token) {
        fetch(url, {
          headers: { Authorization: "Bearer " + token },
        })
          .then(res => (json ? res.json() : res))
          .then(resolve)
          .catch(reject)
      } else {
        reject(new Error("Failed to sign in"))
      }
    })
  })
