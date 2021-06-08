export type TargetStringType = string | string[];

export interface ITarget {
  start: TargetStringType;
  end: TargetStringType;
}

export type TargetType = TargetStringType | ITarget;
