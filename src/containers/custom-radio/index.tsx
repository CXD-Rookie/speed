import type * as React from "react";
import type { RmInputProps } from "./radio";
import InternalInput from "./radio";
// import Search from "./search";
// import Group from "./group";
// import Password from "./password";
// import Textarea from "./text-area";

// export type { RmInputProps } from "./rm-input";
// export type { SearchProps } from "./search";
// export type { GroupProps } from "./group";
// export type { PasswordProps } from "./password";
// export type { TextAreaProps } from "./text-area";

type CompoundedComponent = React.ForwardRefExoticComponent<RmInputProps> & {
  // Search: typeof Search;
  // Group: typeof Group;
  // Password: typeof Password;
  // Textarea: typeof Textarea;
};

const CustomRadio = InternalInput as CompoundedComponent;

// RmInput.Search = Search;
// RmInput.Group = Group;
// RmInput.Password = Password;
// RmInput.Textarea = Textarea;

export default CustomRadio;
