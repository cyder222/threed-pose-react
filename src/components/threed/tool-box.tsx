import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toolSlice from '../../store/threed/tool/slice';
import { toolSelector } from '../../store/threed/tool/selectors';
import { RootState } from '../../store/create-store';

const Toolbox = () => {
  const dispatch = useDispatch();
  const toolState = useSelector((state: RootState) => {
    return toolSelector.getCurrent(state);
  });

  return (
    <div className='toolbox'>
      <button
        className={`tool ${toolState.toolMode === 'move' ? 'active' : ''}`}
        onClick={() => dispatch(toolSlice.actions.setToolMode('move'))}>
        移動ツール
      </button>
      <button
        className={`tool ${toolState.toolMode === 'pose' ? 'active' : ''}`}
        onClick={() => dispatch(toolSlice.actions.setToolMode('pose'))}>
        ポーズツール
      </button>
      {/* 他のツールボタン */}
    </div>
  );
};

export default Toolbox;
