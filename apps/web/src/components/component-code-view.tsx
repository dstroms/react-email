import * as React from "react";
import * as Select from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardIcon,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import type {
  CodeVariant,
  ImportedComponent,
} from "@/app/components/get-components";
import { useStoredState } from "@/hooks/use-stored-state";
import { CodeBlock } from "./code-block";
import { TabTrigger } from "./tab-trigger";

type ReactCodeVariant = Exclude<CodeVariant, "html" | "react">;

const srcAttributeRegex = /src\s*=\s*"(?<URI>\/static.+)"/gm;

export const ComponentCodeView = ({
  component,
}: {
  component: ImportedComponent;
}) => {
  const [selectedReactCodeVariant, setSelectedReactCodeVariant] =
    useStoredState<ReactCodeVariant>("code-variant", "tailwind");

  const [selectedLanguage, setSelectedLanguage] = useStoredState<
    "html" | "react"
  >("code-language", "react");

  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  let code = component.code.html;
  if (
    selectedLanguage === "react" &&
    selectedReactCodeVariant in component.code
  ) {
    // Resets the regex so that it doesn't break in subsequent runs
    srcAttributeRegex.lastIndex = 0;
    code = component.code[selectedReactCodeVariant] ?? "";
  }
  code = code.replaceAll(
    srcAttributeRegex,
    (_match, uri) => `src="https://react.email${uri}"`,
  );

  const onCopy = () => {
    void navigator.clipboard.writeText(code);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  const handleKeyUp: React.KeyboardEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      onCopy();
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-2 bg-slate-3">
      <div className="relative flex w-full justify-between gap-4 border-b border-solid border-slate-4 p-4 text-xs">
        <Tabs.Root
          defaultValue={selectedLanguage}
          onValueChange={(v) => {
            setSelectedLanguage(v as "react" | "html");
          }}
          value={selectedLanguage}
        >
          <Tabs.List className="p1-text-xs flex w-fit space-x-1 overflow-hidden">
            <TabTrigger
              activeView={selectedLanguage}
              layoutId={`${component.slug}-language`}
              value="react"
            >
              React
            </TabTrigger>
            <TabTrigger
              activeView={selectedLanguage}
              layoutId={`${component.slug}-language`}
              value="html"
            >
              HTML
            </TabTrigger>
          </Tabs.List>
        </Tabs.Root>
        <div className="flex gap-2">
          {selectedLanguage === "react" ? (
            <ReactVariantSelect
              onChange={(newValue) => {
                localStorage.setItem("code-variant", newValue);
                setSelectedReactCodeVariant(newValue);
              }}
              value={selectedReactCodeVariant}
            />
          ) : null}
          <button
            aria-label="Copy code"
            className="flex h-8 w-8 items-center justify-center rounded-sm outline-0 focus-within:ring-2 focus-within:ring-slate-6 focus-within:ring-opacity-50"
            onClick={onCopy}
            onKeyUp={handleKeyUp}
            tabIndex={0}
            type="button"
          >
            {isCopied ? <CheckIcon size={16} /> : <ClipboardIcon size={16} />}
          </button>
        </div>
      </div>
      <div className="h-full w-full overflow-auto">
        <CodeBlock language={selectedLanguage === "html" ? "html" : "tsx"}>
          {code}
        </CodeBlock>
      </div>
    </div>
  );
};

const ReactVariantSelect = ({
  value,
  onChange,
}: {
  value: ReactCodeVariant;
  onChange: (newValue: ReactCodeVariant) => void;
}) => {
  return (
    <Select.Root
      onValueChange={(variant: ReactCodeVariant) => {
        onChange(variant);
      }}
      value={value}
    >
      <Select.Trigger
        aria-label="Choose the styling solution"
        className="flex h-8 items-center justify-center gap-1 rounded bg-slate-3 px-3 leading-none outline-none focus-within:ring-2 focus-within:ring-slate-6 focus-within:ring-opacity-50 data-[placeholder]:text-slate-11"
      >
        <Select.Value>
          {(() => {
            if (value === "tailwind") {
              return "Tailwind CSS";
            }

            return "Inline CSS";
          })()}
        </Select.Value>
        <Select.Icon>
          <ChevronDownIcon size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-[2] overflow-hidden rounded-md bg-[#1F2122]">
          <Select.ScrollUpButton className="flex h-6 cursor-default items-center justify-center">
            <ChevronUpIcon size={12} />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-1">
            {["tailwind", "inline-styles"].map((variant) => (
              <Select.Item
                className="relative flex h-8 cursor-pointer select-none items-center rounded-[.25rem] px-6 py-2 text-xs leading-none text-slate-11 transition-colors ease-[cubic-bezier(.36,.66,.6,1)] data-[disabled]:pointer-events-none data-[highlighted]:bg-slate-3 data-[highlighted]:text-slate-12 data-[highlighted]:outline-none"
                key={variant}
                value={variant}
              >
                <Select.ItemText>
                  {(() => {
                    if (variant === "tailwind") {
                      return "Tailwind CSS";
                    }

                    return "Inline CSS";
                  })()}
                </Select.ItemText>
                <Select.ItemIndicator className="absolute left-0 inline-flex w-6 items-center justify-center text-slate-12">
                  <CheckIcon size={10} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
