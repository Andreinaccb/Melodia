import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SelectOption {
  value: string;
  label: string;
}

interface PremiumSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export default function PremiumSelect({ value, onValueChange, options, placeholder }: PremiumSelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Select.Root value={value} onValueChange={onValueChange} open={open} onOpenChange={setOpen}>
      <Select.Trigger
        className="flex h-14 w-full items-center justify-between rounded-2xl border border-[#F3D6E4] bg-white px-5 text-[15px] font-medium text-[#2E2138] shadow-sm transition-all duration-200 hover:border-[#FF4F8B] hover:shadow-[0_0_0_4px_rgba(255,79,139,0.08)] focus:border-[#FF4F8B] focus:shadow-[0_0_0_6px_rgba(255,79,139,0.12)] focus:outline-none data-[placeholder]:text-[#9A90A5] cursor-pointer"
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="transition-transform duration-300" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown className="h-[18px] w-[18px] text-[#A594AF]" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className="z-[99999] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[18px] border border-[#F3D6E4] bg-white/95 p-2 shadow-[0_24px_70px_rgba(25,20,40,0.20)] backdrop-blur-[8px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 duration-180 ease-out"
        >
          <Select.Viewport className="p-1 max-h-[300px] select-viewport">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="relative flex h-[46px] w-full cursor-pointer select-none items-center rounded-xl px-4 text-[14px] font-medium text-[#3A3045] outline-none transition-colors duration-150 hover:bg-[#FFF1F7] hover:text-[#FF3F81] focus:bg-[#FFF1F7] focus:text-[#FF3F81] data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#FFE3EF] data-[state=checked]:to-[#FFF6FA] data-[state=checked]:text-[#FF2F73]"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-4 inline-flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#FF2F73]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-white text-brand-pink">
            <ChevronDown className="h-4 w-4" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
