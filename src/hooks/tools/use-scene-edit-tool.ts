import { useEffect, useState } from 'react';
import { createObjectToolIdleHandler } from './handlers/idle-tool';
import { sceneEditToolHandlers } from './handlers/scene-edit-tool-functions';
import { toolSelector } from '../../store/threed/tool/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/create-store';

function useSceneEditTool(composerUUID?: string) {
  const tool = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
  });
  const dispatch = useDispatch();
  const [currentTool, setCurrentTool] = useState<sceneEditToolHandlers>(
    createObjectToolIdleHandler(dispatch),
  );

  useEffect(() => {
    setCurrentTool(tool.tool.context.handlerCreator(dispatch));
  }, [tool.tool.context.handlerCreator]);
  return currentTool;
}

export default useSceneEditTool;
