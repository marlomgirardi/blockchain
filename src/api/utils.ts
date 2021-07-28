import fetch from "node-fetch";
import Blockchain from "../core/Blockchain";

export function post(url: string, body: object) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

type Actions = "node" | "block/receive" | "transaction";
export function broadcastToNodes<T = object>(nodes: Blockchain["networkNodes"], action: Actions, data: T) {
  // This is not scalable but this is just a test, so not a problem.
  const broadcast = nodes.map((nodeUrl) => {
    return post(`${nodeUrl}/${action}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
  });

  return Promise.all(broadcast);
}
