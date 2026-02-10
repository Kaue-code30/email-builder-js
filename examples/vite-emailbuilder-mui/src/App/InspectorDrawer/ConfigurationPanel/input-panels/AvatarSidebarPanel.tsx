import React, { useState } from 'react';
import { ZodError } from 'zod';

import { AspectRatioOutlined } from '@mui/icons-material';
import { ToggleButton } from '@mui/material';
import { AvatarProps, AvatarPropsDefaults, AvatarPropsSchema } from '@usewaypoint/block-avatar';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import RadioGroupInput from './helpers/inputs/RadioGroupInput';
import SliderInput from './helpers/inputs/SliderInput';
import TextInput from './helpers/inputs/TextInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type AvatarSidebarPanelProps = {
  data: AvatarProps;
  setData: (v: AvatarProps) => void;
};
export default function AvatarSidebarPanel({ data, setData }: AvatarSidebarPanelProps) {
  const [, setErrors] = useState<ZodError | null>(null);
  const updateData = (d: unknown) => {
    const res = AvatarPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const size = data.props?.size ?? AvatarPropsDefaults.size;
  const imageUrl = data.props?.imageUrl ?? AvatarPropsDefaults.imageUrl;
  const alt = data.props?.alt ?? AvatarPropsDefaults.alt;
  const shape = data.props?.shape ?? AvatarPropsDefaults.shape;

  return (
    <BaseSidebarPanel title="Configuração do Avatar">
      <SliderInput
        label="Tamanho"
        iconLabel={<AspectRatioOutlined sx={{ color: 'text.secondary' }} />}
        units="px"
        step={3}
        min={32}
        max={256}
        defaultValue={size}
        onChange={(size) => {
          updateData({ ...data, props: { ...data.props, size } });
        }}
      />
      <RadioGroupInput
        label="Formato"
        defaultValue={shape}
        onChange={(shape) => {
          updateData({ ...data, props: { ...data.props, shape } });
        }}
      >
        <ToggleButton value="circle">Círculo</ToggleButton>
        <ToggleButton value="square">Quadrado</ToggleButton>
        <ToggleButton value="rounded">Arredondado</ToggleButton>
      </RadioGroupInput>
      <TextInput
        label="URL da imagem"
        defaultValue={imageUrl}
        onChange={(imageUrl) => {
          updateData({ ...data, props: { ...data.props, imageUrl } });
        }}
      />
      <TextInput
        label="Texto alternativo"
        defaultValue={alt}
        onChange={(alt) => {
          updateData({ ...data, props: { ...data.props, alt } });
        }}
      />

      <MultiStylePropertyPanel
        names={['textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
