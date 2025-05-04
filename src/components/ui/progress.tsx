"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

function Progress({
    className,
    value = 0,
    ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { value: number }) {
    // Decide gradient based on value
    const gradient =
        value < 34
            ? "bg-gradient-to-r from-red-500 to-red-400"
            : value < 67
            ? "bg-gradient-to-r from-red-500 to-yellow-400"
            : "bg-gradient-to-r from-red-500 via-yellow-400 to-green-500";

    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn(
                "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
                className
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn("h-full transition-all", gradient)}
                style={{ width: `${value}%` }}
            />
        </ProgressPrimitive.Root>
    );
}

export { Progress };
