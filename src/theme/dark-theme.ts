import { extendTheme } from '@chakra-ui/react';

const customTheme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        backgroundColor: 'blackAlpha.500', // Buttonの背景色を指定
        color: 'whiteAlpha.800', // Buttonのテキスト色を指定
        _hover: {
          backgroundColor: 'blackAlpha.600', // Hover時の背景色を指定
        },
      },
    },
  },
});

export default customTheme;
