import fetch from "node-fetch";
import Blockchain from "../core/Blockchain";

export function post<T = object>(url: string, body: T) {
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
  return Promise.all(nodes.map((nodeUrl) => post<T>(`${nodeUrl}/${action}`, data)));
}
