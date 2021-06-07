export type TargeType = string | string[];

export interface IinputObject {
  start: TargeType;
  end: TargeType;
}

export type InputOptionsType = TargeType | IinputObject;
