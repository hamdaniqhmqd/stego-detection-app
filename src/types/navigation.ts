import { JSX } from "react";

export interface NavigationItem {
    name: string;
    href?: string;
    icon?: JSX.Element;
}