import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { children: 'Continue' } };
export const Loading: Story = { args: { children: 'Continue', loading: true } };
export const Disabled: Story = { args: { children: 'Continue', disabled: true } };
export const Success: Story = { args: { children: 'Saved', variant: 'primary' } };
export const Error: Story = { args: { children: 'Retry', variant: 'ghost' } };
export const Empty: Story = { args: { children: 'No actions', disabled: true, variant: 'ghost' } };
