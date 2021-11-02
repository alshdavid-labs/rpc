import { ActionRelease } from ".";
import { ActionExec } from "./action-exec";
import { ActionSet } from "./action-set";
import { ActionValue } from "./action-value";

export type Action = (
  ActionValue |
  ActionSet |
  ActionExec |
  ActionRelease
)
