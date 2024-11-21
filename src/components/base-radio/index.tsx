import type * as React from "react";
import type { CustomRadioProps } from "./radio";
import type { GroupProps } from "./group";

import InternalRadio from "./radio";
import Group from "./group";

export type { CustomRadioProps } from "./radio";
export type { GroupProps } from "./group";

type CompoundedComponent = React.ForwardRefExoticComponent<CustomRadioProps> & {
  Group: typeof Group;
};

const BaseRadio = InternalRadio as CompoundedComponent;

BaseRadio.Group = Group;

export default BaseRadio;
