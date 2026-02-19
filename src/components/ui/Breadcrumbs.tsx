import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className={`flex items-center text-2xs ${className}`}>
            <ol className="flex items-center flex-wrap gap-2 text-white/60">
                {/* Mobile: Show only "Back to parent" */}
                <li className="md:hidden flex items-center">
                    {items.length > 1 && items[items.length - 2].href ? (
                        <Link
                            href={items[items.length - 2].href!}
                            className="flex items-center gap-1 hover:text-accent transition-colors"
                            aria-label={`Volver a ${items[items.length - 2].label}`}
                        >
                            <ChevronRight className="w-3 h-3 rotate-180" aria-hidden="true" />
                            <span className="truncate max-w-[150px]">
                                {items[items.length - 2].label}
                            </span>
                        </Link>
                    ) : (
                        <Link href="/" className="hover:text-accent">
                            <Home className="w-3 h-3" />
                        </Link>
                    )}
                </li>

                {/* Desktop: Full path */}
                <li className="hidden md:flex items-center">
                    <Link href="/" className="hover:text-accent transition-colors" aria-label="Volver al Inicio">
                        <Home className="w-3 h-3" aria-hidden="true" />
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="hidden md:flex items-center">
                            <ChevronRight className="w-3 h-3 mx-1 text-white/40" aria-hidden="true" />
                            {isLast ? (
                                <span className="text-white font-medium" aria-current="page">
                                    {item.label}
                                </span>
                            ) : item.href ? (
                                <Link
                                    href={item.href}
                                    className="hover:text-accent transition-colors truncate max-w-[200px]"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-white/60">{item.label}</span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
