'use client';

import DashboardLayoutUsers from "@/components/Layouts/DashboardLayoutUsers";

export default function DashboardPage() {
    return (
        <DashboardLayoutUsers>
            <section className="w-full h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-2xl font-bold text-center">Dashboard</h1>

                    <p className="text-center text-sm">
                        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam perferendis facilis, recusandae doloremque voluptate dolores. Reiciendis ad saepe incidunt at nihil aut quibusdam quae earum officia nisi, sint facere ullam.
                    </p>
                </div>
            </section>
        </DashboardLayoutUsers>
    );
}