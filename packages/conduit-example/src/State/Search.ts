import { createUseState } from "@figliolia/react-galena";
import { State } from "@figliolia/galena";

export const SearchQuery = new State("");

export const useSearchQuery = createUseState(SearchQuery);
