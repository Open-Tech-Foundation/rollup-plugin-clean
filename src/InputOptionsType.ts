type TargeType = string | string[];

interface IinputObject {
  start: TargeType;
  end: TargeType;
}

type InputOptionsType = TargeType | IinputObject;

export default InputOptionsType;
