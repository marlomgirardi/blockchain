import Block from "./Block";

export type Nonce = number;
export type Hash = string;
export type BlockData = Pick<Block, "transactions" | "index">;
