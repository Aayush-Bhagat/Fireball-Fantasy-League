import * as React from "react";
import { NumberField } from "@base-ui-components/react/number-field";

export default function AdminNumberField() {
    const id = React.useId();
    return (
        <NumberField.Root
            id={id}
            defaultValue={0}
            min={0}
            className="flex flex-col items-center gap-1"
        >
            <NumberField.ScrubArea className="cursor-ew-resize">
                <label
                    htmlFor={id}
                    className="cursor-ew-resize text-sm font-medium text-gray-900"
                ></label>
                <NumberField.ScrubAreaCursor className="drop-shadow-[0_1px_1px_#0008] filter">
                    <CursorGrowIcon />
                </NumberField.ScrubAreaCursor>
            </NumberField.ScrubArea>

            <NumberField.Group className="flex">
                <NumberField.Decrement className="flex items-center justify-center rounded-l-md border border-gray-300 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 p-2 text-gray-900">
                    <MinusIcon />
                </NumberField.Decrement>
                <NumberField.Input className="h-10 w-10 text-center text-lg border-t border-b border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-none" />
                <NumberField.Increment className="flex items-center justify-center rounded-r-md border border-gray-300 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 p-2 text-gray-900">
                    <PlusIcon />
                </NumberField.Increment>
            </NumberField.Group>
        </NumberField.Root>
    );
}

function CursorGrowIcon(props: React.ComponentProps<"svg">) {
    return (
        <svg
            width="26"
            height="14"
            viewBox="0 0 24 14"
            fill="black"
            stroke="white"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
        </svg>
    );
}

function PlusIcon(props: React.ComponentProps<"svg">) {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentcolor"
            strokeWidth="1.6"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M0 5H5M10 5H5M5 5V0M5 5V10" />
        </svg>
    );
}

function MinusIcon(props: React.ComponentProps<"svg">) {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentcolor"
            strokeWidth="1.6"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M0 5H10" />
        </svg>
    );
}
