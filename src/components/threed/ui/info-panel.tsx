import { useSelector } from 'react-redux';
import { RootState } from '../../../store/create-store';
import { toolSelector } from '../../../store/threed/tool/selectors';

const InfoPanel = () => {
  const toolMode = useSelector((state: RootState) => {
    return toolSelector.getCurrentMode(state);
  });

  return (
    <div className='info-panel'>
      {toolMode === 'move' && (
        // 移動ツール用の情報表示
        <div>move tool</div>
      )}
      {toolMode === 'pose' && (
        // ポーズツール用の情報表示
        <div> pose tool </div>
      )}
    </div>
  );
};

export default InfoPanel;
