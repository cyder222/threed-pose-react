import {
  Box,
  FormControl,
  FormLabel,
  Select,
  Input,
  Radio,
  RadioGroup,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import React, { useState } from 'react';

interface ControlNetSettingProps {
  index: number;
}
export const ControlNetSetting = ({ index }: ControlNetSettingProps): JSX.Element => {
  const [imageSource, setImageSource] = useState('3dView');

  return (
    <Box>
      <FormControl id={`controlNetMode${index}`} my={4}>
        <FormLabel>コントロールネットモード{index + 1}</FormLabel>
        <Select name={`controlNetMode${index}`}>
          <option value='openpose-body'>Openpose (本体のみ)</option>
          <option value='openpose-body-hand'>Openpose (手を含む)</option>
          <option value='openpose-body-face'>Openpose (顔を含む)</option>
          <option value='openpose-body-hand-face'>Openpose (手も顔も含む)</option>
          <option value='depth'>Depth</option>
          <option value='canny'>Canny</option>
          <option value='tile'>Tile</option>
        </Select>
      </FormControl>

      <FormControl id={`imageSource${index}`} my={4}>
        <FormLabel>画像ソース{index + 1}</FormLabel>
        <RadioGroup
          name={`imageSource${index}`}
          defaultValue='3dView'
          onChange={setImageSource}>
          <Radio value='3dView'>3D View</Radio>
          <Radio value='previousFrame'>1フレーム前の出力</Radio>
          <Radio value='firstFrame'>最初のフレームの出力</Radio>
          <Radio value='custom'>指定画像</Radio>
        </RadioGroup>
        {imageSource === 'custom' && (
          <Input type='file' name={`customImage${index}`} mt={2} />
        )}
      </FormControl>

      <FormControl id={`weight${index}`} my={4}>
        <FormLabel>Weight{index + 1}</FormLabel>
        <NumberInput min={0} max={1} step={0.01} defaultValue={1}>
          <NumberInputField name={`weight${index}`} />
        </NumberInput>
      </FormControl>

      <FormControl id={`startFrame${index}`} my={4}>
        <FormLabel>開始フレーム{index + 1}</FormLabel>
        <NumberInput min={0} defaultValue={0}>
          <NumberInputField name={`startFrame${index}`} />
        </NumberInput>
      </FormControl>

      <FormControl id={`endFrame${index}`} my={4}>
        <FormLabel>終了フレーム{index + 1}</FormLabel>
        <NumberInput min={0} defaultValue={100}>
          <NumberInputField name={`endFrame${index}`} />
        </NumberInput>
      </FormControl>
    </Box>
  );
};
