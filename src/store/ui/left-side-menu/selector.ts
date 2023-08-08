import { RootState } from '../../create-store';
import { displayTypes, sideMenuSlice, sideMenuState } from './slice';

export const sideMenuStateSelector = {
  getIsOpen: (state: RootState): boolean => {
    return state.sideMenu.isOpen;
  },
  getDisplayTypes: (state: RootState): displayTypes => {
    return state.sideMenu.displayType;
  },
};
