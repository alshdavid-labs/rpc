import { ResultExec } from "./result-exec";
import { ResultRelease } from "./result-release";
import { ResultSet } from "./result-set";
import { ResultValue } from "./result-value";

export type Result = (
  ResultValue |
  ResultSet |
  ResultExec |
  ResultRelease
)
