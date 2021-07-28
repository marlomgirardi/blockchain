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
export function get<Response = object>(url: string): Promise<Response> {
  return fetch(url).then((response) => response.json());
}

type BroadcastActions = "node" | "block/receive" | "transaction";
export function broadcastToNodes<T = object>(nodes: Blockchain["networkNodes"], action: BroadcastActions, data: T) {
  // This is not scalable but this is just a test, so not a problem.
  return Promise.all(nodes.map((nodeUrl) => post<T>(`${nodeUrl}/${action}`, data)));
}

type GetActions = "blockchain";
export function getFromNodes<Response = object>(
  nodes: Blockchain["networkNodes"],
  action: GetActions
): Promise<Response[]> {
  // This is not scalable but this is just a test, so not a problem.
  return Promise.all(nodes.map((nodeUrl) => get<Response>(`${nodeUrl}/${action}`)));
}