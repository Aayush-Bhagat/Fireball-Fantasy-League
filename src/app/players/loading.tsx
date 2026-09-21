import { ViewPlayersSkeleton } from "@/components/loaders/ViewPlayersSkeleton";

export default function Loading() {
    return (
        <div className="pt-16">
            <ViewPlayersSkeleton />;
        </div>
    );
}
