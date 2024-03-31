import { Timestamp } from "firebase-admin/firestore";

export const dwayneTypes = ["none", "yoda", "duck", "gnome", "pika"] as const;
export type DwayneType = typeof dwayneTypes[number];

export const dwayneColors = ["none", "white", "black", "mate-blue", "red", "shiny", "blurple"] as const;
export type DwayneColor = typeof dwayneColors[number];


export const dwayneNames: Record<DwayneType, string> = {
    duck: "Dwayne the Duck Johnson",
    gnome: "Dwayne the Gnome Johnson",
    none: "Dwayne the unknown Johnson",
    yoda: "Dwayne the Jedi Johnson",
    pika: "Pika Johnson",
}

export interface Dwayne {
    code: string,
    number: number,
    scans: string[],
    type: DwayneType,
    color: DwayneColor,
    hasImage: boolean,
    finds: number,
    imageUrl?: string,
}

export interface Scan {
    class: string,
    classID: string,
    time: Timestamp,
    code: string,
    name: string,
    comment: string,
    index: number,
}