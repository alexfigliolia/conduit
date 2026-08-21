import type { ILocation } from "@ui/API";
import { createUseState } from "@figliolia/react-galena";
import { State } from "@figliolia/galena";

export const Location = new State<ILocation | undefined>(undefined);

export const useLocation = createUseState(Location);
