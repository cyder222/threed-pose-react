import { SetStateAction, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface ResizableSidebarProps {
  children: ReactNode;
  onWidthChange: (newWidth: number) => void;
}

const ResizableSidebar = ({ children, onWidthChange }: ResizableSidebarProps) => {
  const [width, setWidth] = useState(250);

  const handleMouseDown = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: { clientX: SetStateAction<number> }) => {
    console.log(e.clientX);
    setWidth(e.clientX);
    onWidthChange(width);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <Box
      borderRight='1px solid #ddd'
      display={'flex'}
      width={`${width}px`}
      height='100vh'
      position={'relative'}>
      {children}
      <Box
        as='div'
        bg='#ddd'
        width='5px'
        height='100%'
        right='0'
        top='0'
        position='absolute'
        onMouseDown={handleMouseDown}
        style={{ cursor: 'ew-resize' }}
      />
    </Box>
  );
};

export default ResizableSidebar;
