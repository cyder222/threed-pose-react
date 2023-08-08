import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/create-store';
import { sideMenuStateSelector } from '../../store/ui/left-side-menu/selector';
import { CameraSetting } from '../../components/ui/sidebar/camera-setting';
import { SdSideMenu } from '../../components/ui/sidebar/sd-generate';

export function useSidemenuComponent() {
  const displayState = useSelector((state: RootState) => {
    return sideMenuStateSelector.getDisplayTypes(state);
  });

  const sidebarComponent = useMemo(() => {
    return (props: any) => {
      switch (displayState) {
        case 'cameraSettingPanel':
          return <CameraSetting {...props} />;
        case 'generationPanel':
          return <SdSideMenu {...props} />;
        // case 'infomationPanel':
        //   return <InformationPanel {...props} />;
        default:
          return null;
      }
    };
  }, [displayState]);

  return sidebarComponent;
}
