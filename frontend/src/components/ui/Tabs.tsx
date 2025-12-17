'use client';

import React from 'react';
import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const tabsRef = React.useRef<{ [key: string]: number }>({});
  const valuesRef = React.useRef<string[]>([]);

  // Handle controlled and uncontrolled modes
  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    if (onValueChange && valuesRef.current[index]) {
      onValueChange(valuesRef.current[index]);
    }
  };

  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={handleTabChange}>
      <div className={clsx("space-y-4", className)}>
        {children}
      </div>
    </Tab.Group>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <Tab.List className={clsx(
      "flex space-x-1 rounded-xl bg-gray-100 p-1",
      className
    )}>
      {children}
    </Tab.List>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabsTrigger({ value, children, className, disabled }: TabsTriggerProps) {
  return (
    <Tab
      disabled={disabled}
      className={({ selected }) => clsx(
        "w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50",
        selected
          ? "bg-white shadow text-blue-600"
          : "text-gray-600 hover:bg-white/[0.12] hover:text-gray-700",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </Tab>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  return (
    <Tab.Panel
      className={clsx(
        "rounded-xl p-3 focus:outline-none",
        className
      )}
    >
      {children}
    </Tab.Panel>
  );
}

export default Tabs;