"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter();
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-green-200 p-6",
                className
            )}
            {...props}
        >
            <Card className="w-full max-w-md border-4 border-yellow-400 shadow-xl bg-white/90 rounded-xl">
                <CardHeader>
                    <CardTitle className="text-red-600 text-2xl font-mario">
                        Fireball Fantasy League Login
                    </CardTitle>
                    <CardDescription className="text-gray-700">
                        Enter your email below to login to your fantasy team.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-blue-800 font-semibold"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="mario@example.com"
                                    required
                                    className="rounded-lg border-red-300 focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-blue-800 font-semibold"
                                >
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    className="rounded-lg border-red-300 focus:ring-2 focus:ring-red-400"
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg"
                                    onClick={() => router.push("/")}
                                >
                                    ⚾ Login
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
