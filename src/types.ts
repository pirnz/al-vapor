export interface Batch {
    index: number;
    ingredients: string;
    time: number;
    totalTime: number;
};
export interface Veggie {
    id: number;
    icon: string;
    name: string;
    time: number;
    checked: boolean;
}
export interface Opts {
    heatPower: number;
    tolerance: number;
    veggies: Veggie[];
}
